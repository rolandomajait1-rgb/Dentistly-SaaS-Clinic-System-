<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic, ClinicStaff, Patient, Prescription, PatientHistory};
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EhrTest extends TestCase
{
    use RefreshDatabase;

    protected $clinicA;
    protected $staffA;
    protected $patientA;

    protected $clinicB;
    protected $staffB;
    protected $patientB;

    protected function setUp(): void
    {
        parent::setUp();

        // Clinic A
        $tenantA = Tenant::create(['tenant_name' => 'Clinic A', 'subdomain' => 'clinic-a']);
        $this->clinicA = Clinic::create([
            'tenant_id' => $tenantA->id,
            'clinic_name' => 'Clinic A',
            'owner_name' => 'Doctor A',
            'email' => 'a@clinic.com',
            'contact_number' => '123',
            'address' => 'A'
        ]);
        $this->staffA = ClinicStaff::create([
            'clinic_id' => $this->clinicA->id,
            'name' => 'Dr. A',
            'email' => 'a@clinic.com',
            'password' => Hash::make('password'),
            'role' => 'owner'
        ]);
        $this->patientA = Patient::create([
            'clinic_id' => $this->clinicA->id,
            'full_name' => 'Patient A',
            'contact_number' => '111',
        ]);

        // Clinic B
        $tenantB = Tenant::create(['tenant_name' => 'Clinic B', 'subdomain' => 'clinic-b']);
        $this->clinicB = Clinic::create([
            'tenant_id' => $tenantB->id,
            'clinic_name' => 'Clinic B',
            'owner_name' => 'Doctor B',
            'email' => 'b@clinic.com',
            'contact_number' => '456',
            'address' => 'B'
        ]);
        $this->staffB = ClinicStaff::create([
            'clinic_id' => $this->clinicB->id,
            'name' => 'Dr. B',
            'email' => 'b@clinic.com',
            'password' => Hash::make('password'),
            'role' => 'owner'
        ]);
        $this->patientB = Patient::create([
            'clinic_id' => $this->clinicB->id,
            'full_name' => 'Patient B',
            'contact_number' => '222',
        ]);
    }

    public function test_can_retrieve_patient_ehr_details(): void
    {
        Sanctum::actingAs($this->staffA);

        // Add dummy prescription
        Prescription::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'prescription_date' => now()->toDateString(),
            'doctor_name' => 'Dr. A',
            'items' => [['name' => 'Amoxicillin', 'dosage' => '500mg', 'frequency' => '3x a day', 'quantity' => 21]],
        ]);

        // Add dummy SOAP consultation record
        PatientHistory::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'service_provided' => 'Dental Checkup',
            'diagnosis' => 'Dental Caries',
            'soap_subjective' => 'Patient complains of sensitivity.',
            'soap_objective' => 'Caries on occlusal surface.',
            'soap_assessment' => 'Mild decay',
            'soap_plan' => 'Composite filling recommended',
            'service_date' => now()->toDateString(),
            'performed_by' => $this->staffA->id,
        ]);

        $response = $this->getJson("/api/dashboard/patients/{$this->patientA->id}/ehr");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'patient',
                'prescriptions' => [
                    '*' => ['id', 'doctor_name', 'items']
                ],
                'soap_notes' => [
                    '*' => ['id', 'soap_subjective', 'soap_assessment', 'soap_plan']
                ]
            ]);

        $data = $response->json();
        $this->assertEquals('Patient A', $data['patient']['full_name']);
        $this->assertEquals('Amoxicillin', $data['prescriptions'][0]['items'][0]['name']);
        $this->assertEquals('Patient complains of sensitivity.', $data['soap_notes'][0]['soap_subjective']);
    }

    public function test_can_create_patient_soap_note(): void
    {
        Sanctum::actingAs($this->staffA);

        $payload = [
            'subjective' => 'Sharp pain on chewing, upper right quadrant.',
            'objective' => 'Deep cavity #16, positive percussion test.',
            'assessment' => 'Irreversible Pulpitis #16',
            'plan' => 'Initiate RCT, prescribe analgesics, follow up in 5 days.',
            'vital_signs' => [
                'blood_pressure' => '120/80',
                'pulse' => '76 bpm'
            ],
            'treatment' => 'Root Canal Therapy Consultation',
        ];

        $response = $this->postJson("/api/dashboard/patients/{$this->patientA->id}/soap-notes", $payload);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Clinical SOAP note recorded successfully.'
            ]);

        $this->assertDatabaseHas('patient_history', [
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'service_provided' => 'Root Canal Therapy Consultation',
        ]);
    }

    public function test_can_create_patient_prescription(): void
    {
        Sanctum::actingAs($this->staffA);

        $payload = [
            'prescription_date' => now()->toDateString(),
            'doctor_name' => 'Dr. Juan Santos',
            'prc_license_number' => 'PRC-998877',
            'items' => [
                ['name' => 'Mefenamic Acid', 'dosage' => '500mg', 'frequency' => 'As needed for pain', 'quantity' => 10]
            ],
            'instructions' => 'Take medication after meals.'
        ];

        $response = $this->postJson("/api/dashboard/patients/{$this->patientA->id}/prescriptions", $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'F2F Prescription created and recorded successfully.'
            ]);

        $this->assertDatabaseHas('prescriptions', [
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'doctor_name' => 'Dr. Juan Santos',
        ]);
    }

    public function test_data_scoping_is_strictly_enforced_on_ehr(): void
    {
        // Dr. B (Clinic B) tries to query Clinic A's patient EHR
        Sanctum::actingAs($this->staffB);

        $response = $this->getJson("/api/dashboard/patients/{$this->patientA->id}/ehr");
        // Should return 404 since it's scoped to Clinic B and doesn't exist there
        $response->assertStatus(404);

        // Dr. B tries to write a SOAP note to Clinic A's patient
        $payload = [
            'subjective' => 'Hacker note',
            'assessment' => 'Test',
            'plan' => 'Test'
        ];
        $writeResponse = $this->postJson("/api/dashboard/patients/{$this->patientA->id}/soap-notes", $payload);
        $writeResponse->assertStatus(404);
    }
}
