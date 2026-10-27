<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogger
{
    /**
     * Log a HIPAA compliant audit event (EHR access, modification, export)
     */
    public static function log(
        int $clinicId,
        string $action,
        ?string $resourceType = null,
        ?int $resourceId = null,
        ?array $details = null,
        ?Request $request = null,
        ?int $userId = null,
        string $userType = 'clinic_staff'
    ): ?AuditLog {
        try {
            $req = $request ?? request();
            $effectiveUserId = $userId ?? ($req->user() ? $req->user()->id : null);

            return AuditLog::create([
                'clinic_id'     => $clinicId,
                'user_id'       => $effectiveUserId,
                'user_type'     => $userType,
                'action'        => $action,
                'resource_type' => $resourceType,
                'resource_id'   => $resourceId,
                'ip_address'    => $req ? $req->ip() : null,
                'user_agent'    => $req ? substr($req->userAgent() ?? '', 0, 500) : null,
                'details'       => $details,
                'created_at'    => now(),
            ]);
        } catch (\Throwable $e) {
            // Audit logging should never crash the main application flow
            \Illuminate\Support\Facades\Log::warning('Failed to write audit log: ' . $e->getMessage());
            return null;
        }
    }
}
