<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\{Tenant, Clinic, ClinicStaff, Patient, Appointment, DentalService};
use App\Services\SmsChatbotService;

class SmsChatbotTest extends TestCase
{
    use RefreshDatabase;

    protected Clinic $clinic;
    protected ClinicStaff $staff;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::create([
            'tenant_name' => 'SmileCare Tenant',
            'subdomain' => 'smilecare-sms',
            'status' => 'active',
        ]);

        $this->clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'Bright Smile Dental',
            'owner_name' => 'Dr. Alex Reed',
            'email' => 'contact@brightsmile.ph',
            'contact_number' => '09171112222',
            'address' => '123 Dental Ave, Quezon City',
            'status' => 'active',
        ]);

        $this->staff = ClinicStaff::create([
            'clinic_id' => $this->clinic->id,
            'name' => 'Dr. Alex Reed',
            'email' => 'alex@brightsmile.ph',
            'password' => bcrypt('password123'),
            'role' => 'owner',
            'is_active' => true,
        ]);

        DentalService::create([
            'clinic_id' => $this->clinic->id,
            'service_name' => 'Teeth Cleaning',
            'price' => 800,
            'is_active' => true,
            'sort_order' => 1,
        ]);
    }

    public function test_inbound_sms_greeting_returns_main_menu(): void
    {
        $service = resolve(SmsChatbotService::class);
        $reply = $service->handleInboundSms($this->clinic, '09171234567', 'HI');

        $this->assertStringContainsString('Good day! Welcome to Bright Smile Dental!', $reply);
        $this->assertStringContainsString('1. Book Appointment', $reply);
        $this->assertStringContainsString('3. Treatments & Prices', $reply);
    }

    public function test_inbound_sms_prices_option_returns_treatment_catalog(): void
    {
        $service = resolve(SmsChatbotService::class);
        $reply = $service->handleInboundSms($this->clinic, '09171234567', '3');

        $this->assertStringContainsString('TREATMENTS & PRICES', $reply);
        $this->assertStringContainsString('Teeth Cleaning: ₱800.00', $reply);
    }

    public function test_inbound_sms_location_option_returns_clinic_info(): void
    {
        $service = resolve(SmsChatbotService::class);
        $reply = $service->handleInboundSms($this->clinic, '09171234567', '4');

        $this->assertStringContainsString('LOCATION & HOURS', $reply);
        $this->assertStringContainsString('123 Dental Ave, Quezon City', $reply);
    }

    public function test_public_inbound_sms_webhook(): void
    {
        $response = $this->postJson('/api/webhook/sms', [
            'number' => '09171234567',
            'message' => 'MENU',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');
    }

    public function test_dashboard_sms_chatbot_simulator_endpoint(): void
    {
        $response = $this->actingAs($this->staff, 'sanctum')
            ->postJson('/api/dashboard/settings/test-inbound-sms', [
                'phone' => '09171234567',
                'message' => '3',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('incoming_message', '3');
    }
}
