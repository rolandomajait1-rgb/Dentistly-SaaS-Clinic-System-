<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic, FbPageIntegration, Patient, Appointment, DentalService, Notification};
use App\Services\MessengerService;
use App\Services\MailService;
use App\Services\WorkflowAutomationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SaaSConfigurableIntegrationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_messenger_service_uses_clinic_specific_page_access_token(): void
    {
        // 1. Setup tenant and clinic with custom Facebook page integration
        $tenant = Tenant::create(['tenant_name' => 'Demo Tenant', 'subdomain' => 'demo']);
        $clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'SaaS Dental Clinic',
            'owner_name' => 'Dr. Custom',
            'email' => 'custom@clinic.com',
            'contact_number' => '09123456789',
            'address' => 'SaaS Street',
            'notification_settings' => [
                'messenger_enabled' => true,
            ]
        ]);

        $integration = FbPageIntegration::create([
            'clinic_id' => $clinic->id,
            'fb_page_id' => '100099887766',
            'fb_page_name' => 'SaaS Dental Clinic Page',
            'page_access_token' => 'EAA_clinic_custom_page_token_999',
            'webhook_verify_token' => 'dental_verify_test_token',
            'is_active' => true,
        ]);

        // 2. Fake Facebook Graph API
        Http::fake([
            'https://graph.facebook.com/*' => Http::response([
                'recipient_id' => '9988776655',
                'message_id' => 'mid.123456789'
            ], 200)
        ]);

        // 3. Resolve MessengerService and send text message
        $messengerService = resolve(MessengerService::class);
        $result = $messengerService->sendTextMessage('9988776655', 'Hello from SaaS clinic Messenger!', $integration);

        $this->assertTrue($result);

        // 4. Assert that the request was sent to Facebook Graph API with the clinic-specific page token
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'graph.facebook.com') &&
                   $request['access_token'] === 'EAA_clinic_custom_page_token_999' &&
                   $request['recipient']['id'] === '9988776655' &&
                   $request['message']['text'] === 'Hello from SaaS clinic Messenger!';
        });
    }

    public function test_workflow_automation_skips_messenger_when_messenger_disabled_in_settings(): void
    {
        $tenant = Tenant::create(['tenant_name' => 'Demo Tenant 2', 'subdomain' => 'demo2']);
        $clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'SaaS Clinic 2',
            'owner_name' => 'Dr. Test',
            'email' => 'test@clinic.com',
            'contact_number' => '09123456789',
            'address' => '123 Medical Rd',
            'notification_settings' => [
                'messenger_enabled' => false,
            ]
        ]);

        FbPageIntegration::create([
            'clinic_id' => $clinic->id,
            'fb_page_id' => '100099887788',
            'fb_page_name' => 'Clinic Page',
            'page_access_token' => 'EAA_clinic_custom_page_token_888',
            'webhook_verify_token' => 'dental_test_verify_token_1',
            'is_active' => true,
        ]);

        $patient = Patient::create([
            'clinic_id' => $clinic->id,
            'full_name' => 'John Patient',
            'contact_number' => '09171112233',
            'fb_messenger_id' => 'fb_sender_id_123',
        ]);

        Http::fake();

        $workflowService = resolve(WorkflowAutomationService::class);
        $results = $workflowService->triggerWorkflow($clinic, $patient, null, 'appointment_approved');

        // Assert Messenger was skipped because messenger_enabled is false
        $this->assertFalse($results['messenger']['sent']);
        Http::assertNothingSent();
        $this->assertDatabaseMissing('notifications', [
            'clinic_id' => $clinic->id,
            'channel' => 'messenger',
        ]);
    }

    public function test_workflow_automation_sends_messenger_when_enabled(): void
    {
        $tenant = Tenant::create(['tenant_name' => 'Demo Tenant 3', 'subdomain' => 'demo3']);
        $clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'Bright Smile Clinic',
            'owner_name' => 'Dr. Bright',
            'email' => 'bright@clinic.com',
            'contact_number' => '09123456789',
            'address' => '456 Dental Plaza',
            'notification_settings' => [
                'messenger_enabled' => true,
            ]
        ]);

        FbPageIntegration::create([
            'clinic_id' => $clinic->id,
            'fb_page_id' => '100099887799',
            'fb_page_name' => 'Bright Smile Page',
            'page_access_token' => 'EAA_clinic_custom_page_token_777',
            'webhook_verify_token' => 'dental_test_verify_token_2',
            'is_active' => true,
        ]);

        $patient = Patient::create([
            'clinic_id' => $clinic->id,
            'full_name' => 'Jane Patient',
            'contact_number' => '09171114455',
            'fb_messenger_id' => 'fb_sender_id_456',
        ]);

        Http::fake([
            'https://graph.facebook.com/*' => Http::response([
                'recipient_id' => 'fb_sender_id_456',
                'message_id' => 'mid.987654'
            ], 200)
        ]);

        $workflowService = resolve(WorkflowAutomationService::class);
        $results = $workflowService->triggerWorkflow($clinic, $patient, null, 'appointment_approved');

        $this->assertArrayHasKey('messenger', $results);
        $this->assertTrue($results['messenger']['sent']);

        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'graph.facebook.com') &&
                   $request['access_token'] === 'EAA_clinic_custom_page_token_777' &&
                   $request['recipient']['id'] === 'fb_sender_id_456';
        });

        $this->assertDatabaseHas('notifications', [
            'clinic_id' => $clinic->id,
            'channel' => 'messenger',
            'status' => 'sent',
        ]);
    }

    public function test_mail_service_resolves_clinic_specific_smtp_mailer(): void
    {
        // 1. Setup tenant and clinic with custom SMTP settings
        $tenant = Tenant::create(['tenant_name' => 'Demo Tenant', 'subdomain' => 'demo']);
        $clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'SaaS Clinic',
            'owner_name' => 'Dr. Custom',
            'email' => 'custom@clinic.com',
            'contact_number' => '09123456789',
            'address' => 'SaaS Street',
            'notification_settings' => [
                'smtp_enabled' => true,
                'smtp_host' => 'mail.customhost.com',
                'smtp_port' => 465,
                'smtp_username' => 'custom_user',
                'smtp_password' => 'custom_password_123',
                'smtp_encryption' => 'ssl',
                'smtp_from_address' => 'noreply@customhost.com',
            ]
        ]);

        // Fake Mail
        Mail::fake();

        // 2. Resolve MailService and send email
        $mailService = resolve(MailService::class);
        $result = $mailService->sendEmail(
            'patient@gmail.com',
            'Test Subject',
            '<p>Test Body</p>',
            $clinic->clinic_name,
            $clinic
        );

        $this->assertTrue($result);

        // 3. Verify that the dynamic config for this clinic was set correctly
        $mailerConfig = config('mail.mailers.clinic_' . $clinic->id);
        $this->assertNotNull($mailerConfig);
        $this->assertEquals('mail.customhost.com', $mailerConfig['host']);
        $this->assertEquals(465, $mailerConfig['port']);
        $this->assertEquals('custom_user', $mailerConfig['username']);
        $this->assertEquals('custom_password_123', $mailerConfig['password']);
        $this->assertEquals('ssl', $mailerConfig['encryption']);
    }
}
