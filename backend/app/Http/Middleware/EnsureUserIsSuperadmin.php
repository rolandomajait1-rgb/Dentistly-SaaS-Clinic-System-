<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsSuperadmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_superadmin) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Unauthorized. Superadmin access required.'
        ], 403);
    }
}

