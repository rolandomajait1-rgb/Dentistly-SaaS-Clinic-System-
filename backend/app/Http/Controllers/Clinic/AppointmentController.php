<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\{Appointment, Clinic, Patient};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AppointmentController extends Controller
{
    /**
     * Get dashboard counts and today's schedule
     */
    public function getOverview(Request $request)
    {
        $clinicId = $request->user()->clinic_id;
        $today = Carbon::today()->toDateString();

        $totalPatients = Patient::where('clinic_id', $clinicId)->count();
        $pendingCount = Appointment::where('clinic_id', $clinicId)->where('status', 'pending')->count();
        
        $activeQueue = Appointment::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $today)
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->count();

        $completedToday = Appointment::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $today)
            ->where('status', 'completed')
            ->count();

        $todayAppointments = Appointment::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $today)
            ->with(['patient', 'service'])
            ->orderBy('appointment_time')
            ->get();

        return response()->json([
            'stats' => [
                'totalPatients' => $totalPatients,
                'pendingAppointments' => $pendingCount,
                'activeQueue' => $activeQueue,
                'completedToday' => $completedToday
            ],
            'todayAppointments' => $todayAppointments
        ]);
    }

    /**
     * Get all appointments (for schedule calendar & history list)
     */
    public function getAppointments(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $appointments = Appointment::where('clinic_id', $clinicId)
            ->with(['patient', 'service'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'asc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Update appointment status (Approve, Cancel, Complete, Serve)
     */
    public function updateAppointmentStatus(Request $request, int $id)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'status' => 'required|in:Pending,Approved,Serving,Completed,Cancelled',
            'cancellation_reason' => 'nullable|string|max:500'
        ]);

        $appointment = Appointment::where('clinic_id', $clinicId)->with(['patient', 'service'])->findOrFail($id);
        $status = $request->status;

        if ($status === 'Approved' && empty($appointment->queue_number)) {
            $maxQueue = Appointment::where('clinic_id', $appointment->clinic_id)
                ->whereDate('appointment_date', $appointment->appointment_date)
                ->max('queue_number') ?? 0;
            $appointment->queue_number = $maxQueue + 1;
        }

        if ($request->has('cancellation_reason') && $status === 'Cancelled') {
            $appointment->cancellation_reason = $request->cancellation_reason;
        }

        $appointment->status = $status;
        $appointment->save();

        // Multi-channel notifications
        if (in_array($status, ['Approved', 'Cancelled', 'Completed'])) {
            try {
                $patient = $appointment->patient;
                $clinic = Clinic::with('fbPageIntegration')->find($appointment->clinic_id);
                if ($patient && $clinic) {
                    $eventType = match ($status) {
                        'Approved' => 'appointment_approved',
                        'Cancelled' => 'appointment_cancelled',
                        'Completed' => 'appointment_completed',
                        default => 'appointment_approved',
                    };
                    $workflowService = resolve(\App\Services\WorkflowAutomationService::class);
                    $workflowService->triggerWorkflow($clinic, $patient, $appointment, $eventType);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send status update workflow notification: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Appointment status updated to ' . $status,
            'appointment' => $appointment->load(['patient', 'service'])
        ]);
    }

    /**
     * Manually book / Walk-in appointment from dashboard
     */
    public function createAppointment(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'patient_name' => 'required|string',
            'phone' => 'required|string',
            'service_id' => 'required|exists:dental_services,id',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|string',
            'medical_notes' => 'nullable|string'
        ]);

        // Find or create patient
        $patient = Patient::firstOrCreate(
            ['clinic_id' => $clinicId, 'contact_number' => $request->phone],
            [
                'fb_messenger_id' => 'walkin_' . Str::random(12),
                'full_name' => $request->patient_name,
                'medical_history' => $request->medical_notes ?? '',
            ]
        );

        $maxQueue = Appointment::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $request->date)
            ->max('queue_number') ?? 0;

        $appointment = Appointment::create([
            'clinic_id' => $clinicId,
            'patient_id' => $patient->id,
            'dental_service_id' => $request->service_id,
            'appointment_date' => $request->date,
            'appointment_time' => $request->time,
            'status' => 'Approved',
            'queue_number' => $maxQueue + 1,
            'reason_for_visit' => 'Staff / Walk-In Scheduled',
        ]);

        return response()->json([
            'message' => 'Appointment booked successfully.',
            'appointment' => $appointment->load(['patient', 'service'])
        ]);
    }
}
