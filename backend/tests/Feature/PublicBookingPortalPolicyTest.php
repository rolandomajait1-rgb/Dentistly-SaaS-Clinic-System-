<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic, DentalService, CalendarSlot, Patient, Appointment, ChatSession, FbPageIntegration};
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Carbon\Carbon;

class PublicBookingPortalPolicyTest extends TestCase
{
    use RefreshDatabase;

    protected $clinic;
    protected $service;

    protected function setUp(): void
    {
        parent::setUp();

        $tenant = Tenant::create(['tenant_name' => 'Smile Care', 'subdomain' => 'smilecare']);
        $this->clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'Smile Care Clinic',
            'owner_name' => 'Dr. Smile',
            'email' => 'smile@clinic.com',
            'contact_number' => '09123456789',
            'address' => 'Makati City',
            'operating_hours' => [
                'monday' => ['enabled' => true, 'open' => '09:00 AM', 'close' => '05:00 PM'],
                'tuesday' => ['enabled' => true, 'open' => '09:00 AM', 'close' => '05:00 PM'],
                'wednesday' => ['enabled' => true, 'open' => '09:00 AM', 'close' => '05:00 PM'],
                'thursday' => ['enabled' => true, 'open' => '09:00 AM', 'close' => '05:00 PM'],
                'friday' => ['enabled' => true, 'open' => '09:00 AM', 'close' => '05:00 PM'],
                'saturday' => ['enabled' => true, 'open' => '09:00 AM', 'close' => '05:00 PM'],
                'sunday' => ['enabled' => false, 'open' => '09:00 AM', 'close' => '05:00 PM'],
            ],
            'notification_settings' => [
                'allow_same_day_booking' => false,
                'advance_booking_limit' => '2 weeks',
                'cancellation_lock_window_hours' => 24,
                'booking_policy_notice' => 'Strictly by appointment. Arrive 15 mins early.',
            ],
        ]);

        $this->service = DentalService::create([
            'clinic_id' => $this->clinic->id,
            'service_name' => 'Tooth Extraction',
            'category' => 'Oral Surgery',
            'price' => 1500,
            'duration_minutes' => 45,
            'is_active' => true,
        ]);
    }

    public function test_info_endpoint_returns_policies_and_booking_url()
    {
        $response = $this->getJson("/api/public/clinics/smilecare/info");

        $response->assertStatus(200);
        $response->assertJsonPath('clinic_name', 'Smile Care Clinic');
        $response->assertJsonPath('notification_settings.allow_same_day_booking', false);
        $response->assertJsonPath('notification_settings.advance_booking_limit', '2 weeks');
        $response->assertJsonPath('notification_settings.booking_policy_notice', 'Strictly by appointment. Arrive 15 mins early.');
        $this->assertStringContainsString('/book/smilecare', $response->json('public_booking_url'));
    }

    public function test_slots_endpoint_enforces_advance_limit_and_same_day_policy()
    {
        // Create slot for today (should be excluded because allow_same_day_booking = false)
        CalendarSlot::create([
            'clinic_id' => $this->clinic->id,
            'slot_date' => Carbon::today()->toDateString(),
            'slot_time' => '10:00:00',
            'status' => 'available',
        ]);

        // Create slot for 5 days from now (should be included)
        $futureOpenDate = Carbon::today()->addDays(5);
        if ($futureOpenDate->isSunday()) {
            $futureOpenDate = $futureOpenDate->addDay();
        }
        CalendarSlot::create([
            'clinic_id' => $this->clinic->id,
            'slot_date' => $futureOpenDate->toDateString(),
            'slot_time' => '11:00:00',
            'status' => 'available',
        ]);

        // Create slot for 30 days from now (should be excluded because limit is 2 weeks = 14 days)
        CalendarSlot::create([
            'clinic_id' => $this->clinic->id,
            'slot_date' => Carbon::today()->addDays(30)->toDateString(),
            'slot_time' => '14:00:00',
            'status' => 'available',
        ]);

        $response = $this->getJson("/api/public/clinics/smilecare/slots");

        $response->assertStatus(200);
        $slots = $response->json();

        // Assert today's date is not present
        $this->assertArrayNotHasKey(Carbon::today()->toDateString(), $slots);

        // Assert 5-day slot is present
        $this->assertArrayHasKey($futureOpenDate->toDateString(), $slots);

        // Assert 30-day slot is not present
        $this->assertArrayNotHasKey(Carbon::today()->addDays(30)->toDateString(), $slots);
    }

    public function test_booking_submission_rejects_same_day_when_disallowed()
    {
        CalendarSlot::create([
            'clinic_id' => $this->clinic->id,
            'slot_date' => Carbon::today()->toDateString(),
            'slot_time' => '10:00:00',
            'status' => 'available',
        ]);

        $payload = [
            'service_id' => $this->service->id,
            'date' => Carbon::today()->toDateString(),
            'time' => '10:00',
            'name' => 'Juan Dela Cruz',
            'contact' => '09112223333',
            'address' => 'Manila',
            'age' => 25,
            'reason' => 'Pain',
        ];

        $response = $this->postJson("/api/public/clinics/smilecare/bookings", $payload);

        $response->assertStatus(400);
        $response->assertJson(['error' => 'Clinic policy does not permit same-day bookings. Please select a date starting tomorrow.']);
    }

    public function test_cancellation_lock_window_enforced()
    {
        $patient = Patient::create([
            'clinic_id' => $this->clinic->id,
            'full_name' => 'Maria Clara',
            'contact_number' => '09181234567',
            'address' => 'Quezon City',
            'age' => 30,
        ]);

        // Appointment scheduled 2 hours from now (clinic lock window is 24 hours)
        $nearDate = Carbon::now()->addHours(2);
        $appointment = Appointment::create([
            'clinic_id' => $this->clinic->id,
            'patient_id' => $patient->id,
            'dental_service_id' => $this->service->id,
            'appointment_date' => $nearDate->toDateString(),
            'appointment_time' => $nearDate->format('H:i:s'),
            'status' => 'pending',
            'reference_number' => 'REF-TEST999',
            'queue_number' => 1,
            'reason_for_visit' => 'Cleaning',
        ]);

        $response = $this->postJson("/api/public/clinics/smilecare/appointments/cancel", [
            'reference_number' => 'REF-TEST999',
            'contact_number' => '09181234567',
            'reason' => 'Busy',
        ]);

        $response->assertStatus(400);
        $this->assertStringContainsString('cannot be cancelled within 24 hour(s)', $response->json('error'));
    }
}
