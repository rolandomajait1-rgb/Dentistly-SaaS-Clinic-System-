<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\{Patient, Prescription};
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    /**
     * Get prescriptions for a patient
     */
    public function getPrescriptions(Request $request, int $patientId)
    {
        $clinicId = $request->user()->clinic_id;

        $patient = Patient::where('clinic_id', $clinicId)->findOrFail($patientId);

        $prescriptions = Prescription::where('patient_id', $patient->id)
            ->orderBy('prescription_date', 'desc')
            ->get();

        return response()->json($prescriptions);
    }

    /**
     * Create a new patient prescription (Handed F2F at Clinic)
     */
    public function createPrescription(Request $request, int $patientId)
    {
        $clinicId = $request->user()->clinic_id;

        $patient = Patient::where('clinic_id', $clinicId)->findOrFail($patientId);

        $request->validate([
            'prescription_date' => 'required|date',
            'doctor_name' => 'required|string|max:255',
            'prc_license_number' => 'nullable|string|max:100',
            'items' => 'required|array', // Array of meds: name, dosage, frequency, quantity
            'instructions' => 'nullable|string|max:1000',
        ]);

        $prescription = Prescription::create([
            'clinic_id' => $clinicId,
            'patient_id' => $patient->id,
            'prescription_date' => $request->prescription_date,
            'doctor_name' => $request->doctor_name,
            'prc_license_number' => $request->prc_license_number,
            'items' => $request->items,
            'instructions' => $request->instructions,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'F2F Prescription created and recorded successfully.',
            'prescription' => $prescription
        ]);
    }
}
