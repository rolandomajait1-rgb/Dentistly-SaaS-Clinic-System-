<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\{Clinic, ClinicStaff, Patient, Appointment, DentalService, Notification};
use App\Services\WorkflowAutomationService;

class WorkflowAutomationTest extends TestCase
{
    use RefreshDatabase;

    protected Clinic $clinic;
    protected ClinicStaff $staff;
    protected Patient $patient;
    protected Appointment $appointment;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = \App\Models\Tenant::create([
            'tenant_name' => 'SmileCare Tenant',
            'subdomain' => 'smilecare',
            'status' => 'active',
        ]);

        $this->clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'SmileCare Dental',
            'owner_name' => 'Dr. Alex Reed',
            'email' => 'contact@smilecare.ph',
            'contact_number' => '09171112222',
            'address' => '456 Health St, Manila',
            'status' => 'active',
            'notification_settings' => [
                'sms_enabled' => true,
                'email_enabled' => true,
                'sms_template_approved' => 'Hi {patient_name}, appointment at {clinic_name} on {date} at {time} is APPROVED.',
                'email_subject_approved' => 'Approved: {patient_name} at {clinic_name}',
                'email_body_approved' => '<p>Hi {patient_name}, your visit is confirmed for {date}.</p>',
            ]
        ]);

        $this->staff = ClinicStaff::create([
            'clinic_id' => $this->clinic->id,
            'name' => 'Dr. Alex Reed',
            'email' => 'alex@smilecare.ph',
            'password' => bcrypt('password123'),
            'role' => 'owner',
            'is_active' => true,
        ]);

        $this->patient = Patient::create([
            'clinic_id' => $this->clinic->id,
            'full_name' => 'Maria Clara',
            'email' => 'maria@example.com',
            'contact_number' => '09171234567',
        ]);

        $service = DentalService::create([
            'clinic_id' => $this->clinic->id,
            'service_name' => 'General Checkup',
            'price' => 500,
            'is_active' => true,
        ]);

        $this->appointment = Appointment::create([
            'clinic_id' => $this->clinic->id,
            'patient_id' => $this->patient->id,
            'dental_service_id' => $service->id,
            'appointment_date' => now()->addDay()->toDateString(),
            'appointment_time' => '10:00:00',
            'status' => 'pending',
        ]);
    }

    public function test_workflow_automation_service_triggers_dispatches_and_audits(): void
    {
        $workflow = resolve(WorkflowAutomationService::class);
        $results = $workflow->triggerWorkflow($this->clinic, $this->patient, $this->appointment, 'appointment_approved');

        $this->assertTrue($results['sms']['sent']);
        $this->assertTrue($results['email']['sent']);

        $this->assertDatabaseHas('notifications', [
            'clinic_id' => $this->clinic->id,
            'patient_id' => $this->patient->id,
            'channel' => 'sms',
            'status' => 'sent',
        ]);

        $this->assertDatabaseHas('notifications', [
            'clinic_id' => $this->clinic->id,
            'patient_id' => $this->patient->id,
            'channel' => 'email',
            'status' => 'sent',
        ]);
    }

    public function test_test_sms_workflow_endpoint(): void
    {
        $response = $this->actingAs($this->staff, 'sanctum')
            ->postJson('/api/dashboard/settings/test-sms', [
                'phone' => '09171234567',
                'template' => 'Hello {patient_name}, test SMS from {clinic_name}.',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('phone', '09171234567');
    }

    public function test_test_email_workflow_endpoint(): void
    {
        $response = $this->actingAs($this->staff, 'sanctum')
            ->postJson('/api/dashboard/settings/test-email', [
                'email' => 'maria@example.com',
                'subject' => 'Test Subject for {patient_name}',
                'body' => '<p>Test email body for {clinic_name}</p>',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('email', 'maria@example.com');
    }

    public function test_status_update_triggers_workflow_automation(): void
    {
        $response = $this->actingAs($this->staff, 'sanctum')
            ->postJson("/api/dashboard/appointments/{$this->appointment->id}/status", [
                'status' => 'Approved',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('appointment.status', 'Approved');

        $this->assertDatabaseHas('notifications', [
            'clinic_id' => $this->clinic->id,
            'patient_id' => $this->patient->id,
            'channel' => 'sms',
            'status' => 'sent',
        ]);
    }
}
