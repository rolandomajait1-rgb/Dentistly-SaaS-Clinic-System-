<?php

namespace Tests\Feature;

use App\Models\{Tenant, Clinic, ClinicStaff, Patient, DentalService};
use Tests\TestCase;
use Laravel\Sanctum\Sanctum;
use Illuminate\Support\Facades\Hash;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TenancyTest extends TestCase
{
    use RefreshDatabase;

    public function test_global_clinic_scope_filters_models_automatically(): void
    {
        // Create Clinic A and Staff A
        $tenantA = Tenant::create(['tenant_name' => 'Tenant A', 'subdomain' => 'tenant-a']);
        $clinicA = Clinic::create([
            'tenant_id' => $tenantA->id,
            'clinic_name' => 'Clinic A',
            'owner_name' => 'Owner A',
            'email' => 'a@a.com',
            'contact_number' => '1',
            'address' => 'A'
        ]);
        $staffA = ClinicStaff::create([
            'clinic_id' => $clinicA->id,
            'name' => 'Staff A',
            'email' => 'staffa@a.com',
            'password' => Hash::make('password'),
            'role' => 'owner'
        ]);

        // Create Clinic B and Staff B
        $tenantB = Tenant::create(['tenant_name' => 'Tenant B', 'subdomain' => 'tenant-b']);
        $clinicB = Clinic::create([
            'tenant_id' => $tenantB->id,
            'clinic_name' => 'Clinic B',
            'owner_name' => 'Owner B',
            'email' => 'b@b.com',
            'contact_number' => '2',
            'address' => 'B'
        ]);
        $staffB = ClinicStaff::create([
            'clinic_id' => $clinicB->id,
            'name' => 'Staff B',
            'email' => 'staffb@b.com',
            'password' => Hash::make('password'),
            'role' => 'owner'
        ]);

        // Create Patients for both clinics
        Patient::create([
            'clinic_id' => $clinicA->id,
            'fb_messenger_id' => 'pat_a',
            'full_name' => 'Patient A',
            'contact_number' => '123'
        ]);
        Patient::create([
            'clinic_id' => $clinicB->id,
            'fb_messenger_id' => 'pat_b',
            'full_name' => 'Patient B',
            'contact_number' => '456'
        ]);

        // Create Dental Services for both clinics
        DentalService::create([
            'clinic_id' => $clinicA->id,
            'service_name' => 'Service A',
            'price' => 100,
            'duration_minutes' => 30,
            'category' => 'General'
        ]);
        DentalService::create([
            'clinic_id' => $clinicB->id,
            'service_name' => 'Service B',
            'price' => 200,
            'duration_minutes' => 30,
            'category' => 'General'
        ]);

        // 1. Unauthenticated (e.g. public guests/webhooks): Scopes should NOT filter out records
        $this->assertCount(2, Patient::all());
        $this->assertCount(2, DentalService::all());

        // 2. Authenticated as Staff A: Querying Patient and DentalService should only yield Clinic A records
        Sanctum::actingAs($staffA);

        $patientsA = Patient::all();
        $this->assertCount(1, $patientsA);
        $this->assertEquals('Patient A', $patientsA->first()->full_name);

        $servicesA = DentalService::all();
        $this->assertCount(1, $servicesA);
        $this->assertEquals('Service A', $servicesA->first()->service_name);

        // 3. Authenticated as Staff B: Querying Patient and DentalService should only yield Clinic B records
        Sanctum::actingAs($staffB);

        $patientsB = Patient::all();
        $this->assertCount(1, $patientsB);
        $this->assertEquals('Patient B', $patientsB->first()->full_name);

        $servicesB = DentalService::all();
        $this->assertCount(1, $servicesB);
        $this->assertEquals('Service B', $servicesB->first()->service_name);
    }
}
