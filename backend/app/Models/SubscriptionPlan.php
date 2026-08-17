<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SubscriptionPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'plan_name',
        'plan_code',
        'monthly_price',
        'appointment_limit',
        'staff_limit',
        'branch_limit',
        'features',
        'is_active',
        'trial_days',
    ];

    protected $casts = [
        'monthly_price' => 'decimal:2',
        'features' => 'array',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the subscriptions for the plan.
     */
    public function subscriptions(): HasMany
    {
        return $this->hasMany(Subscription::class);
    }

    /**
     * Check if plan has unlimited appointments
     */
    public function hasUnlimitedAppointments(): bool
    {
        return $this->appointment_limit === null;
    }

    /**
     * Check if plan has specific feature
     */
    public function hasFeature(string $feature): bool
    {
        return in_array($feature, $this->features ?? []);
    }
}
