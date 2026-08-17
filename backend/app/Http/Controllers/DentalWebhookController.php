<?php

namespace App\Http\Controllers;

use App\Models\{Clinic, FbPageIntegration};
use App\Services\ChatbotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DentalWebhookController extends Controller
{
    public function __construct(
        protected ChatbotService $chatbot
    ) {}

    /**
     * Verify webhook (GET request from Facebook)
     */
    public function verify(Request $request)
    {
        $mode = $request->query('hub_mode');
        $token = $request->query('hub_verify_token');
        $challenge = $request->query('hub_challenge');

        // Get verify token from environment or use default
        $verifyToken = config('services.facebook.webhook_verify_token', 'dental_appointment_webhook_token');

        if ($mode === 'subscribe' && $token === $verifyToken) {
            Log::info('Webhook verified successfully');
            return response($challenge, 200);
        }

        Log::warning('Webhook verification failed', [
            'mode' => $mode,
            'token' => $token,
        ]);

        return response('Forbidden', 403);
    }

    /**
     * Handle incoming webhook events (POST request from Facebook)
     */
    public function handle(Request $request)
    {
        $data = $request->all();

        Log::info('Webhook received, dispatching job');

        // Verify this is a page subscription
        if (($data['object'] ?? '') !== 'page') {
            return response('Not a page subscription', 404);
        }

        // Dispatch the job to process the webhook asynchronously
        \App\Jobs\ProcessMessengerWebhook::dispatch($data);

        // Always return 200 OK immediately so Facebook knows we received it
        return response('EVENT_RECEIVED', 200);
    }
}
