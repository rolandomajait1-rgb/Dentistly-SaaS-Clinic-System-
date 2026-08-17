<?php

namespace Database\Seeders;

use App\Models\Clinic;
use App\Models\FbPageIntegration;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\Tenant;
use App\Models\DentalService;
use App\Models\CalendarSlot;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DentalClinicSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Tenant
        $tenant = Tenant::create([
            'tenant_name' => 'Happy Smiles',
            'subdomain'   => 'happysmiles',
            'status'      => 'active',
        ]);

        // 2. Clinic
        $clinic = Clinic::create([
            'tenant_id'       => $tenant->id,
            'clinic_name'     => 'Happy Smiles Dental Clinic',
            'owner_name'      => 'Dr. Juan Santos',
            'email'           => 'info@happysmiles.com',
            'contact_number'  => '02-1234-5678',
            'address'         => '123 Main Street, Makati City, Metro Manila',
            'timezone'        => 'Asia/Manila',
            'status'          => 'active',
            'operating_hours' => json_encode([
                'Monday'    => '09:00 - 18:00',
                'Tuesday'   => '09:00 - 18:00',
                'Wednesday' => '09:00 - 18:00',
                'Thursday'  => '09:00 - 18:00',
                'Friday'    => '09:00 - 18:00',
                'Saturday'  => '09:00 - 15:00',
                'Sunday'    => 'Closed',
            ]),
        ]);

        // 3. Subscription Plan
        $plan = SubscriptionPlan::create([
            'plan_name'          => 'Trial Plan',
            'plan_code'          => 'TRIAL',
            'monthly_price'      => 0,
            'appointment_limit'  => 100,
            'staff_limit'        => 5,
            'branch_limit'       => 1,
            'features'           => json_encode(['chatbot', 'calendar', 'reminders']),
            'is_active'          => true,
            'trial_days'         => 30,
        ]);

        // 4. Subscription
        Subscription::create([
            'clinic_id'            => $clinic->id,
            'subscription_plan_id' => $plan->id,
            'status'               => 'trial',
            'start_date'           => now()->toDateString(),
            'end_date'             => now()->addYear()->toDateString(),
            'trial_ends_at'        => now()->addMonth()->toDateString(),
        ]);

        // 5. Facebook Page Integration
        FbPageIntegration::create([
            'clinic_id'            => $clinic->id,
            'fb_page_id'           => env('FB_PAGE_ID', ''),
            'fb_page_name'         => 'Happy Smiles Dental Clinic',
            'page_access_token'    => env('MESSENGER_PAGE_ACCESS_TOKEN', ''),
            'webhook_verify_token' => env('MESSENGER_VERIFY_TOKEN', ''),
            'is_active'            => true,
            'connected_at'         => now(),
        ]);

        // 6. Dental Services
        $services = [
            ['service_name' => 'Dental Cleaning',      'price' => 500,  'duration_minutes' => 30,  'description' => 'Professional teeth cleaning'],
            ['service_name' => 'Tooth Extraction',     'price' => 800,  'duration_minutes' => 45,  'description' => 'Simple tooth extraction'],
            ['service_name' => 'Dental Filling',       'price' => 1200, 'duration_minutes' => 60,  'description' => 'Composite resin filling'],
            ['service_name' => 'Teeth Whitening',      'price' => 3500, 'duration_minutes' => 90,  'description' => 'Professional whitening treatment'],
            ['service_name' => 'Root Canal Treatment', 'price' => 5000, 'duration_minutes' => 120, 'description' => 'Complete root canal therapy'],
        ];

        foreach ($services as $i => $svc) {
            DentalService::create(array_merge($svc, [
                'clinic_id'  => $clinic->id,
                'is_active'  => true,
                'sort_order' => $i,
            ]));
        }

        // 7. Calendar Slots (next 14 days, Mon-Sat, 9am-5pm every hour)
        $times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
        $slotCount = 0;

        for ($i = 1; $i <= 14; $i++) {
            $date = Carbon::today()->addDays($i);
            if ($date->dayOfWeek === Carbon::SUNDAY) {
                continue;
            }
            foreach ($times as $time) {
                CalendarSlot::create([
                    'clinic_id' => $clinic->id,
                    'slot_date' => $date->toDateString(),
                    'slot_time' => $time,
                    'status'    => 'available',
                ]);
                $slotCount++;
            }
        }

        $this->command->info('');
        $this->command->info('✅ Dental Clinic seeded successfully!');
        $this->command->info('   Clinic ID     : ' . $clinic->id);
        $this->command->info('   FB Page ID    : ' . env('FB_PAGE_ID', '(not set)'));
        $this->command->info('   Services      : ' . count($services));
        $this->command->info('   Calendar Slots: ' . $slotCount);
    }
}
