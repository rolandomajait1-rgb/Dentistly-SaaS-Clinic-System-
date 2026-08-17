<?php

namespace App\Services;

use App\Models\FbPageIntegration;
use App\Models\Clinic;
use Illuminate\Support\Facades\Http;
use Exception;

class FacebookService
{
    private $appId;
    private $appSecret;
    private $redirectUri;
    private $apiVersion = 'v18.0';

    public function __construct()
    {
        $this->appId = config('services.facebook.app_id');
        $this->appSecret = config('services.facebook.app_secret');
        $this->redirectUri = config('services.facebook.redirect_uri');
    }

    /**
     * Get Facebook OAuth authorization URL
     */
    public function getAuthorizationUrl(string $state): string
    {
        $params = [
            'client_id' => $this->appId,
            'redirect_uri' => $this->redirectUri,
            'state' => $state,
            'scope' => 'pages_messaging,pages_read_engagement,pages_manage_metadata',
            'response_type' => 'code',
        ];

        return 'https://www.facebook.com/' . $this->apiVersion . '/dialog/oauth?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for access token
     */
    public function exchangeCodeForToken(string $code): array
    {
        try {
            $response = Http::get('https://graph.facebook.com/' . $this->apiVersion . '/oauth/access_token', [
                'client_id' => $this->appId,
                'client_secret' => $this->appSecret,
                'redirect_uri' => $this->redirectUri,
                'code' => $code,
            ]);

            if (!$response->successful()) {
                throw new Exception('Failed to exchange code for token: ' . $response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            throw new Exception('OAuth token exchange failed: ' . $e->getMessage());
        }
    }

    /**
     * Get user's Facebook pages
     */
    public function getUserPages(string $userAccessToken): array
    {
        try {
            $response = Http::get('https://graph.facebook.com/' . $this->apiVersion . '/me/accounts', [
                'access_token' => $userAccessToken,
                'fields' => 'id,name,picture,access_token,category',
            ]);

            if (!$response->successful()) {
                throw new Exception('Failed to fetch pages: ' . $response->body());
            }

            return $response->json()['data'] ?? [];
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve Facebook pages: ' . $e->getMessage());
        }
    }

    /**
     * Get page details
     */
    public function getPageDetails(string $pageId, string $pageAccessToken): array
    {
        try {
            $response = Http::get('https://graph.facebook.com/' . $this->apiVersion . '/' . $pageId, [
                'access_token' => $pageAccessToken,
                'fields' => 'id,name,picture,category',
            ]);

            if (!$response->successful()) {
                throw new Exception('Failed to fetch page details: ' . $response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve page details: ' . $e->getMessage());
        }
    }

    /**
     * Validate page access token
     */
    public function validatePageToken(string $pageId, string $pageAccessToken): bool
    {
        try {
            $response = Http::get('https://graph.facebook.com/' . $this->apiVersion . '/' . $pageId, [
                'access_token' => $pageAccessToken,
                'fields' => 'id',
            ]);

            return $response->successful();
        } catch (Exception $e) {
            return false;
        }
    }

    /**
     * Setup webhook for page
     */
    public function setupWebhook(string $pageId, string $pageAccessToken, string $webhookUrl, string $verifyToken): bool
    {
        try {
            $response = Http::post('https://graph.facebook.com/' . $this->apiVersion . '/' . $pageId . '/subscribed_apps', [
                'access_token' => $pageAccessToken,
                'subscribed_fields' => 'messages,messaging_postbacks,messaging_optins',
            ]);

            if (!$response->successful()) {
                throw new Exception('Failed to setup webhook: ' . $response->body());
            }

            return true;
        } catch (Exception $e) {
            throw new Exception('Webhook setup failed: ' . $e->getMessage());
        }
    }

    /**
     * Connect Facebook page to clinic
     */
    public function connectPage(Clinic $clinic, string $pageId, string $pageName, string $pageAccessToken, string $verifyToken): FbPageIntegration
    {
        // Validate token first
        if (!$this->validatePageToken($pageId, $pageAccessToken)) {
            throw new Exception('Invalid page access token');
        }

        // Create or update integration
        $integration = FbPageIntegration::updateOrCreate(
            ['clinic_id' => $clinic->id],
            [
                'fb_page_id' => $pageId,
                'fb_page_name' => $pageName,
                'page_access_token' => $pageAccessToken,
                'webhook_verify_token' => $verifyToken,
                'is_active' => true,
                'connected_at' => now(),
            ]
        );

        return $integration;
    }

    /**
     * Disconnect Facebook page from clinic
     */
    public function disconnectPage(Clinic $clinic): bool
    {
        $integration = FbPageIntegration::where('clinic_id', $clinic->id)->first();

        if ($integration) {
            $integration->update(['is_active' => false]);
            return true;
        }

        return false;
    }

    /**
     * Test webhook by sending a sample message
     */
    public function testWebhook(string $pageId, string $pageAccessToken): bool
    {
        try {
            $response = Http::post('https://graph.facebook.com/' . $this->apiVersion . '/' . $pageId . '/messages', [
                'access_token' => $pageAccessToken,
                'recipient' => ['id' => $pageId],
                'message' => [
                    'text' => 'Webhook test message from Dental Clinic Chatbot System',
                ],
            ]);

            return $response->successful();
        } catch (Exception $e) {
            throw new Exception('Webhook test failed: ' . $e->getMessage());
        }
    }

    /**
     * Get webhook configuration
     */
    public function getWebhookConfig(string $pageId, string $pageAccessToken): array
    {
        try {
            $response = Http::get('https://graph.facebook.com/' . $this->apiVersion . '/' . $pageId . '/subscribed_apps', [
                'access_token' => $pageAccessToken,
            ]);

            if (!$response->successful()) {
                throw new Exception('Failed to fetch webhook config: ' . $response->body());
            }

            return $response->json();
        } catch (Exception $e) {
            throw new Exception('Failed to retrieve webhook configuration: ' . $e->getMessage());
        }
    }
}
