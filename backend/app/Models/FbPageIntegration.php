<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\BelongsToClinic;

class FbPageIntegration extends Model
{
    use HasFactory, BelongsToClinic;

    protected $fillable = [
        'clinic_id',
        'fb_page_id',
        'fb_page_name',
        'page_access_token',
        'webhook_verify_token',
        'is_active',
        'connected_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'connected_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected $hidden = [
        'page_access_token',
        'webhook_verify_token',
    ];

    /**
     * Get the clinic that owns the integration.
     */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Check if integration is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }
}
