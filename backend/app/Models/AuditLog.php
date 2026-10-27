<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Traits\BelongsToClinic;

class AuditLog extends Model
{
    use BelongsToClinic;

    public $timestamps = false;

    protected $table = 'audit_logs';

    protected $fillable = [
        'clinic_id',
        'user_id',
        'user_type',
        'action',
        'resource_type',
        'resource_id',
        'ip_address',
        'user_agent',
        'details',
        'created_at',
    ];

    protected $casts = [
        'details' => 'array',
        'created_at' => 'datetime',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }
}
