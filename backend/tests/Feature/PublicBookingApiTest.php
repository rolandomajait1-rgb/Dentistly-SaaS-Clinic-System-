<?php

namespace Tests\Feature;

use App\Models\{Clinic, DentalService, CalendarSlot, Patient, Appointment};
use Database\Seeders\DentalSystemSeeder;
use Tests\TestCase;
use Carbon\Carbon;

class PublicBookingApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Seed the database with default clinics, plans, services, and slots
        $this->seed(DentalSystemSeeder::class);
    }

    public function test_can_get_services(): void
    {
        $response = $this->getJson('/api/public/clinics/happysmiles/services');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'General Dentistry' => [
                    '*' => ['id', 'service_name', 'price', 'duration_minutes']
                ]
            ]);
    }

    public function test_can_get_available_slots(): void
    {
        $response = $this->getJson('/api/public/clinics/happysmiles/slots');

        $response->assertStatus(200);
        
        // Assert structure is date => list of times
        $data = $response->json();
        if (!empty($data)) {
            $firstDate = array_key_first($data);
            $this->assertIsArray($data[$firstDate]);
        }
    }

    public function test_can_create_booking_successfully(): void
    {
        $clinic = Clinic::first();
        $service = DentalService::where('clinic_id', $clinic->id)->first();
        $slot = CalendarSlot::where('clinic_id', $clinic->id)
            ->where('status', 'available')
            ->first();

        $dateStr = $slot->slot_date instanceof Carbon 
            ? $slot->slot_date->toDateString() 
            : Carbon::parse($slot->slot_date)->toDateString();

        $timeStr = Carbon::parse($slot->slot_time)->format('H:i');

        $payload = [
            'service_id' => $service->id,
            'date' => $dateStr,
            'time' => $timeStr,
            'name' => 'John Doe',
            'contact' => '09123456789',
            'address' => '456 Elm St, Manila',
            'age' => 30,
            'medical_history' => 'Heart condition',
            'reason' => 'Routine teeth cleaning'
        ];

        $response = $this->postJson("/api/public/clinics/happysmiles/bookings", $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'queue_number',
                'reference_number',
                'appointment_id'
            ]);

        // Assert patient created
        $this->assertDatabaseHas('patients', [
            'clinic_id' => $clinic->id,
            'full_name' => 'John Doe',
            'contact_number' => '09123456789',
        ]);

        // Assert appointment created
        $this->assertDatabaseHas('appointments', [
            'clinic_id' => $clinic->id,
            'dental_service_id' => $service->id,
            'appointment_time' => $slot->slot_time,
            'status' => 'pending',
        ]);

        // Assert slot status updated to booked
        $slot->refresh();
        $this->assertEquals('booked', $slot->status);
    }

    public function test_booking_fails_on_double_booking(): void
    {
        $clinic = Clinic::first();
        $service = DentalService::where('clinic_id', $clinic->id)->first();
        $slot = CalendarSlot::where('clinic_id', $clinic->id)
            ->where('status', 'available')
            ->first();

        $dateStr = $slot->slot_date instanceof Carbon 
            ? $slot->slot_date->toDateString() 
            : Carbon::parse($slot->slot_date)->toDateString();

        $timeStr = Carbon::parse($slot->slot_time)->format('H:i');

        $payload = [
            'service_id' => $service->id,
            'date' => $dateStr,
            'time' => $timeStr,
            'name' => 'John Doe',
            'contact' => '09123456789',
            'address' => '456 Elm St, Manila',
            'age' => 30,
            'medical_history' => 'None',
            'reason' => 'Checkup'
        ];

        // First booking succeeds
        $response1 = $this->postJson("/api/public/clinics/happysmiles/bookings", $payload);
        $response1->assertStatus(200);

        // Second booking for the same slot fails
        $response2 = $this->postJson("/api/public/clinics/happysmiles/bookings", $payload);
        $response2->assertStatus(400)
            ->assertJson([
                'error' => 'Double-booking error: This slot was just taken. Please choose another slot.'
            ]);
    }
}
