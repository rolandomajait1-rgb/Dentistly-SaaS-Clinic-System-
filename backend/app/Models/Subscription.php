<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class Subscription extends Model
{
    use HasFactory;

    protected $fillable = [
        'clinic_id',
        'subscription_plan_id',
        'status',
        'start_date',
        'end_date',
        'trial_ends_at',
        'next_billing_date',
        'appointments_used',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'trial_ends_at' => 'date',
        'next_billing_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the clinic that owns the subscription.
     */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Get the subscription plan.
     */
    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id');
    }

    /**
     * Check if subscription is active
     */
    public function isActive(): bool
    {
        return in_array($this->status, ['active', 'trial']) 
            && $this->end_date >= Carbon::today();
    }

    /**
     * Check if subscription is in trial
     */
    public function isTrial(): bool
    {
        return $this->status === 'trial' 
            && $this->trial_ends_at 
            && $this->trial_ends_at >= Carbon::today();
    }

    /**
     * Check if subscription is expired
     */
    public function isExpired(): bool
    {
        return $this->end_date < Carbon::today();
    }

    /**
     * Check if appointment limit is reached
     */
    public function hasReachedAppointmentLimit(): bool
    {
        // The system is currently free with unlimited appointments during the beta release.
        return false;
    }

    /**
     * Increment appointments used
     */
    public function incrementAppointmentsUsed(): void
    {
        $this->increment('appointments_used');
    }
}
