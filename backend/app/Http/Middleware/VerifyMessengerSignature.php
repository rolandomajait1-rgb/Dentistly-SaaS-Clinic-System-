<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyMessengerSignature
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $signature = $request->header('x-hub-signature-256');

        if (!$signature) {
            \Illuminate\Support\Facades\Log::warning('Messenger webhook missing signature.');
            return response('Forbidden', 403);
        }

        $appSecret = config('services.facebook.app_secret', env('MESSENGER_APP_SECRET'));

        if (!$appSecret) {
            \Illuminate\Support\Facades\Log::error('MESSENGER_APP_SECRET is not configured.');
            return response('Internal Server Error', 500);
        }

        // Facebook sends signature as sha256=...
        $expectedSignature = 'sha256=' . hash_hmac('sha256', $request->getContent(), $appSecret);

        if (!hash_equals($expectedSignature, $signature)) {
            \Illuminate\Support\Facades\Log::warning('Messenger webhook signature mismatch.', [
                'expected' => $expectedSignature,
                'actual' => $signature,
            ]);
            return response('Forbidden', 403);
        }

        return $next($request);
    }
}
