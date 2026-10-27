<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic, ClinicStaff, DentalService, Patient};
use Database\Seeders\DentalSystemSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SecurityHardeningTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DentalSystemSeeder::class);
    }

    /**
     * Test 1: Public info endpoint does NOT leak private SMTP credentials or webhook secrets
     */
    public function test_public_info_endpoint_does_not_leak_sensitive_credentials(): void
    {
        $clinic = Clinic::first();
        $clinic->notification_settings = [
            'allow_same_day_booking' => true,
            'advance_booking_limit' => '1 month',
            'booking_policy_notice' => 'Please arrive 10 minutes early.',
            'smtp_host' => 'smtp.secret-mail-server.com',
            'smtp_port' => 587,
            'smtp_username' => 'private_admin',
            'smtp_password' => 'SuperSecretPassword123!',
            'webhook_secret' => 'facebook_secret_key_999',
        ];
        $clinic->save();

        $response = $this->getJson("/api/public/clinics/{$clinic->slug}/info");

        $response->assertStatus(200);
        $response->assertJsonPath('notification_settings.allow_same_day_booking', true);
        $response->assertJsonPath('notification_settings.booking_policy_notice', 'Please arrive 10 minutes early.');

        // Verify private credentials are NOT leaked in JSON response
        $json = $response->json();
        $this->assertArrayNotHasKey('smtp_host', $json['notification_settings'] ?? []);
        $this->assertArrayNotHasKey('smtp_username', $json['notification_settings'] ?? []);
        $this->assertArrayNotHasKey('smtp_password', $json['notification_settings'] ?? []);
        $this->assertArrayNotHasKey('webhook_secret', $json['notification_settings'] ?? []);
    }

    /**
     * Test 2: Only authorized staff (doctor/admin) can issue prescriptions; staff role is blocked (403)
     */
    public function test_receptionist_cannot_issue_prescriptions(): void
    {
        $clinic = Clinic::first();
        $patient = Patient::create([
            'clinic_id' => $clinic->id,
            'full_name' => 'Security Test Patient',
            'contact_number' => '09170001122',
        ]);

        // Create a non-medical staff member (role: staff)
        $receptionist = ClinicStaff::create([
            'clinic_id' => $clinic->id,
            'name' => 'Receptionist User',
            'email' => 'receptionist@happysmiles.com',
            'password' => bcrypt('password'),
            'role' => 'staff',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($receptionist);

        $payload = [
            'prescription_date' => now()->toDateString(),
            'doctor_name' => 'Dr. Unauthorized',
            'items' => [
                ['name' => 'Amoxicillin', 'dosage' => '500mg', 'frequency' => '3x a day', 'quantity' => '21 capsules']
            ],
            'instructions' => 'Take with meals'
        ];

        $response = $this->postJson("/api/dashboard/patients/{$patient->id}/prescriptions", $payload);

        // Regular staff must be rejected with 403 Forbidden
        $response->assertStatus(403);
    }

    /**
     * Test 3: Doctor or Admin CAN issue prescriptions
     */
    public function test_dentist_can_issue_prescriptions(): void
    {
        $doctor = ClinicStaff::where('email', 'doctor@happysmiles.com')->first();
        $patient = Patient::create([
            'clinic_id' => $doctor->clinic_id,
            'full_name' => 'Jane Patient',
            'contact_number' => '09180003344',
        ]);

        Sanctum::actingAs($doctor);

        $payload = [
            'prescription_date' => now()->toDateString(),
            'doctor_name' => 'Dr. Happy Smile',
            'prc_license_number' => 'PRC-123456',
            'items' => [
                ['name' => 'Paracetamol', 'dosage' => '500mg', 'frequency' => 'Every 6 hours', 'quantity' => '10 tablets']
            ],
            'instructions' => 'Take for pain as needed'
        ];

        $response = $this->postJson("/api/dashboard/patients/{$patient->id}/prescriptions", $payload);

        $response->assertStatus(200);
        $response->assertJsonPath('success', true);
    }

    /**
     * Test 4: Staff JSON serialization hides invite_token and verification_token
     */
    public function test_staff_model_hides_sensitive_tokens(): void
    {
        $clinic = Clinic::first();
        $staff = ClinicStaff::create([
            'clinic_id' => $clinic->id,
            'name' => 'Pending Doctor',
            'email' => 'pending@happysmiles.com',
            'password' => bcrypt('password'),
            'role' => 'doctor',
            'invite_token' => 'super_secret_invite_token_xyz',
            'verification_token' => 'verify_token_123',
            'is_active' => true,
        ]);

        $serialized = $staff->toArray();

        $this->assertArrayNotHasKey('invite_token', $serialized);
        $this->assertArrayNotHasKey('verification_token', $serialized);
        $this->assertArrayNotHasKey('password', $serialized);
    }

    /**
     * Test 5: Clickjacking protection headers are enforced
     */
    public function test_security_headers_enforced(): void
    {
        $clinic = Clinic::first();
        $response = $this->getJson("/api/public/clinics/{$clinic->slug}/info");

        $response->assertHeader('X-Frame-Options', 'DENY');
        $response->assertHeader('X-Content-Type-Options', 'nosniff');
        $response->assertHeader('X-XSS-Protection', '1; mode=block');
        $this->assertStringContainsString("frame-ancestors 'none'", $response->headers->get('Content-Security-Policy'));
    }

    /**
     * Test 6: Messenger Webhook rejects invalid HMAC SHA256 signature
     */
    public function test_messenger_webhook_rejects_invalid_hmac_signature(): void
    {
        config(['services.facebook.app_secret' => 'super_secret_webhook_key']);

        $payload = json_encode(['object' => 'page', 'entry' => []]);

        $response = $this->call(
            'POST',
            route('webhook.handle'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_HUB_SIGNATURE_256' => 'sha256=invalid_forged_signature_hash',
            ],
            $payload
        );

        $response->assertStatus(403);
    }

    /**
     * Test 7: Messenger Webhook accepts legitimate HMAC SHA256 signature
     */
    public function test_messenger_webhook_accepts_valid_hmac_signature(): void
    {
        $secret = 'super_secret_webhook_key';
        config(['services.facebook.app_secret' => $secret]);

        $payload = json_encode(['object' => 'page', 'entry' => []]);
        $validSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);

        $response = $this->call(
            'POST',
            route('webhook.handle'),
            [],
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'HTTP_X_HUB_SIGNATURE_256' => $validSignature,
            ],
            $payload
        );

        $response->assertStatus(200);
    }

    /**
     * Test 8: Multi-Tenancy IDOR Protection - Staff without clinic_id is rejected with 403
     */
    public function test_staff_endpoint_blocks_user_without_clinic_id(): void
    {
        $clinic = Clinic::first();
        $orphanStaff = ClinicStaff::create([
            'clinic_id' => $clinic->id,
            'name' => 'Orphan User',
            'email' => 'orphan@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Nullify clinic_id on the in-memory user instance to simulate missing clinic_id
        $orphanStaff->clinic_id = null;

        Sanctum::actingAs($orphanStaff);

        $response = $this->getJson('/api/dashboard/staff');

        $response->assertStatus(403);
        $response->assertJson([
            'message' => 'Unauthorized: User has no associated clinic.'
        ]);
    }
}

