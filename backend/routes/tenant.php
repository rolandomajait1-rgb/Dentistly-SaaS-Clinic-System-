<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomainOrSubdomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes (stancl/tenancy)
|--------------------------------------------------------------------------
|
| Routes here run strictly inside the active tenant's PostgreSQL Schema
| or Database context.
|
*/

Route::middleware([
    'api',
    InitializeTenancyByDomainOrSubdomain::class,
    PreventAccessFromCentralDomains::class,
])->prefix('api/tenant')->group(function () {
    Route::get('/ping', function () {
        return response()->json([
            'success' => true,
            'tenant_id' => tenant('id'),
            'schema' => config('database.default') === 'pgsql' ? 'clinic_' . tenant('id') . '_schema' : 'isolated_db',
            'message' => 'Tenant environment active and isolated.'
        ]);
    });
});
