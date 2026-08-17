<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic};
use App\Services\SmsService;
use App\Services\MailService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class SaaSConfigurableIntegrationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_sms_service_uses_clinic_specific_semaphore_credentials(): void
    {
        // 1. Setup tenant and clinic with custom Semaphore settings
        $tenant = Tenant::create(['tenant_name' => 'Demo Tenant', 'subdomain' => 'demo']);
        $clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'SaaS Clinic',
            'owner_name' => 'Dr. Custom',
            'email' => 'custom@clinic.com',
            'contact_number' => '09123456789',
            'address' => 'SaaS Street',
            'notification_settings' => [
                'semaphore_api_key' => 'clinic_specific_key_999',
                'semaphore_name' => 'CUSTOM_SENDER',
            ]
        ]);

        // 2. Fake HTTP requests
        Http::fake([
            'api.semaphore.co/*' => Http::response(['status' => 'success'], 200)
        ]);

        // 3. Resolve SmsService and send SMS
        $smsService = resolve(SmsService::class);
        $result = $smsService->sendSms('09123456789', 'Hello from SaaS!', $clinic);

        $this->assertTrue($result);

        // 4. Assert that the request sent has the clinic-specific key and sender name
        Http::assertSent(function ($request) {
            return $request->url() === 'https://api.semaphore.co/api/v4/messages' &&
                   $request['apikey'] === 'clinic_specific_key_999' &&
                   $request['sendername'] === 'CUSTOM_SENDER' &&
                   $request['number'] === '09123456789' &&
                   $request['message'] === 'Hello from SaaS!';
        });
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
