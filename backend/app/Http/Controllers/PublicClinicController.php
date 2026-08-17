<?php

namespace App\Http\Controllers;

use App\Models\{Clinic, Patient, Appointment, CalendarSlot, DentalService};
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;

class PublicClinicController extends Controller
{
    /**
     * Helper to find clinic by ID, subdomain, or slug.
     */
    protected function findClinic($clinicSlug)
    {
        $clinic = Clinic::where('id', $clinicSlug)
            ->orWhereHas('tenant', function ($q) use ($clinicSlug) {
                $q->where('subdomain', $clinicSlug);
            })
            ->first();

        if (!$clinic) {
            $clinic = Clinic::all()->first(function ($c) use ($clinicSlug) {
                return Str::slug($c->clinic_name) === $clinicSlug;
            });
        }

        if (!$clinic) {
            $clinic = Clinic::first();
        }

        return $clinic;
    }

    /**
     * Get active services of the clinic, grouped by category.
     */
    public function services($clinicSlug)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $services = $clinic->services()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $grouped = $services->groupBy(function ($item) {
            return $item->category ?: 'General Dentistry';
        });

        return response()->json($grouped);
    }

    /**
     * Get available calendar slots of the clinic over the next 30 days.
     */
    public function slots($clinicSlug, Request $request)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $slots = CalendarSlot::where('clinic_id', $clinic->id)
            ->where('status', 'available')
            ->whereDate('slot_date', '>=', Carbon::today())
            ->whereDate('slot_date', '<=', Carbon::today()->addDays(30))
            ->orderBy('slot_date')
            ->orderBy('slot_time')
            ->get();

        $grouped = [];
        foreach ($slots as $slot) {
            $dateStr = $slot->slot_date instanceof Carbon
                ? $slot->slot_date->toDateString()
                : Carbon::parse($slot->slot_date)->toDateString();

            if (!isset($grouped[$dateStr])) {
                $grouped[$dateStr] = [];
            }
            $grouped[$dateStr][] = Carbon::parse($slot->slot_time)->format('H:i');
        }

        return response()->json($grouped);
    }

    /**
     * Create a public booking.
     */
    public function bookings($clinicSlug, Request $request)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $validated = $request->validate([
            'service_id' => 'required|exists:dental_services,id',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|date_format:H:i',
            'name' => 'required|string|max:255',
            'contact' => 'required|string',
            'email' => 'nullable|email',
            'address' => 'required|string',
            'age' => 'required|integer|min:1|max:120',
            'medical_history' => 'nullable|string',
            'reason' => 'required|string',
        ]);

        $formattedTime = Carbon::parse($validated['time'])->format('H:i:s');

        // Check if the slot is still available
        $slot = CalendarSlot::where('clinic_id', $clinic->id)
            ->whereDate('slot_date', $validated['date'])
            ->where('slot_time', $formattedTime)
            ->where('status', 'available')
            ->first();

        if (!$slot) {
            return response()->json([
                'error' => 'Double-booking error: This slot was just taken. Please choose another slot.'
            ], 400);
        }

        // Find or create patient record locally
        $patient = Patient::where('clinic_id', $clinic->id)
            ->where('contact_number', $validated['contact'])
            ->first();

        if (!$patient) {
            $patient = Patient::create([
                'clinic_id' => $clinic->id,
                'fb_messenger_id' => null,
                'full_name' => $validated['name'],
                'email' => $validated['email'] ?? null,
                'contact_number' => $validated['contact'],
                'address' => $validated['address'],
                'age' => $validated['age'],
                'medical_history' => $validated['medical_history'] ?: 'None',
            ]);
        } else {
            if (isset($validated['email'])) {
                $patient->update(['email' => $validated['email']]);
            }
        }

        // Generate Queue Number for the day
        $queueNumber = Appointment::where('clinic_id', $clinic->id)
            ->whereDate('appointment_date', $validated['date'])
            ->count() + 1;

        // Create the pending appointment
        $appointment = Appointment::create([
            'clinic_id' => $clinic->id,
            'patient_id' => $patient->id,
            'dental_service_id' => $validated['service_id'],
            'appointment_date' => $validated['date'],
            'appointment_time' => $formattedTime,
            'status' => 'pending',
            'queue_number' => $queueNumber,
            'reason_for_visit' => $validated['reason'],
        ]);

        // Update calendar slot
        $slot->update([
            'status' => 'booked',
            'appointment_id' => $appointment->id,
        ]);

        // Dispatch automated workflow (SMS, Email, Messenger receipt)
        try {
            $workflowService = resolve(\App\Services\WorkflowAutomationService::class);
            $workflowService->triggerWorkflow($clinic, $patient, $appointment, 'booking_created');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Public booking workflow dispatch error: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'queue_number' => $queueNumber,
            'reference_number' => $appointment->reference_number,
            'appointment_id' => $appointment->id,
        ]);
    }

    /**
     * Get public clinic information, hours, and FAQs.
     */
    public function info($clinicSlug)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $faqs = \App\Models\ClinicFaq::where('clinic_id', $clinic->id)
            ->where('is_active', true)
            ->get();

        return response()->json([
            'id' => $clinic->id,
            'clinic_name' => $clinic->clinic_name,
            'owner_name' => $clinic->owner_name,
            'email' => $clinic->email,
            'contact_number' => $clinic->contact_number,
            'address' => $clinic->address,
            'logo_url' => $clinic->logo_url,
            'timezone' => $clinic->timezone,
            'operating_hours' => $clinic->operating_hours,
            'notification_settings' => $clinic->notification_settings,
            'faqs' => $faqs,
        ]);
    }

    /**
     * Look up appointment status and queue position by reference number or patient contact.
     */
    public function lookupAppointment($clinicSlug, Request $request)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $query = $request->query('query') ?? $request->query('reference');

        if (empty($query)) {
            return response()->json(['error' => 'Reference number or contact number is required'], 400);
        }

        $cleanQuery = trim($query);

        $appointments = Appointment::where('clinic_id', $clinic->id)
            ->where(function ($q) use ($cleanQuery) {
                $q->where('reference_number', $cleanQuery)
                  ->orWhereHas('patient', function ($pq) use ($cleanQuery) {
                      $pq->where('contact_number', $cleanQuery)
                        ->orWhere('email', $cleanQuery);
                  });
            })
            ->with(['patient', 'service'])
            ->orderBy('appointment_date', 'desc')
            ->get();

        $results = $appointments->map(function ($appt) use ($clinic) {
            // Count serving/pending ahead of this appointment today
            $aheadCount = 0;
            if (in_array(strtolower($appt->status), ['pending', 'approved', 'confirmed'])) {
                $aheadCount = Appointment::where('clinic_id', $clinic->id)
                    ->whereDate('appointment_date', $appt->appointment_date)
                    ->whereIn('status', ['pending', 'approved', 'confirmed', 'Serving', 'in_progress'])
                    ->where('queue_number', '<', $appt->queue_number)
                    ->count();
            }

            return [
                'id' => $appt->id,
                'reference_number' => $appt->reference_number,
                'status' => $appt->status,
                'appointment_date' => $appt->appointment_date,
                'appointment_time' => $appt->appointment_time,
                'queue_number' => $appt->queue_number,
                'patients_ahead' => $aheadCount,
                'reason_for_visit' => $appt->reason_for_visit,
                'cancellation_reason' => $appt->cancellation_reason,
                'patient' => [
                    'full_name' => $appt->patient->full_name ?? 'N/A',
                    'contact_number' => $appt->patient->contact_number ?? 'N/A',
                    'email' => $appt->patient->email ?? null,
                ],
                'service' => [
                    'service_name' => $appt->service->service_name ?? 'Dental Service',
                    'price' => $appt->service->price ?? 0,
                    'duration_minutes' => $appt->service->duration_minutes ?? 45,
                ],
            ];
        });

        return response()->json($results);
    }

    /**
     * Cancel appointment by patient via reference number & contact verification.
     */
    public function cancelBooking($clinicSlug, Request $request)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $validated = $request->validate([
            'reference_number' => 'required|string',
            'contact_number' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $appointment = Appointment::where('clinic_id', $clinic->id)
            ->where('reference_number', trim($validated['reference_number']))
            ->whereHas('patient', function ($q) use ($validated) {
                $q->where('contact_number', trim($validated['contact_number']));
            })
            ->first();

        if (!$appointment) {
            return response()->json([
                'error' => 'Appointment not found. Please double-check your Reference Number and Contact Number.'
            ], 404);
        }

        if (in_array(strtolower($appointment->status), ['completed', 'cancelled'])) {
            return response()->json([
                'error' => "Cannot cancel appointment because it is already {$appointment->status}."
            ], 400);
        }

        $appointment->status = 'Cancelled';
        $appointment->cancellation_reason = $validated['reason'] ?? 'Cancelled by Patient via Portal';
        $appointment->save();

        // Release the calendar slot
        CalendarSlot::where('clinic_id', $clinic->id)
            ->where('appointment_id', $appointment->id)
            ->update([
                'status' => 'available',
                'appointment_id' => null,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment cancelled successfully.',
            'reference_number' => $appointment->reference_number,
        ]);
    }
}

