<?php

namespace Tests\Feature;

use App\Models\{User, ClinicStaff, Tenant, Clinic};
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SuperadminTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_login_successfully(): void
    {
        // Create a superadmin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('secret123'),
            'is_superadmin' => true,
        ]);

        $response = $this->postJson('/api/superadmin/auth/login', [
            'email' => 'admin@test.com',
            'password' => 'secret123'
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'name', 'email', 'role', 'is_superadmin'],
                'token'
            ]);
    }

    public function test_normal_user_cannot_login_as_superadmin(): void
    {
        // Create a normal user
        User::create([
            'name' => 'Normal User',
            'email' => 'user@test.com',
            'password' => Hash::make('secret123'),
            'is_superadmin' => false,
        ]);

        $response = $this->postJson('/api/superadmin/auth/login', [
            'email' => 'user@test.com',
            'password' => 'secret123'
        ]);

        $response->assertStatus(401);
    }

    public function test_unauthorized_users_blocked_from_superadmin_endpoints(): void
    {
        // 1. Completely unauthenticated guest
        $response = $this->getJson('/api/superadmin/stats');
        $response->assertStatus(401);

        // 2. Authenticated as standard clinic staff (non-superadmin)
        $tenant = Tenant::create(['tenant_name' => 'Demo Tenant', 'subdomain' => 'demo']);
        $clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'Demo Clinic',
            'owner_name' => 'Owner',
            'email' => 'owner@clinic.com',
            'contact_number' => '123',
            'address' => '123'
        ]);
        $staff = ClinicStaff::create([
            'clinic_id' => $clinic->id,
            'name' => 'Staff Doctor',
            'email' => 'doctor@clinic.com',
            'password' => Hash::make('password'),
            'role' => 'doctor'
        ]);

        Sanctum::actingAs($staff);

        $response = $this->getJson('/api/superadmin/stats');
        // Middleware should block this
        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Unauthorized. Superadmin access required.'
            ]);
    }

    public function test_authenticated_superadmin_can_access_endpoints(): void
    {
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@test.com',
            'password' => Hash::make('secret123'),
            'is_superadmin' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/superadmin/stats');
        $response->assertStatus(200)
            ->assertJsonStructure([
                'stats' => ['totalClinics', 'totalPatients', 'totalAppointments', 'activeTrials', 'activePlans'],
                'planBreakdown'
            ]);
    }
}
