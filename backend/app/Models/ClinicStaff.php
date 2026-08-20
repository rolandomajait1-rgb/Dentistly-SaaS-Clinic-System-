<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Sanctum\HasApiTokens;

use App\Traits\BelongsToClinic;

class ClinicStaff extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens, BelongsToClinic;

    protected $table = 'clinic_staff';

    protected $fillable = [
        'clinic_id',
        'name',
        'email',
        'password',
        'role',
        'permissions',
        'is_active',
        'email_verified_at',
        'verification_token',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'permissions' => 'array',
        'is_active' => 'boolean',
        'email_verified_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the clinic that owns the staff.
     */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Check if staff is active
     */
    public function isActive(): bool
    {
        return $this->is_active;
    }

    /**
     * Check if staff is owner
     */
    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Check if staff is admin
     */
    public function isAdmin(): bool
    {
        return in_array($this->role, ['owner', 'admin']);
    }

    /**
     * Check if staff has permission
     */
    public function hasPermission(string $permission): bool
    {
        if ($this->isOwner()) {
            return true;
        }

        return in_array($permission, $this->permissions ?? []);
    }
}
