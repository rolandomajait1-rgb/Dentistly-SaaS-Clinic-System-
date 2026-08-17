<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\BelongsToClinic;

class AppointmentQueue extends Model
{
    use HasFactory, BelongsToClinic;

    protected $table = 'appointment_queue';

    protected $fillable = [
        'clinic_id',
        'appointment_id',
        'queue_number',
        'status',
        'check_in_time',
        'called_time',
        'service_start_time',
        'service_end_time',
        'estimated_wait_minutes',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'called_time' => 'datetime',
        'service_start_time' => 'datetime',
        'service_end_time' => 'datetime',
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

    public function scopeWaiting($query)
    {
        return $query->where('status', 'waiting');
    }

    public function scopeToday($query)
    {
        return $query->whereHas('appointment', function ($q) {
            $q->whereDate('appointment_date', now()->toDateString());
        });
    }
}
