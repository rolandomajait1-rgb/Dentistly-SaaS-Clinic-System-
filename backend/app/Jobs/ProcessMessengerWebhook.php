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

            // Process messaging events
            if (isset($entry['messaging'])) {
                foreach ($entry['messaging'] as $event) {
                    $this->processMessagingEvent($clinic, $event, $chatbot);
                }
            }
        }
    }

    /**
     * Process individual messaging event
     */
    protected function processMessagingEvent(Clinic $clinic, array $event, ChatbotService $chatbot): void
    {
        $senderId = $event['sender']['id'];

        try {
            // Handle different event types
            if (isset($event['message']) && isset($event['message']['text'])) {
                // If it has a quick reply payload, treat it as a postback!
                if (isset($event['message']['quick_reply']) && isset($event['message']['quick_reply']['payload'])) {
                    $payload = $event['message']['quick_reply']['payload'];
                    Log::info('Processing quick reply payload in job as postback', [
                        'clinic_id' => $clinic->id,
                        'sender_id' => $senderId,
                        'payload' => $payload,
                    ]);
                    $chatbot->handlePostback($clinic, $senderId, $payload);
                } else {
                    $text = $event['message']['text'];
                    Log::info('Processing message in job', [
                        'clinic_id' => $clinic->id,
                        'sender_id' => $senderId,
                        'text' => $text,
                    ]);
                    $chatbot->handleMessage($clinic, $senderId, $text);
                }
            } elseif (isset($event['postback'])) {
                $payload = $event['postback']['payload'];
                
                Log::info('Processing postback in job', [
                    'clinic_id' => $clinic->id,
                    'sender_id' => $senderId,
                    'payload' => $payload,
                ]);

                $chatbot->handlePostback($clinic, $senderId, $payload);
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
