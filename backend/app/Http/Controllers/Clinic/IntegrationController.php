<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\Clinic;
use App\Services\FacebookService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Cache, Log};
use Illuminate\Support\Str;

class IntegrationController extends Controller
{
    /**
     * Generate Facebook OAuth Authorization URL
     */
    public function getFacebookAuthUrl(Request $request)
    {
        try {
            $facebookService = new FacebookService();
            $state = Str::random(32);
            
            $clinicId = $request->user()->clinic_id;
            Cache::put("facebook_oauth_state_{$clinicId}", $state, now()->addMinutes(10));

            $authUrl = $facebookService->getAuthorizationUrl($state);

            return response()->json([
                'auth_url' => $authUrl,
                'state' => $state
            ]);
        } catch (\Exception $e) {
            Log::error('Facebook auth URL generation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to generate Facebook authorization URL',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Handle Facebook OAuth callback
     */
    public function handleFacebookCallback(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'code' => 'required|string',
            'state' => 'required|string',
        ]);

        try {
            $storedState = Cache::get("facebook_oauth_state_{$clinicId}");
            if (!$storedState || $request->state !== $storedState) {
                throw new \Exception('Invalid state parameter');
            }

            Cache::forget("facebook_oauth_state_{$clinicId}");

            $facebookService = new FacebookService();
            $tokenData = $facebookService->exchangeCodeForToken($request->code);
            $userAccessToken = $tokenData['access_token'] ?? null;

            if (!$userAccessToken) {
                throw new \Exception('Failed to obtain access token');
            }

            $pages = $facebookService->getUserPages($userAccessToken);

            if (empty($pages)) {
                throw new \Exception('No Facebook pages found for this account');
            }

            return response()->json([
                'message' => 'Facebook pages retrieved successfully',
                'pages' => $pages,
                'user_access_token' => $userAccessToken
            ]);
        } catch (\Exception $e) {
            Log::error('Facebook callback failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Facebook authentication failed',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Connect a specific Facebook page to clinic
     */
    public function connectFacebookPage(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'page_id' => 'required|string',
            'page_name' => 'required|string',
            'page_access_token' => 'required|string',
        ]);

        try {
            $clinic = Clinic::findOrFail($clinicId);
            $facebookService = new FacebookService();

            $verifyToken = 'dental_' . Str::random(32);

            $integration = $facebookService->connectPage(
                $clinic,
                $request->page_id,
                $request->page_name,
                $request->page_access_token,
                $verifyToken
            );

            try {
                $facebookService->setupWebhook(
                    $request->page_id,
                    $request->page_access_token,
                    url('/api/webhook/dental'),
                    $verifyToken
                );
            } catch (\Exception $webEx) {
                Log::error("Failed to auto-subscribe page to webhook: " . $webEx->getMessage());
            }

            return response()->json([
                'message' => 'Facebook page connected successfully',
                'integration' => $integration
            ]);
        } catch (\Exception $e) {
            Log::error('Facebook page connection failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to connect Facebook page',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Disconnect Facebook page from clinic
     */
    public function disconnectFacebookPage(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        try {
            $clinic = Clinic::findOrFail($clinicId);
            $facebookService = new FacebookService();
            $facebookService->disconnectPage($clinic);

            return response()->json([
                'message' => 'Facebook page disconnected successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Facebook page disconnection failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to disconnect Facebook page',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get Facebook page details
     */
    public function getFacebookPageDetails(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        try {
            $clinic = Clinic::with('fbPageIntegration')->findOrFail($clinicId);
            
            if (!$clinic->fbPageIntegration || !$clinic->fbPageIntegration->is_active) {
                return response()->json([
                    'message' => 'No active Facebook page integration found'
                ], 404);
            }

            $facebookService = new FacebookService();
            $pageDetails = $facebookService->getPageDetails(
                $clinic->fbPageIntegration->fb_page_id,
                $clinic->fbPageIntegration->page_access_token
            );

            return response()->json([
                'message' => 'Page details retrieved successfully',
                'page' => $pageDetails
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to get Facebook page details: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to retrieve page details',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Validate Facebook page access token
     */
    public function validateFacebookToken(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'page_id' => 'required|string',
            'page_access_token' => 'required|string',
        ]);

        try {
            $facebookService = new FacebookService();
            $isValid = $facebookService->validatePageToken(
                $request->page_id,
                $request->page_access_token
            );

            return response()->json([
                'valid' => $isValid,
                'message' => $isValid ? 'Token is valid' : 'Token is invalid'
            ]);
        } catch (\Exception $e) {
            Log::error('Token validation failed: ' . $e->getMessage());
            return response()->json([
                'valid' => false,
                'message' => 'Token validation failed',
                'error' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Test webhook connection
     */
    public function testFacebookWebhook(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        try {
            $clinic = Clinic::with('fbPageIntegration')->findOrFail($clinicId);
            
            if (!$clinic->fbPageIntegration || !$clinic->fbPageIntegration->is_active) {
                return response()->json([
                    'message' => 'No active Facebook page integration found'
                ], 404);
            }

            $facebookService = new FacebookService();
            $success = $facebookService->testWebhook(
                $clinic->fbPageIntegration->fb_page_id,
                $clinic->fbPageIntegration->page_access_token
            );

            return response()->json([
                'message' => $success ? 'Webhook test successful' : 'Webhook test failed',
                'success' => $success
            ]);
        } catch (\Exception $e) {
            Log::error('Webhook test failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Webhook test failed',
                'error' => $e->getMessage(),
                'success' => false
            ], 400);
        }
    }
}
