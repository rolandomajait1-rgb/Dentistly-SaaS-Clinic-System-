<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic, ClinicStaff, DentalService, Patient, Appointment};
use Database\Seeders\DentalSystemSeeder;
use Tests\TestCase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

class DashboardApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Seed the database with plans, clinics, staff, etc.
        $this->seed(DentalSystemSeeder::class);
    }

    public function test_login_authenticates_and_returns_token(): void
    {
        $payload = [
            'email' => 'doctor@happysmiles.com',
            'password' => 'password'
        ];

        $response = $this->postJson('/api/dashboard/auth/login', $payload);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role', 'clinic_id'],
                'clinic' => ['id', 'clinic_name'],
                'token'
            ]);

        $data = $response->json();
        $this->assertNotEmpty($data['token']);
        $this->assertEquals('doctor@happysmiles.com', $data['user']['email']);
    }

    public function test_login_fails_with_invalid_credentials(): void
    {
        $payload = [
            'email' => 'doctor@happysmiles.com',
            'password' => 'wrong-password'
        ];

        $response = $this->postJson('/api/dashboard/auth/login', $payload);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid email or password.'
            ]);
    }

    public function test_register_creates_clinic_and_staff_and_services(): void
    {
        $payload = [
            'clinic_name' => 'New Hope Dental',
            'owner_name' => 'Dr. Stephen Strange',
            'email' => 'strange@newhope.com',
            'password' => 'securepassword123',
            'password_confirmation' => 'securepassword123',
            'contact_number' => '09991234567',
            'address' => 'Bleecker St, New York',
        ];

        $response = $this->postJson('/api/dashboard/auth/register', $payload);

        $response->assertStatus(201)
            ->assertJson([
                'requires_verification' => true,
                'email' => 'strange@newhope.com',
            ]);

        // Assert clinic created in DB
        $this->assertDatabaseHas('clinics', [
            'clinic_name' => 'New Hope Dental',
            'contact_number' => '09991234567',
        ]);

        // Assert owner staff created
        $this->assertDatabaseHas('clinic_staff', [
            'email' => 'strange@newhope.com',
            'name' => 'Dr. Stephen Strange',
            'role' => 'owner',
        ]);

        // Assert 4 default services were created
        $staff = ClinicStaff::where('email', 'strange@newhope.com')->first();
        $this->assertEquals(4, DentalService::where('clinic_id', $staff->clinic_id)->count());
    }

    public function test_protected_endpoints_require_authentication(): void
    {
        // Overview requires auth
        $response = $this->getJson('/api/dashboard/overview');
        $response->assertStatus(401);

        // Patients requires auth
        $response = $this->getJson('/api/dashboard/patients');
        $response->assertStatus(401);
    }

    public function test_protected_endpoints_succeed_with_authentication(): void
    {
        $staff = ClinicStaff::where('email', 'doctor@happysmiles.com')->first();
        
        // Use Sanctum helper to authenticate the request
        Sanctum::actingAs($staff);

        $response = $this->getJson('/api/dashboard/overview');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => ['totalPatients', 'pendingAppointments', 'activeQueue', 'completedToday'],
                'todayAppointments'
            ]);
    }

    public function test_data_isolation_between_clinics(): void
    {
        // Clinic A
        $staffA = ClinicStaff::where('email', 'doctor@happysmiles.com')->first();
        
        // Create Clinic B and Staff B
        $tenantB = Tenant::create([
            'tenant_name' => 'Tenant B',
            'subdomain' => 'tenant-b',
        ]);

        $clinicB = Clinic::create([
            'tenant_id' => $tenantB->id,
            'clinic_name' => 'Clinic B',
            'owner_name' => 'Owner B',
            'email' => 'ownerb@clinicb.com',
            'contact_number' => '123',
            'address' => 'Address B',
        ]);
        $staffB = ClinicStaff::create([
            'clinic_id' => $clinicB->id,
            'name' => 'Staff B',
            'email' => 'staffb@clinicb.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'is_active' => true,
        ]);

        // Create a patient in Clinic B
        $patientB = Patient::create([
            'clinic_id' => $clinicB->id,
            'fb_messenger_id' => 'messenger_b_123',
            'full_name' => 'Patient B Name',
            'contact_number' => '999',
        ]);

        // Query patients as Staff A (Clinic A)
        Sanctum::actingAs($staffA);
        $response = $this->getJson('/api/dashboard/patients');
        
        $response->assertStatus(200);
        $data = $response->json();
        
        // Verify patient from Clinic B is NOT returned for Clinic A
        foreach ($data as $patient) {
            $this->assertNotEquals('Patient B Name', $patient['full_name']);
            $this->assertEquals($staffA->clinic_id, $patient['clinic_id']);
        }
    }

    public function test_logout_revokes_token(): void
    {
        $staff = ClinicStaff::where('email', 'doctor@happysmiles.com')->first();
        
        // Log in first to create token
        $tokenResult = $staff->createToken('test-token');
        $token = $tokenResult->plainTextToken;

        $response = $this->postJson('/api/dashboard/auth/logout', [], [
            'Authorization' => 'Bearer ' . $token
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Logged out successfully.'
            ]);

        // Assert token was deleted
        $this->assertEquals(0, $staff->tokens()->count());
    }

    public function test_get_notifications_returns_pending_appointments_and_unread_count(): void
    {
        $staff = ClinicStaff::where('email', 'doctor@happysmiles.com')->first();
        Sanctum::actingAs($staff);

        // Clear any previous cache
        \Illuminate\Support\Facades\Cache::forget("clinic_notifs_read_{$staff->id}");
        \Illuminate\Support\Facades\Cache::forget("clinic_notifs_cleared_at_{$staff->id}");

        $response = $this->getJson('/api/dashboard/notifications');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'notifications' => [
                    '*' => ['id', 'title', 'description', 'time', 'type', 'read', 'icon', 'actionTab', 'appointmentId']
                ],
                'unread_count'
            ]);

        $this->assertIsInt($response->json('unread_count'));
    }

    public function test_mark_notification_as_read_and_read_all(): void
    {
        $staff = ClinicStaff::where('email', 'doctor@happysmiles.com')->first();
        Sanctum::actingAs($staff);

        \Illuminate\Support\Facades\Cache::forget("clinic_notifs_read_{$staff->id}");
        \Illuminate\Support\Facades\Cache::forget("clinic_notifs_cleared_at_{$staff->id}");

        $initialResponse = $this->getJson('/api/dashboard/notifications');
        $initialUnread = $initialResponse->json('unread_count');
        $notifs = $initialResponse->json('notifications');

        if (!empty($notifs)) {
            $firstNotif = $notifs[0];
            $markReadResp = $this->postJson("/api/dashboard/notifications/{$firstNotif['id']}/read");
            $markReadResp->assertStatus(200)->assertJson(['success' => true]);

            // Re-fetch and verify unread count decreased or item is marked as read
            $updatedResponse = $this->getJson('/api/dashboard/notifications');
            $updatedNotif = collect($updatedResponse->json('notifications'))->firstWhere('id', $firstNotif['id']);
            $this->assertTrue($updatedNotif['read']);

            // Test mark-all-read
            $markAllResp = $this->postJson('/api/dashboard/notifications/read-all');
            $markAllResp->assertStatus(200)->assertJson(['success' => true]);

            $afterAllRead = $this->getJson('/api/dashboard/notifications');
            $this->assertEquals(0, $afterAllRead->json('unread_count'));

            // Test clear-all
            $clearResp = $this->deleteJson('/api/dashboard/notifications');
            $clearResp->assertStatus(200)->assertJson(['success' => true]);

            $afterClear = $this->getJson('/api/dashboard/notifications');
            $this->assertEmpty($afterClear->json('notifications'));
        }
    }

    public function test_appointment_cancellation_stores_cancellation_reason(): void
    {
        $staff = ClinicStaff::where('email', 'doctor@happysmiles.com')->first();
        Sanctum::actingAs($staff);

        $patient = Patient::firstOrCreate(
            ['clinic_id' => $staff->clinic_id, 'contact_number' => '09123456789'],
            ['full_name' => 'John Doe', 'email' => 'john@example.com']
        );
        $service = DentalService::firstOrCreate(
            ['clinic_id' => $staff->clinic_id, 'service_name' => 'Consultation'],
            ['price' => 500, 'duration_minutes' => 30]
        );

        $appointment = Appointment::create([
            'clinic_id' => $staff->clinic_id,
            'patient_id' => $patient->id,
            'dental_service_id' => $service->id,
            'appointment_date' => now()->addDays(2)->toDateString(),
            'appointment_time' => '10:00:00',
            'status' => 'Pending',
        ]);

        $response = $this->postJson("/api/dashboard/appointments/{$appointment->id}/status", [
            'status' => 'Cancelled',
            'cancellation_reason' => 'Patient requested cancellation',
        ]);

        $response->assertStatus(200);
        $appointment->refresh();
        $this->assertEquals('Cancelled', $appointment->status);
        $this->assertEquals('Patient requested cancellation', $appointment->cancellation_reason);
    }

    public function test_appointment_move_to_end_of_queue_updates_queue_number_and_status(): void
    {
        $staff = ClinicStaff::where('email', 'doctor@happysmiles.com')->first();
        Sanctum::actingAs($staff);

        $patient = Patient::firstOrCreate(
            ['clinic_id' => $staff->clinic_id, 'contact_number' => '09123456780'],
            ['full_name' => 'Izzie Stevens', 'email' => 'izzie@example.com']
        );
        $service = DentalService::firstOrCreate(
            ['clinic_id' => $staff->clinic_id, 'service_name' => 'Consultation'],
            ['price' => 500, 'duration_minutes' => 30]
        );

        $today = now()->toDateString();
        $appointment = Appointment::create([
            'clinic_id' => $staff->clinic_id,
            'patient_id' => $patient->id,
            'dental_service_id' => $service->id,
            'appointment_date' => $today,
            'appointment_time' => '13:00:00',
            'status' => 'Pending',
            'queue_number' => 1,
        ]);

        $response = $this->postJson("/api/dashboard/appointments/{$appointment->id}/status", [
            'status' => 'Approved',
            'move_to_end_of_queue' => true,
        ]);

        $response->assertStatus(200);
        $appointment->refresh();
        $this->assertEquals('Approved', $appointment->status);
        $this->assertGreaterThanOrEqual(1, $appointment->queue_number);
        $this->assertStringContainsString('Late arrival - moved to end of queue', $appointment->staff_notes);
    }
}
