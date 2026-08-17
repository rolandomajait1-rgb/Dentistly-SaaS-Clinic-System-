<?php

namespace App\Tenancy;

use App\Models\Clinic;
use App\Models\Tenant;

class TenantContext
{
    private static ?Clinic $currentClinic = null;
    private static ?Tenant $currentTenant = null;

    public static function setClinic(?Clinic $clinic): void
    {
        self::$currentClinic = $clinic;
        if ($clinic && $clinic->tenant) {
            self::$currentTenant = $clinic->tenant;
        }
    }

    public static function getClinic(): ?Clinic
    {
        return self::$currentClinic;
    }

    public static function getClinicId(): ?int
    {
        return self::$currentClinic?->id;
    }

    public static function setTenant(?Tenant $tenant): void
    {
        self::$currentTenant = $tenant;
    }

    public static function getTenant(): ?Tenant
    {
        return self::$currentTenant;
    }

    public static function clear(): void
    {
        self::$currentClinic = null;
        self::$currentTenant = null;
    }
}
