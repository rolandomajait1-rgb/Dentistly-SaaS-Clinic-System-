<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Clinic extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'tenant_id',
        'clinic_name',
        'owner_name',
        'email',
        'contact_number',
        'address',
        'business_permit',
        'prc_license',
        'logo_url',
        'timezone',
        'branding_settings',
        'notification_settings',
        'operating_hours',
        'status',
    ];

    protected $casts = [
        'branding_settings' => 'array',
        'notification_settings' => 'array',
        'operating_hours' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Get the tenant that owns the clinic.
     */
    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * Get the subscription for the clinic.
     */
    public function subscription(): HasOne
    {
        return $this->hasOne(Subscription::class)->latest();
    }

    /**
     * Get the active subscription for the clinic.
     */
    public function activeSubscription(): HasOne
    {
        return $this->hasOne(Subscription::class)
            ->where('status', 'active')
            ->orWhere('status', 'trial');
    }

    /**
     * Get the FB page integration for the clinic.
     */
    public function fbPageIntegration(): HasOne
    {
        return $this->hasOne(FbPageIntegration::class);
    }

    /**
     * Get the staff for the clinic.
     */
    public function staff(): HasMany
    {
        return $this->hasMany(ClinicStaff::class);
    }

    /**
     * Get the services for the clinic.
     */
    public function services(): HasMany
    {
        return $this->hasMany(DentalService::class);
    }

    /**
     * Get the patients for the clinic.
     */
    public function patients(): HasMany
    {
        return $this->hasMany(Patient::class);
    }

    /**
     * Get the appointments for the clinic.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the FAQs for the clinic.
     */
    public function faqs(): HasMany
    {
        return $this->hasMany(ClinicFaq::class);
    }

    /**
     * Check if clinic is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if clinic has active subscription
     */
    public function hasActiveSubscription(): bool
    {
        // The system is currently free for all clinics during the beta release.
        return true;
    }
}
