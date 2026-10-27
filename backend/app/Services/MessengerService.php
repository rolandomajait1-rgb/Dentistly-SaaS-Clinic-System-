<?php

namespace App\Services;

use App\Models\FbPageIntegration;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MessengerService
{
    protected string $apiVersion = 'v21.0';
    protected string $baseUrl = 'https://graph.facebook.com';

    /**
     * Send text message to user
     */
    public function sendTextMessage(string $recipientId, string $message, FbPageIntegration $integration, ?string $tag = null): bool
    {
        try {
            $payload = [
                'recipient' => ['id' => $recipientId],
                'message' => ['text' => $message],
                'access_token' => $integration->page_access_token,
            ];

            if ($tag) {
                $payload['messaging_type'] = 'MESSAGE_TAG';
                $payload['tag'] = $tag;
            }

            $response = Http::timeout(5)
                ->withoutVerifying()
                ->post("{$this->baseUrl}/{$this->apiVersion}/me/messages", $payload);

            if ($response->successful()) {
                Log::info('Message sent successfully', [
                    'recipient_id' => $recipientId,
                    'clinic_id' => $integration->clinic_id,
                    'tag' => $tag,
                ]);
                return true;
            }

            // If sending with tag failed, retry once without tag (standard message)
            if ($tag) {
                Log::warning('Sending text message with tag failed, attempting fallback without tag', [
                    'recipient_id' => $recipientId,
                    'tag' => $tag,
                    'response' => $response->json() ?? $response->body(),
                ]);
                unset($payload['messaging_type'], $payload['tag']);
                $retryResponse = Http::timeout(5)
                    ->withoutVerifying()
                    ->post("{$this->baseUrl}/{$this->apiVersion}/me/messages", $payload);

                if ($retryResponse->successful()) {
                    Log::info('Text message sent successfully on fallback without tag', [
                        'recipient_id' => $recipientId,
                        'clinic_id' => $integration->clinic_id,
                    ]);
                    return true;
                }
            }

            Log::error('Failed to send message', [
                'recipient_id' => $recipientId,
                'response' => $response->json(),
            ]);
            return false;

        } catch (\Exception $e) {
            Log::error('Exception sending message', [
                'recipient_id' => $recipientId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send message with quick replies (buttons)
     */
    public function sendQuickReplies(string $recipientId, string $text, array $quickReplies, FbPageIntegration $integration, ?string $tag = null): bool
    {
        try {
            // Messenger limits: max 13 quick replies, each title max 20 chars
            $formattedReplies = array_map(function ($reply) {
                return [
                    'content_type' => 'text',
                    'title' => mb_substr($reply['title'] ?? '', 0, 20),
                    'payload' => $reply['payload'] ?? '',
                ];
            }, array_slice($quickReplies, 0, 13));

            $payload = [
                'recipient' => ['id' => $recipientId],
                'message' => [
                    'text' => mb_substr($text, 0, 2000),
                    'quick_replies' => $formattedReplies,
                ],
                'access_token' => $integration->page_access_token,
            ];

            if ($tag) {
                $payload['messaging_type'] = 'MESSAGE_TAG';
                $payload['tag'] = $tag;
            }

            $response = Http::timeout(5)
                ->withoutVerifying()
                ->post("{$this->baseUrl}/{$this->apiVersion}/me/messages", $payload);

            if ($response->successful()) {
                Log::info('Quick replies sent successfully', [
                    'recipient_id' => $recipientId,
                    'clinic_id' => $integration->clinic_id,
                    'tag' => $tag,
                ]);
                return true;
            }

            // If sending with tag failed, retry once without tag (standard message)
            if ($tag) {
                Log::warning('Sending quick replies with tag failed, attempting fallback without tag', [
                    'recipient_id' => $recipientId,
                    'tag' => $tag,
                    'response' => $response->json() ?? $response->body(),
                ]);
                unset($payload['messaging_type'], $payload['tag']);
                $retryResponse = Http::timeout(5)
                    ->withoutVerifying()
                    ->post("{$this->baseUrl}/{$this->apiVersion}/me/messages", $payload);

                if ($retryResponse->successful()) {
                    Log::info('Quick replies sent successfully on fallback without tag', [
                        'recipient_id' => $recipientId,
                        'clinic_id' => $integration->clinic_id,
                    ]);
                    return true;
                }
            }

            Log::error('Failed to send quick replies', [
                'recipient_id' => $recipientId,
                'status' => $response->status(),
                'response' => $response->json() ?? $response->body(),
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('Exception sending quick replies', [
                'recipient_id' => $recipientId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send message with buttons
     */
    public function sendButtonMessage(string $recipientId, string $text, array $buttons, FbPageIntegration $integration, ?string $tag = null): bool
    {
        try {
            // Messenger limits: max 3 buttons, each title max 20 chars
            $formattedButtons = array_map(function ($button) {
                $title = mb_substr($button['title'] ?? '', 0, 20);
                if (isset($button['url'])) {
                    return [
                        'type' => 'web_url',
                        'title' => $title,
                        'url' => $button['url'],
                    ];
                }
                
                return [
                    'type' => 'postback',
                    'title' => $title,
                    'payload' => $button['payload'] ?? '',
                ];
            }, array_slice($buttons, 0, 3));

            // Facebook button template limit: 'text' cannot exceed 640 characters.
            // If text is longer, send the full body text first, then send buttons with a brief prompt.
            if (mb_strlen($text) > 640) {
                $this->sendTextMessage($recipientId, $text, $integration, $tag);
                $text = 'Piliin ang opsyon sa ibaba / Please choose an option below:';
            }

            $payload = [
                'recipient' => ['id' => $recipientId],
                'message' => [
                    'attachment' => [
                        'type' => 'template',
                        'payload' => [
                            'template_type' => 'button',
                            'text' => $text,
                            'buttons' => $formattedButtons,
                        ],
                    ],
                ],
                'access_token' => $integration->page_access_token,
            ];

            if ($tag) {
                $payload['messaging_type'] = 'MESSAGE_TAG';
                $payload['tag'] = $tag;
            }

            $response = Http::timeout(5)
                ->withoutVerifying()
                ->post("{$this->baseUrl}/{$this->apiVersion}/me/messages", $payload);

            if ($response->successful()) {
                Log::info('Button message sent successfully', [
                    'recipient_id' => $recipientId,
                    'clinic_id' => $integration->clinic_id,
                    'tag' => $tag,
                ]);
                return true;
            }

            // If sending with tag failed, retry once without tag (standard message)
            if ($tag) {
                Log::warning('Sending button message with tag failed, attempting fallback without tag', [
                    'recipient_id' => $recipientId,
                    'tag' => $tag,
                    'response' => $response->json() ?? $response->body(),
                ]);
                unset($payload['messaging_type'], $payload['tag']);
                $retryResponse = Http::timeout(5)
                    ->withoutVerifying()
                    ->post("{$this->baseUrl}/{$this->apiVersion}/me/messages", $payload);

                if ($retryResponse->successful()) {
                    Log::info('Button message sent successfully on fallback without tag', [
                        'recipient_id' => $recipientId,
                        'clinic_id' => $integration->clinic_id,
                    ]);
                    return true;
                }
            }

            Log::error('Failed to send button message', [
                'recipient_id' => $recipientId,
                'status' => $response->status(),
                'response' => $response->json() ?? $response->body(),
            ]);

            return false;

        } catch (\Exception $e) {
            Log::error('Exception sending button message', [
                'recipient_id' => $recipientId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send generic template (carousel)
     */
    public function sendGenericTemplate(string $recipientId, array $elements, FbPageIntegration $integration): bool
    {
        try {
            $response = Http::timeout(5)
                ->withoutVerifying()
                ->post("{$this->baseUrl}/{$this->apiVersion}/me/messages", [
                'recipient' => ['id' => $recipientId],
                'message' => [
                    'attachment' => [
                        'type' => 'template',
                        'payload' => [
                            'template_type' => 'generic',
                            'elements' => $elements,
                        ],
                    ],
                ],
                'access_token' => $integration->page_access_token,
            ]);

            return $response->successful();

        } catch (\Exception $e) {
            Log::error('Exception sending generic template', [
                'recipient_id' => $recipientId,
                'error' => $e->getMessage(),
            ]);
            return false;
        }
    }

    /**
     * Send typing indicator
     */
    public function sendTypingOn(string $recipientId, FbPageIntegration $integration): bool
    {
        try {
            $response = Http::timeout(3)
                ->withoutVerifying()
                ->post("{$this->baseUrl}/{$this->apiVersion}/me/messages", [
                'recipient' => ['id' => $recipientId],
                'sender_action' => 'typing_on',
                'access_token' => $integration->page_access_token,
            ]);

            return $response->successful();

        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Mark message as seen
     */
    public function markSeen(string $recipientId, FbPageIntegration $integration): bool
    {
        try {
            $response = Http::timeout(3)
                ->withoutVerifying()
                ->post("{$this->baseUrl}/{$this->apiVersion}/me/messages", [
                'recipient' => ['id' => $recipientId],
                'sender_action' => 'mark_seen',
                'access_token' => $integration->page_access_token,
            ]);

            return $response->successful();

        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get user profile information
     */
    public function getUserProfile(string $userId, FbPageIntegration $integration): ?array
    {
        try {
            $response = Http::timeout(5)
                ->withoutVerifying()
                ->get("{$this->baseUrl}/{$this->apiVersion}/{$userId}", [
                'fields' => 'first_name,last_name,profile_pic',
                'access_token' => $integration->page_access_token,
            ]);

            if ($response->successful()) {
                return $response->json();
            }

            return null;

        } catch (\Exception $e) {
            Log::error('Exception getting user profile', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }
}
