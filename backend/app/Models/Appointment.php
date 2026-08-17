<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

use App\Traits\BelongsToClinic;

class Appointment extends Model
{
    use HasFactory, BelongsToClinic;

    protected $fillable = [
        'clinic_id',
        'patient_id',
        'dental_service_id',
        'reference_number',
        'appointment_date',
        'appointment_time',
        'status',
        'queue_number',
        'approved_by',
        'approved_at',
        'reason_for_visit',
        'staff_notes',
        'cancellation_reason',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'approved_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($appointment) {
            if (empty($appointment->reference_number)) {
                $appointment->reference_number = 'APT-' . strtoupper(Str::random(10));
            }
        });
    }

    /**
     * Get the clinic that owns the appointment.
     */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Get the patient that owns the appointment.
     */
    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    /**
     * Get the service for the appointment.
     */
    public function service(): BelongsTo
    {
        return $this->belongsTo(DentalService::class, 'dental_service_id');
    }

    /**
     * Get the staff who approved the appointment.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(ClinicStaff::class, 'approved_by');
    }

    /**
     * Get the queue for the appointment.
     */
    public function queue(): HasOne
    {
        return $this->hasOne(AppointmentQueue::class);
    }

    /**
     * Get the history for the appointment.
     */
    public function history(): HasOne
    {
        return $this->hasOne(PatientHistory::class);
    }

    /**
     * Scope for pending appointments
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * Scope for confirmed appointments
     */
    public function scopeConfirmed($query)
    {
        return $query->where('status', 'confirmed');
    }

    /**
     * Scope for today's appointments
     */
    public function scopeToday($query)
    {
        return $query->whereDate('appointment_date', now()->toDateString());
    }

    /**
     * Accessor: Map database status to frontend-friendly capitalized status
     */
    public function getStatusAttribute($value)
    {
        return match ($value) {
            'pending' => 'Pending',
            'confirmed' => 'Approved',
            'checked_in' => 'Approved',
            'in_progress' => 'Serving',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            'no_show' => 'No Show',
            default => $value,
        };
    }

    /**
     * Mutator: Map frontend capitalized status back to database enum format
     */
    public function setStatusAttribute($value)
    {
        $this->attributes['status'] = match ($value) {
            'Pending', 'pending' => 'pending',
            'Approved', 'approved' => 'confirmed',
            'Serving', 'serving' => 'in_progress',
            'Completed', 'completed' => 'completed',
            'Cancelled', 'cancelled' => 'cancelled',
            'No Show', 'no_show' => 'no_show',
            default => $value,
        };
    }

    /**
     * Check if appointment can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, ['Pending', 'Approved']);
    }

    /**
     * Check if appointment can be rescheduled
     */
    public function canBeRescheduled(): bool
    {
        return in_array($this->status, ['Pending', 'Approved']);
    }
}
