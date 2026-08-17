<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic, ClinicStaff, Patient, ToothChart, Prescription};
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

        // Add dummy tooth condition
        ToothChart::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'tooth_number' => 14,
            'condition' => 'decayed',
        ]);

        // Add dummy prescription
        Prescription::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'prescription_date' => now()->toDateString(),
            'doctor_name' => 'Dr. A',
            'items' => [['name' => 'Amoxicillin', 'dosage' => '500mg', 'frequency' => '3x a day', 'quantity' => 21]],
        ]);

        $response = $this->getJson("/api/dashboard/patients/{$this->patientA->id}/ehr");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'patient',
                'tooth_charts' => [
                    '*' => ['id', 'tooth_number', 'condition']
                ],
                'prescriptions' => [
                    '*' => ['id', 'doctor_name', 'items']
                ]
            ]);

        $data = $response->json();
        $this->assertEquals('Patient A', $data['patient']['full_name']);
        $this->assertEquals(14, $data['tooth_charts'][0]['tooth_number']);
        $this->assertEquals('decayed', $data['tooth_charts'][0]['condition']);
        $this->assertEquals('Amoxicillin', $data['prescriptions'][0]['items'][0]['name']);
    }

    public function test_can_update_tooth_chart_states(): void
    {
        Sanctum::actingAs($this->staffA);

        $payload = [
            'tooth_number' => 18,
            'condition' => 'filled',
            'notes' => 'Restored cavity on distal surface'
        ];

        $response = $this->postJson("/api/dashboard/patients/{$this->patientA->id}/tooth-chart", $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Tooth status updated.'
            ]);

        $this->assertDatabaseHas('tooth_charts', [
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'tooth_number' => 18,
            'condition' => 'filled',
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
                'message' => 'Prescription created successfully.'
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

        // Dr. B tries to write to Clinic A's patient tooth chart
        $payload = ['tooth_number' => 10, 'condition' => 'missing'];
        $response = $this->postJson("/api/dashboard/patients/{$this->patientA->id}/tooth-chart", $payload);
        $response->assertStatus(404);
    }
}
