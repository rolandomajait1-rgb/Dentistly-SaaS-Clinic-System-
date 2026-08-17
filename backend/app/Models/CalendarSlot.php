<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\BelongsToClinic;

class CalendarSlot extends Model
{
    use HasFactory, BelongsToClinic;

    protected $fillable = [
        'clinic_id',
        'slot_date',
        'slot_time',
        'status',
        'appointment_id',
        'blocked_by',
        'block_reason',
    ];

    protected $casts = [
        'slot_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function blockedBy(): BelongsTo
    {
        return $this->belongsTo(ClinicStaff::class, 'blocked_by');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }

    public function scopeForDate($query, $date)
    {
        return $query->whereDate('slot_date', $date);
    }

    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }
}
