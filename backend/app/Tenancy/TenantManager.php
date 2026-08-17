<?php

namespace App\Tenancy;

use App\Models\Clinic;
use App\Models\Tenant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class TenantManager
{
    /**
     * Resolve and activate the current clinic tenant from request.
     */
    public function resolveTenantFromRequest(Request $request): ?Clinic
    {
        $clinic = null;

        // 1. Check authenticated user's clinic
        if ($request->user() && isset($request->user()->clinic_id)) {
            $clinic = Clinic::find($request->user()->clinic_id);
        }

        // 2. Check X-Clinic-ID or X-Tenant-ID Header
        if (!$clinic && ($request->header('X-Clinic-ID') || $request->header('X-Tenant-ID'))) {
            $id = $request->header('X-Clinic-ID') ?: $request->header('X-Tenant-ID');
            $clinic = Clinic::find($id);
        }

        // 3. Check Subdomain / Host
        if (!$clinic) {
            $host = $request->getHost();
            $subdomain = explode('.', $host)[0] ?? null;

            if ($subdomain && !in_array($subdomain, ['localhost', '127', 'admin', 'superadmin', 'api'])) {
                $tenant = Tenant::where('subdomain', $subdomain)->first();
                if ($tenant) {
                    $clinic = $tenant->clinics()->first();
                }
            }
        }

        // 4. Fallback: Default first active clinic in development
        if (!$clinic && app()->environment('local')) {
            $clinic = Clinic::where('status', 'active')->first() ?: Clinic::first();
        }

        if ($clinic) {
            TenantContext::setClinic($clinic);
            $this->applyTenantSchema($clinic);
        }

        return $clinic;
    }

    /**
     * Switch PostgreSQL search_path or schema if running on Postgres.
     */
    public function applyTenantSchema(Clinic $clinic): void
    {
        try {
            $connection = config('database.default');
            if ($connection === 'pgsql') {
                $schemaName = 'clinic_' . $clinic->id . '_schema';
                DB::statement("SET search_path TO {$schemaName}, public");
            }
        } catch (\Throwable $e) {
            Log::warning("Tenant schema switch skipped: " . $e->getMessage());
        }
    }
}
