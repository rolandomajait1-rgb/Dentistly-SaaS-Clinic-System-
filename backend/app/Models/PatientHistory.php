<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

use App\Traits\BelongsToClinic;

class PatientHistory extends Model
{
    use HasFactory, BelongsToClinic;

    protected $table = 'patient_history';

    protected $fillable = [
        'clinic_id',
        'patient_id',
        'appointment_id',
        'dental_service_id',
        'service_provided',
        'diagnosis',
        'treatment',
        'prescription',
        'doctor_notes',
        'amount_charged',
        'service_date',
        'performed_by',
        'next_visit_date',
    ];

    protected $casts = [
        'amount_charged' => 'decimal:2',
        'service_date' => 'date',
        'next_visit_date' => 'date',
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

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }

    public function service(): BelongsTo
    {
        return $this->belongsTo(DentalService::class, 'dental_service_id');
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(ClinicStaff::class, 'performed_by');
    }
}
