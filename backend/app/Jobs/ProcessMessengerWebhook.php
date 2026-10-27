<?php

namespace App\Jobs;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\{Clinic, FbPageIntegration};
use App\Services\ChatbotService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class ProcessMessengerWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 120; // 2 minutes max processing time
    public $tries = 3;

    protected array $data;

    /**
     * Create a new job instance.
     */
    public function __construct(array $data)
    {
        $this->data = $data;
    }

    /**
     * Execute the job.
     */
    public function handle(ChatbotService $chatbot): void
    {
        Log::info('Processing webhook job', ['entry_count' => count($this->data['entry'] ?? [])]);

        // Process each entry
        foreach ($this->data['entry'] as $entry) {
            $pageId = $entry['id'];

            // Find clinic by page ID
            $integration = FbPageIntegration::where('fb_page_id', $pageId)
                ->where('is_active', true)
                ->with('clinic')
                ->first();

            if (!$integration) {
                Log::warning('No integration found for page', ['page_id' => $pageId]);
                continue;
            }

            $clinic = $integration->clinic;

            // Check if clinic has active subscription
            if (!$clinic->hasActiveSubscription()) {
                Log::warning('Clinic subscription inactive', ['clinic_id' => $clinic->id]);
                continue;
            }

            // Check if clinic enabled Messenger auto-replies in settings
            $notifSettings = $clinic->notification_settings ?? [];
            if (isset($notifSettings['messenger_enabled']) && !$notifSettings['messenger_enabled']) {
                Log::info('Messenger auto-replies disabled in clinic settings', ['clinic_id' => $clinic->id]);
                continue;
            }

            // Process messaging events
            if (isset($entry['messaging'])) {
                foreach ($entry['messaging'] as $event) {
                    $this->processMessagingEvent($clinic, $event, $chatbot, $integration, $pageId);
                }
            }
        }
    }

    /**
     * Process individual messaging event
     */
    protected function processMessagingEvent(Clinic $clinic, array $event, ChatbotService $chatbot, ?FbPageIntegration $integration = null, ?string $pageId = null): void
    {
        $senderId = $event['sender']['id'] ?? null;
        if (!$senderId) {
            return;
        }

        // 1. Guard against bot responding to itself
        $fbPageId = (string) ($integration?->fb_page_id ?? $pageId);
        if ((string) $senderId === $fbPageId) {
            Log::debug('Ignoring message sent by page itself', ['sender_id' => $senderId]);
            return;
        }

        // 2. Guard against Facebook message echoes (sent when page/bot delivers a message)
        if (!empty($event['message']['is_echo'])) {
            Log::debug('Ignoring Facebook message echo', [
                'sender_id' => $senderId,
                'mid' => $event['message']['mid'] ?? null,
            ]);
            return;
        }

        // 3. Ignore delivery/read receipts
        if (isset($event['delivery']) || isset($event['read'])) {
            return;
        }

        try {
            // Handle message event
            if (isset($event['message']) && (isset($event['message']['text']) || isset($event['message']['quick_reply']))) {
                // Deduplicate incoming messages using Facebook mid
                if (!empty($event['message']['mid'])) {
                    $dedupKey = 'fb_mid_' . $event['message']['mid'];
                    if (Cache::has($dedupKey)) {
                        Log::info('Duplicate Facebook message mid ignored (retry)', [
                            'mid' => $event['message']['mid'],
                            'sender_id' => $senderId,
                        ]);
                        return;
                    }
                    Cache::put($dedupKey, true, now()->addMinutes(10));
                }

                // If it has a quick reply payload, treat it as a postback!
                if (isset($event['message']['quick_reply']) && isset($event['message']['quick_reply']['payload'])) {
                    $payload = $event['message']['quick_reply']['payload'];
                    $quickReplyDedup = 'fb_qr_' . md5($senderId . '_' . $payload . '_' . floor(time() / 5));
                    if (Cache::has($quickReplyDedup)) {
                        Log::info('Duplicate quick reply payload ignored (throttled)', [
                            'sender_id' => $senderId,
                            'payload' => $payload,
                        ]);
                        return;
                    }
                    Cache::put($quickReplyDedup, true, now()->addMinutes(2));

                    Log::info('Processing quick reply payload in job as postback', [
                        'clinic_id' => $clinic->id,
                        'sender_id' => $senderId,
                        'payload' => $payload,
                    ]);
                    $chatbot->handlePostback($clinic, $senderId, $payload, $integration);
                } else {
                    $text = $event['message']['text'] ?? '';
                    Log::info('Processing message in job', [
                        'clinic_id' => $clinic->id,
                        'sender_id' => $senderId,
                        'text' => $text,
                    ]);
                    $chatbot->handleMessage($clinic, $senderId, $text, $integration);
                }
            } elseif (isset($event['postback'])) {
                $payload = $event['postback']['payload'] ?? '';
                $rawTimestamp = $event['timestamp'] ?? null;
                // If timestamp in milliseconds is provided, normalize to a 5-second bucket; otherwise use current time bucket
                $timeBucket = $rawTimestamp ? (int) floor($rawTimestamp / 5000) : (int) floor(time() / 5);

                // Deduplicate postbacks using Facebook mid or stable time bucket
                $postbackMid = $event['postback']['mid'] ?? "{$senderId}_{$payload}_{$timeBucket}";
                $dedupKey = 'fb_postback_' . md5($postbackMid);
                if (Cache::has($dedupKey)) {
                    Log::info('Duplicate Facebook postback ignored (retry)', [
                        'key' => $dedupKey,
                        'sender_id' => $senderId,
                    ]);
                    return;
                }
                Cache::put($dedupKey, true, now()->addMinutes(10));

                Log::info('Processing postback in job', [
                    'clinic_id' => $clinic->id,
                    'sender_id' => $senderId,
                    'payload' => $payload,
                ]);

                $chatbot->handlePostback($clinic, $senderId, $payload, $integration);
            }
        } catch (\Exception $e) {
            Log::error('Error processing messaging event in job', [
                'clinic_id' => $clinic->id,
                'sender_id' => $senderId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}
