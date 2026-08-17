<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

use App\Traits\BelongsToClinic;

class Patient extends Model
{
    use HasFactory, BelongsToClinic;

    protected $fillable = [
        'clinic_id',
        'fb_messenger_id',
        'full_name',
        'email',
        'contact_number',
        'address',
        'age',
        'birth_date',
        'gender',
        'medical_history',
        'allergies',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the clinic that owns the patient.
     */
    public function clinic(): BelongsTo
    {
        return $this->belongsTo(Clinic::class);
    }

    /**
     * Get the appointments for the patient.
     */
    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class);
    }

    /**
     * Get the history for the patient.
     */
    public function history(): HasMany
    {
        return $this->hasMany(PatientHistory::class);
    }

    /**
     * Get the chat sessions for the patient.
     */
    public function chatSessions(): HasMany
    {
        return $this->hasMany(ChatSession::class);
    }

    /**
     * Get the latest chat session.
     */
    public function latestChatSession()
    {
        return $this->hasOne(ChatSession::class)->latestOfMany();
    }

    /**
     * Get upcoming appointments
     */
    public function upcomingAppointments()
    {
        return $this->appointments()
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('appointment_date', '>=', now()->toDateString())
            ->orderBy('appointment_date')
            ->orderBy('appointment_time');
    }

    /**
     * Get past appointments
     */
    public function pastAppointments()
    {
        return $this->appointments()
            ->where('status', 'completed')
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'desc');
    }
}
