<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\{Tenant, Clinic, SubscriptionPlan, Subscription, FbPageIntegration, DentalService, ClinicStaff, CalendarSlot};
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class DentalSystemSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Starting Dental System Seeder...');

        // Create default platform superadmin
        \App\Models\User::updateOrCreate(
            ['email' => 'admin@dentalsaas.com'],
            [
                'name' => 'SaaS Administrator',
                'password' => Hash::make('superadmin123'),
                'is_superadmin' => true,
            ]
        );

        // Create subscription plans
        $this->command->info('📋 Creating subscription plans...');
        
        $freePlan = SubscriptionPlan::create([
            'plan_name' => 'Free Trial',
            'plan_code' => 'FREE',
            'monthly_price' => 0,
            'appointment_limit' => 50,
            'staff_limit' => 1,
            'branch_limit' => 1,
            'features' => ['basic_booking', 'messenger_bot'],
            'is_active' => true,
            'trial_days' => 30,
        ]);

        $basicPlan = SubscriptionPlan::create([
            'plan_name' => 'Basic',
            'plan_code' => 'BASIC',
            'monthly_price' => 999,
            'appointment_limit' => 200,
            'staff_limit' => 3,
            'branch_limit' => 1,
            'features' => ['basic_booking', 'messenger_bot', 'sms_notifications', 'basic_analytics'],
            'is_active' => true,
            'trial_days' => 0,
        ]);

        $proPlan = SubscriptionPlan::create([
            'plan_name' => 'Professional',
            'plan_code' => 'PRO',
            'monthly_price' => 1999,
            'appointment_limit' => null, // unlimited
            'staff_limit' => 10,
            'branch_limit' => 1,
            'features' => ['basic_booking', 'messenger_bot', 'sms_notifications', 'email_notifications', 'advanced_analytics', 'custom_branding', 'api_access'],
            'is_active' => true,
            'trial_days' => 0,
        ]);

        $enterprisePlan = SubscriptionPlan::create([
            'plan_name' => 'Enterprise',
            'plan_code' => 'ENTERPRISE',
            'monthly_price' => 3999,
            'appointment_limit' => null, // unlimited
            'staff_limit' => null, // unlimited
            'branch_limit' => 10,
            'features' => ['basic_booking', 'messenger_bot', 'sms_notifications', 'email_notifications', 'advanced_analytics', 'custom_branding', 'api_access', 'white_label', 'priority_support', 'custom_features'],
            'is_active' => true,
            'trial_days' => 0,
        ]);

        $this->command->info('✅ Subscription plans created');

        // Create demo tenant
        $this->command->info('🏢 Creating demo tenant...');
        
        $tenant = Tenant::create([
            'tenant_name' => 'Happy Smiles Dental',
            'subdomain' => 'happysmiles',
            'status' => 'active',
        ]);

        $this->command->info('✅ Tenant created');

        // Create demo clinic
        $this->command->info('🏥 Creating demo clinic...');
        
        $clinic = Clinic::create([
            'tenant_id' => $tenant->id,
            'clinic_name' => 'Happy Smiles Dental Clinic',
            'owner_name' => 'Dr. Juan Santos',
            'email' => 'info@happysmiles.com',
            'contact_number' => '02-1234-5678',
            'address' => '123 Main Street, Makati City, Metro Manila',
            'timezone' => 'Asia/Manila',
            'operating_hours' => [
                'Monday' => '09:00 - 18:00',
                'Tuesday' => '09:00 - 18:00',
                'Wednesday' => '09:00 - 18:00',
                'Thursday' => '09:00 - 18:00',
                'Friday' => '09:00 - 18:00',
                'Saturday' => '09:00 - 15:00',
                'Sunday' => 'Closed',
            ],
            'status' => 'active',
            'notification_settings' => [
                'sms_enabled' => true,
                'email_enabled' => true,
                'chatbot_enabled' => true,
                'sms_reminder_enabled' => true,
                'sms_confirmation_enabled' => true,
                'sms_followup_enabled' => true,
                'email_confirmation_enabled' => true,
                'email_reminder_enabled' => true,
                'email_post_visit_enabled' => true,
                'sms_template_approved' => 'Hi {patient_name}, your appointment at {clinic_name} on {date} at {time} for {service_name} has been APPROVED. Reference: {reference}. See you!',
                'sms_template_cancelled' => 'Hi {patient_name}, your appointment at {clinic_name} has been CANCELLED. {reason} Contact us at {clinic_phone}.',
                'email_subject_approved' => 'Confirmed: Your Appointment at {clinic_name}',
                'email_body_approved' => '<p>Dear <strong>{patient_name}</strong>,</p><p>Great news! Your dental appointment for <strong>{service_name}</strong> on <strong>{date}</strong> at <strong>{time}</strong> has been approved and confirmed by our team.</p><p>Reference: <strong>{reference}</strong></p><p>See you soon!</p>',
                'email_subject_cancelled' => 'Cancelled: Your Appointment at {clinic_name}',
                'email_body_cancelled' => '<p>Dear <strong>{patient_name}</strong>,</p><p>Please be advised that your appointment (Ref: {reference}) has been cancelled.</p><p>{reason}</p>',
            ]
        ]);

        $this->command->info('✅ Clinic created');

        // Create subscription
        $this->command->info('💳 Creating subscription...');
        
        Subscription::create([
            'clinic_id' => $clinic->id,
            'subscription_plan_id' => $proPlan->id,
            'status' => 'trial',
            'start_date' => now(),
            'end_date' => now()->addMonth(),
            'trial_ends_at' => now()->addDays(30),
        ]);

        $this->command->info('✅ Subscription created');

        // Create FB integration (placeholder)
        $this->command->info('📱 Creating FB integration...');
        
        FbPageIntegration::create([
            'clinic_id' => $clinic->id,
            'fb_page_id' => 'YOUR_PAGE_ID_HERE',
            'fb_page_name' => 'Happy Smiles Dental',
            'page_access_token' => 'YOUR_PAGE_ACCESS_TOKEN_HERE',
            'webhook_verify_token' => 'dental_appointment_webhook_token',
            'is_active' => false, // Set to true after configuring
            'connected_at' => now(),
        ]);

        $this->command->info('⚠️  FB integration created (inactive - update with real credentials)');

        // Create staff
        $this->command->info('👥 Creating staff accounts...');
        
        ClinicStaff::create([
            'clinic_id' => $clinic->id,
            'name' => 'Dr. Juan Santos',
            'email' => 'doctor@happysmiles.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        ClinicStaff::create([
            'clinic_id' => $clinic->id,
            'name' => 'Maria Reyes',
            'email' => 'staff@happysmiles.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'permissions' => ['view_appointments', 'approve_bookings', 'manage_queue'],
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        ClinicStaff::create([
            'clinic_id' => $clinic->id,
            'name' => 'Dr. Ana Garcia',
            'email' => 'doctor2@happysmiles.com',
            'password' => Hash::make('password'),
            'role' => 'doctor',
            'permissions' => ['view_appointments', 'manage_patients', 'view_history'],
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        $this->command->info('✅ Staff accounts created');

        // Create services
        $this->command->info('🦷 Creating dental services...');
        
        $services = [
            [
                'service_name' => 'Teeth Cleaning',
                'category' => 'General Dentistry',
                'description' => 'Professional teeth cleaning and polishing to remove plaque and tartar',
                'duration_minutes' => 45,
                'price' => 600,
                'sort_order' => 1,
            ],
            [
                'service_name' => 'General Check-up',
                'category' => 'General Dentistry',
                'description' => 'Comprehensive dental examination and oral health assessment',
                'duration_minutes' => 30,
                'price' => 300,
                'sort_order' => 2,
            ],
            [
                'service_name' => 'Tooth Filling',
                'category' => 'Restorative Dentistry',
                'description' => 'Cavity filling and tooth restoration using composite materials',
                'duration_minutes' => 60,
                'price' => 800,
                'sort_order' => 3,
            ],
            [
                'service_name' => 'Tooth Extraction',
                'category' => 'Oral Surgery',
                'description' => 'Safe and painless tooth removal procedure',
                'duration_minutes' => 45,
                'price' => 500,
                'sort_order' => 4,
            ],
            [
                'service_name' => 'Teeth Whitening',
                'category' => 'Cosmetic Dentistry',
                'description' => 'Professional teeth whitening treatment for a brighter smile',
                'duration_minutes' => 90,
                'price' => 3000,
                'sort_order' => 5,
            ],
            [
                'service_name' => 'Root Canal',
                'category' => 'Endodontics',
                'description' => 'Root canal therapy to save infected or damaged teeth',
                'duration_minutes' => 120,
                'price' => 5000,
                'sort_order' => 6,
            ],
        ];

        foreach ($services as $service) {
            DentalService::create(array_merge($service, [
                'clinic_id' => $clinic->id,
                'is_active' => true,
            ]));
        }

        $this->command->info('✅ Dental services created');

        // Create calendar slots
        $this->command->info('📅 Creating calendar slots...');
        $this->createCalendarSlots($clinic->id);

        // Create FAQs
        $this->command->info('💡 Creating default FAQs...');
        $this->createFaqs($clinic->id);

        $this->command->newLine();
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->info('✅ Demo data created successfully!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        $this->command->newLine();
        $this->command->info('📧 Staff Logins:');
        $this->command->info('   Owner:  doctor@happysmiles.com / password');
        $this->command->info('   Staff:  staff@happysmiles.com / password');
        $this->command->info('   Doctor: doctor2@happysmiles.com / password');
        $this->command->newLine();
        $this->command->info('🏥 Clinic: Happy Smiles Dental Clinic');
        $this->command->info('📍 Subdomain: happysmiles');
        $this->command->newLine();
        $this->command->warn('⚠️  Don\'t forget to update FB Page credentials in the database!');
        $this->command->info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }

    private function createCalendarSlots(int $clinicId): void
    {
        $startDate = Carbon::today()->addDay();
        $endDate = Carbon::today()->addDays(30);
        $slotsCreated = 0;

        for ($date = $startDate->copy(); $date <= $endDate; $date->addDay()) {
            // Skip Sundays
            if ($date->isSunday()) {
                continue;
            }

            // Create slots from 9 AM to 6 PM (skip 12-1 PM lunch)
            $times = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
            
            // Saturday only until 3 PM
            if ($date->isSaturday()) {
                $times = ['09:00', '10:00', '11:00', '13:00', '14:00'];
            }

            foreach ($times as $time) {
                CalendarSlot::create([
                    'clinic_id' => $clinicId,
                    'slot_date' => $date->format('Y-m-d'),
                    'slot_time' => $time . ':00',
                    'status' => 'available',
                ]);
                $slotsCreated++;
            }
        }

        $this->command->info("✅ Created {$slotsCreated} calendar slots for next 30 days");
    }

    private function createFaqs(int $clinicId): void
    {
        $faqs = [
            [
                'category' => 'location',
                'question' => 'Where is the clinic located? / Paano pumunta?',
                'answer' => "📍 ADDRESS:\n123 Main Street, Makati City, Metro Manila\n\n📌 LANDMARK:\nNear Makati Sports Club and across from the City Bank building.\n\n🚗 PARKING:\nLimited parking space is available directly in front of the clinic. Covered parking is also available at the nearby Sports Club.",
                'keywords' => ['location', 'address', 'saan', 'landmark', 'parking', 'directions', 'lugar', 'mapa', 'map'],
            ],
            [
                'category' => 'hmo',
                'question' => 'Do you accept HMO / Health Cards?',
                'answer' => "🏥 HMO & INSURANCE:\nYes! We accept Maxicare, Medicard, and Intellicare for select dental procedures (like teeth cleaning and simple fillings).\n\n⚠️ IMPORTANT:\nPlease make sure to bring your physical HMO card and a valid ID. Approval is subject to the coverage limits of your specific plan.",
                'keywords' => ['hmo', 'maxicare', 'medicard', 'intellicare', 'healthcard', 'card', 'insurance', 'coverage', 'sagot'],
            ],
            [
                'category' => 'policy',
                'question' => 'Do I need an appointment or do you accept walk-ins?',
                'answer' => "🦷 CLINIC APPOINTMENTS:\nWe highly recommend booking an appointment beforehand so we can reserve a slot for you. Walk-ins are welcome, but wait times may vary depending on patient traffic and slot availability.\n\n📱 You can book an appointment directly through this bot by selecting '📅 Book Appointment' from the main menu!",
                'keywords' => ['walk-in', 'appointment', 'walkin', 'rules', 'patakaran', 'schedule', 'oras', 'late', 'reschedule'],
            ],
            [
                'category' => 'pricing',
                'question' => 'What are your rates / price list?',
                'answer' => "💰 PRICE LIST SUMMARY:\n- General Check-up: ₱300.00\n- Teeth Cleaning: ₱600.00\n- Tooth Filling (Pasta): ₱800.00\n- Tooth Extraction (Bunot): ₱500.00\n- Teeth Whitening: ₱3,000.00\n- Root Canal: ₱5,000.00\n\n💬 Reply with '📅 Book Appointment' if you'd like to schedule any of these treatments!",
                'keywords' => ['price', 'magkano', 'how much', 'singil', 'bayad', 'rates', 'pasta', 'cleaning', 'whitening', 'checkup', 'bunot'],
            ],
        ];

        foreach ($faqs as $faq) {
            \App\Models\ClinicFaq::create(array_merge($faq, [
                'clinic_id' => $clinicId,
                'is_active' => true,
            ]));
        }

        $this->command->info('✅ Seeded ' . count($faqs) . ' default FAQs');
    }
}
