<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic, ClinicStaff, Patient, ChatSession, PatientHistory, ToothChart, Prescription, Appointment, DentalService};
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;

class PatientPortalWebviewTest extends TestCase
{
    use RefreshDatabase;

    protected $clinicA;
    protected $patientA;
    protected $sessionA;

    protected $clinicB;
    protected $patientB;
    protected $sessionB;

    protected function setUp(): void
    {
        parent::setUp();

        // Setup Clinic A
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
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'owner'
        ]);
        $this->patientA = Patient::create([
            'clinic_id' => $this->clinicA->id,
            'full_name' => 'Patient A',
            'contact_number' => '111222',
            'fb_messenger_id' => 'messenger_a',
        ]);
        $this->sessionA = ChatSession::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'fb_messenger_id' => 'messenger_a',
            'session_id' => (string) Str::uuid(),
            'current_step' => 'welcome',
            'last_interaction_at' => now(),
        ]);

        // Setup Clinic B (for isolation checks)
        $tenantB = Tenant::create(['tenant_name' => 'Clinic B', 'subdomain' => 'clinic-b']);
        $this->clinicB = Clinic::create([
            'tenant_id' => $tenantB->id,
            'clinic_name' => 'Clinic B',
            'owner_name' => 'Doctor B',
            'email' => 'b@clinic.com',
            'contact_number' => '456',
            'address' => 'B'
        ]);
        $this->patientB = Patient::create([
            'clinic_id' => $this->clinicB->id,
            'full_name' => 'Patient B',
            'contact_number' => '333444',
            'fb_messenger_id' => 'messenger_b',
        ]);
        $this->sessionB = ChatSession::create([
            'clinic_id' => $this->clinicB->id,
            'patient_id' => $this->patientB->id,
            'fb_messenger_id' => 'messenger_b',
            'session_id' => (string) Str::uuid(),
            'current_step' => 'welcome',
            'last_interaction_at' => now(),
        ]);
    }

    /**
     * Test patient portal loads successfully and displays records
     */
    public function test_patient_portal_webview_loads_successfully_with_data(): void
    {
        $service = DentalService::create([
            'clinic_id' => $this->clinicA->id,
            'service_name' => 'Tooth Extraction',
            'category' => 'Surgery',
            'price' => 1500.00,
            'duration_minutes' => 30,
        ]);

        $appointment = Appointment::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'dental_service_id' => $service->id,
            'reference_number' => 'REF123',
            'appointment_date' => now()->toDateString(),
            'appointment_time' => '10:00:00',
            'status' => 'completed',
        ]);

        // Seed dummy history
        PatientHistory::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'appointment_id' => $appointment->id,
            'dental_service_id' => $service->id,
            'service_date' => now()->toDateString(),
            'service_provided' => 'Tooth Extraction',
            'diagnosis' => 'Severely decayed molar',
            'amount_charged' => 1500.00,
            'performed_by' => $this->staffA->id,
        ]);

        // Seed dummy prescription
        Prescription::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'prescription_date' => now()->toDateString(),
            'doctor_name' => 'Dr. Santos',
            'prc_license_number' => '12345',
            'items' => [['name' => 'Amoxicillin', 'dosage' => '500mg', 'quantity' => 21]],
        ]);

        // Seed dummy tooth condition
        ToothChart::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => $this->patientA->id,
            'tooth_number' => 18,
            'condition' => 'decayed',
            'notes' => 'Needs extraction',
        ]);

        // Request patient portal URL
        $response = $this->get(route('webview.patient_portal', ['sessionId' => $this->sessionA->session_id]));

        $response->assertStatus(200);
        $response->assertSee('Patient A');
        $response->assertSee('Tooth Extraction');
        $response->assertSee('Severely decayed molar');
        $response->assertSee('Amoxicillin');
        $response->assertSee('Dr. Santos');
        $response->assertSee('18'); // Tooth number
    }

    /**
     * Test 404 is returned for an invalid session ID
     */
    public function test_patient_portal_returns_404_for_invalid_session_id(): void
    {
        $response = $this->get('/webview/patient/portal/invalid-uuid');
        $response->assertStatus(404);
    }

    /**
     * Test friendly fallback page when chat session has no associated patient
     */
    public function test_patient_portal_shows_friendly_fallback_when_no_patient_history(): void
    {
        $emptySession = ChatSession::create([
            'clinic_id' => $this->clinicA->id,
            'patient_id' => null, // No patient profile
            'fb_messenger_id' => 'new_messenger_user',
            'session_id' => (string) Str::uuid(),
            'current_step' => 'welcome',
            'last_interaction_at' => now(),
        ]);

        $response = $this->get(route('webview.patient_portal', ['sessionId' => $emptySession->session_id]));

        $response->assertStatus(200);
        $response->assertSee('Walang Record / No History');
    }
}
