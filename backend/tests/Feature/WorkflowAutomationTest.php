<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic, ClinicStaff, Patient, Appointment, DentalService, Notification};
use App\Services\WorkflowAutomationService;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;

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

        Mail::fake();

        $tenant = Tenant::create([
            'tenant_name' => 'Smile Care Tenant',
            'subdomain' => 'smilecare',
        ]);

        $this->clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'Smile Care Clinic',
            'owner_name' => 'Dr. Smith',
            'email' => 'contact@smilecare.com',
            'contact_number' => '09171234567',
            'address' => '123 Dental St, Metro Manila',
            'notification_settings' => [
                'email_enabled' => true,
                'messenger_enabled' => false, // Focus on SMTP email automation
                'email_subject_approved' => 'Your visit at {clinic_name} is approved',
                'email_body_approved' => '<p>Dear {patient_name}, your visit for {service_name} on {date} at {time} is confirmed.</p>',
            ]
        ]);

        $this->staff = ClinicStaff::create([
            'clinic_id' => $this->clinic->id,
            'name' => 'Front Desk Staff',
            'email' => 'desk@smilecare.com',
            'password' => bcrypt('password123'),
            'role' => 'staff',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->patient = Patient::create([
            'clinic_id' => $this->clinic->id,
            'full_name' => 'Maria Clara',
            'contact_number' => '09171234567',
            'email' => 'maria@example.com',
            'fb_messenger_id' => 'walkin_patient_123',
        ]);

        $service = DentalService::create([
            'clinic_id' => $this->clinic->id,
            'service_name' => 'Oral Prophylaxis',
            'price' => 1200.00,
            'duration_minutes' => 45,
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

        $this->assertTrue($results['email']['sent']);

        $this->assertDatabaseHas('notifications', [
            'clinic_id' => $this->clinic->id,
            'patient_id' => $this->patient->id,
            'channel' => 'email',
            'status' => 'sent',
        ]);
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
            'channel' => 'email',
            'status' => 'sent',
        ]);
    }

    public function test_approval_triggers_facebook_messenger_notification(): void
    {
        \App\Models\FbPageIntegration::create([
            'clinic_id' => $this->clinic->id,
            'fb_page_id' => '1234567890',
            'fb_page_name' => 'Smile Care Page',
            'page_access_token' => 'mock_page_access_token',
            'webhook_verify_token' => 'mock_verify_token',
            'is_active' => true,
        ]);

        $this->clinic->update([
            'notification_settings' => array_merge($this->clinic->notification_settings ?? [], [
                'messenger_enabled' => true,
            ])
        ]);

        $this->patient->update([
            'fb_messenger_id' => 'fb_patient_user_555'
        ]);

        $mockMessenger = \Mockery::mock(\App\Services\MessengerService::class);
        $mockMessenger->shouldReceive('sendQuickReplies')
            ->once()
            ->withArgs(function ($recipientId, $text, $quickReplies, $int, $tag) {
                return $recipientId === 'fb_patient_user_555'
                    && str_contains($text, 'APPOINTMENT CONFIRMED')
                    && $tag === 'CONFIRMED_VISIT_UPDATE';
            })
            ->andReturn(true);

        $this->app->instance(\App\Services\MessengerService::class, $mockMessenger);

        $response = $this->actingAs($this->staff, 'sanctum')
            ->postJson("/api/dashboard/appointments/{$this->appointment->id}/status", [
                'status' => 'Approved',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('notifications', [
            'clinic_id' => $this->clinic->id,
            'patient_id' => $this->patient->id,
            'channel' => 'messenger',
            'notification_type' => 'approval',
            'status' => 'sent',
        ]);

        $this->assertDatabaseHas('appointments', [
            'id' => $this->appointment->id,
            'status' => 'confirmed',
            'approved_by' => $this->staff->id,
        ]);
    }
}
