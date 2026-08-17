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
}
