<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyFacebookSignature
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Payagan ang GET requests dahil ginagamit ito ni Facebook para sa initial verification
        if ($request->isMethod('get')) {
            return $next($request);
        }

        $signature = $request->header('X-Hub-Signature-256');
        
        if (!$signature) {
            abort(403, 'Missing Facebook signature header');
        }

        $expectedSignature = 'sha256=' . hash_hmac(
            'sha256', 
            $request->getContent(), 
            (string) config('dental.facebook.app_secret', env('FACEBOOK_APP_SECRET'))
        );

        if (!hash_equals($expectedSignature, $signature)) {
            abort(403, 'Invalid Facebook signature');
        }

        return $next($request);
    }
}