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
    public function sendTextMessage(string $recipientId, string $message, FbPageIntegration $integration): bool
    {
        try {
            $response = Http::post("{$this->baseUrl}/{$this->apiVersion}/me/messages", [
                'recipient' => ['id' => $recipientId],
                'message' => ['text' => $message],
                'access_token' => $integration->page_access_token,
            ]);

            if ($response->successful()) {
                Log::info('Message sent successfully', [
                    'recipient_id' => $recipientId,
                    'clinic_id' => $integration->clinic_id,
                ]);
                return true;
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
    public function sendQuickReplies(string $recipientId, string $text, array $quickReplies, FbPageIntegration $integration): bool
    {
        try {
            $formattedReplies = array_map(function ($reply) {
                return [
                    'content_type' => 'text',
                    'title' => $reply['title'],
                    'payload' => $reply['payload'],
                ];
            }, $quickReplies);

            $response = Http::post("{$this->baseUrl}/{$this->apiVersion}/me/messages", [
                'recipient' => ['id' => $recipientId],
                'message' => [
                    'text' => $text,
                    'quick_replies' => $formattedReplies,
                ],
                'access_token' => $integration->page_access_token,
            ]);

            return $response->successful();

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
    public function sendButtonMessage(string $recipientId, string $text, array $buttons, FbPageIntegration $integration): bool
    {
        try {
            $formattedButtons = array_map(function ($button) {
                if (isset($button['url'])) {
                    return [
                        'type' => 'web_url',
                        'title' => $button['title'],
                        'url' => $button['url'],
                    ];
                }
                
                return [
                    'type' => 'postback',
                    'title' => $button['title'],
                    'payload' => $button['payload'],
                ];
            }, $buttons);

            $response = Http::post("{$this->baseUrl}/{$this->apiVersion}/me/messages", [
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
            ]);

            return $response->successful();

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
            $response = Http::post("{$this->baseUrl}/{$this->apiVersion}/me/messages", [
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
            $response = Http::post("{$this->baseUrl}/{$this->apiVersion}/me/messages", [
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
            $response = Http::post("{$this->baseUrl}/{$this->apiVersion}/me/messages", [
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
            $response = Http::get("{$this->baseUrl}/{$this->apiVersion}/{$userId}", [
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
