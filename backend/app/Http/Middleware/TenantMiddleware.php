<?php

namespace App\Http\Middleware;

use App\Tenancy\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TenantMiddleware
{
    protected TenantManager $tenantManager;

    public function __construct(TenantManager $tenantManager)
    {
        $this->tenantManager = $tenantManager;
    }

    /**
     * Handle an incoming request and ensure tenant context is established.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->tenantManager->resolveTenantFromRequest($request);

        return $next($request);
    }
}
