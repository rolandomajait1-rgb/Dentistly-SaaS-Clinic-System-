<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\{Patient, Prescription, ToothChart};
use Illuminate\Http\Request;

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
     * Get EHR patient data (Medical history & Prescriptions)
     */
    public function getPatientEhr(Request $request, int $id)
    {
        $clinicId = $request->user()->clinic_id;

        $patient = Patient::where('clinic_id', $clinicId)->findOrFail($id);

        $prescriptions = Prescription::where('patient_id', $patient->id)
            ->orderBy('prescription_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Optional tooth charts fallback for legacy support if queried
        $toothCharts = ToothChart::where('patient_id', $patient->id)
            ->orderBy('tooth_number')
            ->get();

        return response()->json([
            'patient' => $patient,
            'tooth_charts' => $toothCharts,
            'prescriptions' => $prescriptions,
        ]);
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

        return response()->json([
            'message' => 'Patient created successfully.',
            'patient' => $patient->load(['appointments'])
        ], 201);
    }
}
