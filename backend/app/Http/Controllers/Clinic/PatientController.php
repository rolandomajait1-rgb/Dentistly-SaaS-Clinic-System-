<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\{Patient, PatientHistory, Prescription, ToothChart};
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PatientController extends Controller
{
    /**
     * Get all patients for the authenticated clinic
     */
    public function getPatients(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $patients = Patient::where('clinic_id', $clinicId)
            ->withCount('appointments')
            ->with(['appointments' => function ($q) {
                $q->orderBy('appointment_date', 'desc')->with(['service', 'approver']);
            }])
            ->orderBy('full_name')
            ->get();

        return response()->json($patients);
    }

    /**
     * Get EHR patient data (Medical history, SOAP notes & Prescriptions)
     */
    public function getPatientEhr(Request $request, int $id)
    {
        $clinicId = $request->user()->clinic_id;

        $patient = Patient::where('clinic_id', $clinicId)->findOrFail($id);

        $prescriptions = Prescription::where('patient_id', $patient->id)
            ->orderBy('prescription_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Fetch clinical SOAP consultation history
        $soapNotes = PatientHistory::where('clinic_id', $clinicId)
            ->where('patient_id', $patient->id)
            ->with(['service', 'performedBy'])
            ->orderBy('service_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        // Safe optional tooth charts check (table may be absent if scoped out)
        $toothCharts = collect();
        if (\Illuminate\Support\Facades\Schema::hasTable('tooth_charts')) {
            $toothCharts = ToothChart::where('patient_id', $patient->id)
                ->orderBy('tooth_number')
                ->get();
        }

        // HIPAA access audit logging
        AuditLogger::log(
            $clinicId,
            'view_patient_ehr',
            'Patient',
            $patient->id,
            ['patient_name' => $patient->full_name],
            $request
        );

        return response()->json([
            'patient' => $patient,
            'tooth_charts' => $toothCharts,
            'prescriptions' => $prescriptions,
            'soap_notes' => $soapNotes,
        ]);
    }

    /**
     * Store structured Clinical SOAP Note for patient
     */
    public function storeSoapNote(Request $request, int $id)
    {
        $clinicId = $request->user()->clinic_id;
        $patient = Patient::where('clinic_id', $clinicId)->findOrFail($id);

        // RBAC gate check
        if (Gate::has('manage-soap-notes') && !Gate::allows('manage-soap-notes')) {
            return response()->json([
                'message' => 'Unauthorized: Only dentists and clinic administrators can record clinical SOAP notes.'
            ], 403);
        }

        $validated = $request->validate([
            'subjective'        => 'required|string',
            'objective'         => 'nullable|string',
            'assessment'        => 'required|string',
            'plan'              => 'required|string',
            'vital_signs'       => 'nullable|array',
            'treatment'         => 'nullable|string',
            'doctor_notes'      => 'nullable|string',
            'dental_service_id' => 'nullable|exists:dental_services,id',
            'service_date'      => 'nullable|date',
        ]);

        $history = PatientHistory::create([
            'clinic_id'         => $clinicId,
            'patient_id'        => $patient->id,
            'dental_service_id' => $validated['dental_service_id'] ?? null,
            'service_provided'  => $validated['treatment'] ?? 'Clinical Consultation',
            'diagnosis'         => $validated['assessment'],
            'treatment'         => $validated['treatment'] ?? null,
            'doctor_notes'      => $validated['doctor_notes'] ?? null,
            'soap_subjective'   => $validated['subjective'],
            'soap_objective'    => $validated['objective'] ?? null,
            'soap_assessment'   => $validated['assessment'],
            'soap_plan'         => $validated['plan'],
            'vital_signs'       => $validated['vital_signs'] ?? null,
            'service_date'      => $validated['service_date'] ?? now()->toDateString(),
            'performed_by'      => $request->user()->id,
        ]);

        // Audit log creation
        AuditLogger::log(
            $clinicId,
            'create_soap_note',
            'PatientHistory',
            $history->id,
            ['patient_id' => $patient->id, 'assessment' => $history->soap_assessment],
            $request
        );

        return response()->json([
            'success' => true,
            'message' => 'Clinical SOAP note recorded successfully.',
            'soap_note' => $history->load(['service', 'performedBy']),
        ], 201);
    }

    /**
     * Create a new patient manually from directory
     */
    public function createPatient(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'full_name' => 'required|string|max:255',
            'contact_number' => 'required|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string|max:500',
            'medical_history' => 'nullable|string',
            'gender' => 'nullable|string|max:20',
            'age' => 'nullable|integer',
            'birth_date' => 'nullable|date',
        ]);

        $patient = Patient::create([
            'clinic_id' => $clinicId,
            'fb_messenger_id' => 'walkin_' . \Illuminate\Support\Str::random(12),
            'full_name' => $request->full_name,
            'contact_number' => $request->contact_number,
            'email' => $request->email,
            'address' => $request->address,
            'medical_history' => $request->medical_history ?? 'None',
            'gender' => $request->gender,
            'age' => $request->age,
            'birth_date' => $request->birth_date,
        ]);

        AuditLogger::log(
            $clinicId,
            'create_patient',
            'Patient',
            $patient->id,
            ['patient_name' => $patient->full_name],
            $request
        );

        return response()->json([
            'message' => 'Patient created successfully.',
            'patient' => $patient->load(['appointments'])
        ], 201);
    }
}
