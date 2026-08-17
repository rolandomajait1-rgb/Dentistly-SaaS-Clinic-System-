<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\BelongsToClinic;

class ChatSession extends Model
{
    use HasFactory, BelongsToClinic;

    protected $fillable = [
        'clinic_id',
        'patient_id',
        'fb_messenger_id',
        'session_id',
        'current_step',
        'context_data',
        'last_interaction_at',
    ];

    protected $casts = [
        'context_data' => 'array',
        'last_interaction_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Update session step and context
     */
    public function updateStep(string $step, array $contextData = []): void
    {
        $this->update([
            'current_step' => $step,
            'context_data' => array_merge($this->context_data ?? [], $contextData),
            'last_interaction_at' => now(),
        ]);
    }

    /**
     * Get context value
     */
    public function getContext(string $key, $default = null)
    {
        return data_get($this->context_data, $key, $default);
    }

    /**
     * Set context value
     */
    public function setContext(string $key, $value): void
    {
        $contextData = $this->context_data ?? [];
        data_set($contextData, $key, $value);
        
        $this->update([
            'context_data' => $contextData,
            'last_interaction_at' => now(),
        ]);
    }

    /**
     * Clear context (keeps patient_id so returning users are still recognized)
     */
    public function clearContext(): void
    {
        $this->update([
            'context_data' => [],
            'current_step' => 'main_menu',
        ]);
    }

    /**
     * Check if session is expired (inactive for 30 minutes)
     * ✅ Null-safe: last_interaction_at may be null on brand-new sessions
     */
    public function isExpired(): bool
    {
        if (!$this->last_interaction_at) {
            return false;
        }
        return $this->last_interaction_at->diffInMinutes(now()) > 30;
    }
}
