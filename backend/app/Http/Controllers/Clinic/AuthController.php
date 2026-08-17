<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\{Clinic, ClinicStaff, Tenant, SubscriptionPlan, Subscription, DentalService};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, DB, Log, Http};
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Authenticate staff member
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $staff = ClinicStaff::where('email', $request->email)
            ->where('is_active', true)
            ->first();

        if (!$staff || !Hash::check($request->password, $staff->password)) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 401);
        }

        $clinic = Clinic::with('fbPageIntegration')->find($staff->clinic_id);

        // Delete old tokens for this user
        $staff->tokens()->delete();

        // Create new Sanctum token
        $token = $staff->createToken('dashboard-access')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                'role' => $staff->role,
                'clinic_id' => $staff->clinic_id,
            ],
            'clinic' => $clinic,
            'token' => $token
        ]);
    }

    /**
     * Logout staff member
     */
    public function logout(Request $request)
    {
        if ($request->user() && $request->user()->currentAccessToken()) {
            $request->user()->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }

    /**
     * Register new clinic and owner account
     */
    public function register(Request $request)
    {
        $request->validate([
            'clinic_name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'email' => 'required|email|unique:clinic_staff,email',
            'password' => 'required|string|min:8|confirmed',
            'contact_number' => 'required|string|max:50',
            'address' => 'required|string|max:500',
        ]);

        try {
            DB::beginTransaction();

            // Create tenant first
            $tenant = Tenant::create([
                'tenant_name' => $request->clinic_name,
                'subdomain' => Str::slug($request->clinic_name) . '-' . Str::random(4),
                'status' => 'active',
            ]);

            // Create clinic linked to tenant
            $clinic = Clinic::create([
                'tenant_id' => $tenant->id,
                'clinic_name' => $request->clinic_name,
                'owner_name' => $request->owner_name,
                'email' => $request->email,
                'contact_number' => $request->contact_number,
                'address' => $request->address,
                'status' => 'trial',
                'notification_settings' => [
                    'email_enabled' => true,
                    'chatbot_enabled' => true,
                    'email_confirmation_enabled' => true,
                    'email_reminder_enabled' => true,
                    'email_post_visit_enabled' => true,
                    'email_subject_approved' => 'Confirmed: Your Appointment at {clinic_name}',
                    'email_body_approved' => '<p>Dear <strong>{patient_name}</strong>,</p><p>Great news! Your dental appointment for <strong>{service_name}</strong> on <strong>{date}</strong> at <strong>{time}</strong> has been approved and confirmed by our team.</p><p>Reference: <strong>{reference}</strong></p><p>See you soon!</p>',
                    'email_subject_cancelled' => 'Cancelled: Your Appointment at {clinic_name}',
                    'email_body_cancelled' => '<p>Dear <strong>{patient_name}</strong>,</p><p>Please be advised that your appointment (Ref: {reference}) has been cancelled.</p><p>{reason}</p>',
                ]
            ]);

            // Create subscription
            $freePlan = SubscriptionPlan::where('plan_code', 'FREE')->first() 
                ?? SubscriptionPlan::first();
                
            if ($freePlan) {
                Subscription::create([
                    'clinic_id' => $clinic->id,
                    'subscription_plan_id' => $freePlan->id,
                    'status' => 'trial',
                    'start_date' => now(),
                    'end_date' => now()->addMonth(),
                    'trial_ends_at' => now()->addDays(30),
                ]);
            }

            // Create owner staff account
            $staff = ClinicStaff::create([
                'clinic_id' => $clinic->id,
                'name' => $request->owner_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'owner',
                'permissions' => ['all'],
                'is_active' => true,
                'email_verified_at' => now(),
            ]);

            // Create default dental services
            $defaultServices = [
                ['service_name' => 'General Checkup', 'price' => 500, 'category' => 'General Dentistry'],
                ['service_name' => 'Teeth Cleaning', 'price' => 800, 'category' => 'Preventive'],
                ['service_name' => 'Tooth Extraction', 'price' => 1500, 'category' => 'Oral Surgery'],
                ['service_name' => 'Dental Filling', 'price' => 1200, 'category' => 'Restorative'],
            ];

            foreach ($defaultServices as $index => $service) {
                DentalService::create([
                    'clinic_id' => $clinic->id,
                    'service_name' => $service['service_name'],
                    'price' => $service['price'],
                    'duration_minutes' => 45,
                    'category' => $service['category'],
                    'is_active' => true,
                    'sort_order' => $index + 1,
                ]);
            }

            DB::commit();

            // Send registration confirmation notification email
            try {
                $mailService = resolve(\App\Services\MailService::class);
                $subject = "Welcome to Dentistly! Your account has been created";
                $body = "
                    <p>If you have any questions or need support getting started, feel free to contact us.</p>
                    <p>Best regards,<br>The Dentistly Team</p>
                ";
                $mailService->sendEmail($staff->email, $subject, $body, 'Dentistly');
            } catch (\Exception $e) {
                Log::error('Failed to send registration confirmation email: ' . $e->getMessage());
            }

            // Generate token
            $token = $staff->createToken('dashboard-access')->plainTextToken;

            return response()->json([
                'message' => 'Registration successful! Welcome to Dentistly.',
                'user' => [
                    'id' => $staff->id,
                    'name' => $staff->name,
                    'email' => $staff->email,
                    'role' => $staff->role,
                    'clinic_id' => $staff->clinic_id,
                ],
                'clinic' => $clinic->load('fbPageIntegration'),
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Registration failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Registration failed. Please try again.'
            ], 500);
        }
    }

    /**
     * Authenticate staff member via Google Sign-In
     */
    public function googleLogin(Request $request)
    {
        $request->validate([
            'credential' => 'required|string',
        ]);

        $idToken = $request->credential;

        // Verify token via Google API
        $response = Http::get("https://oauth2.googleapis.com/tokeninfo?id_token={$idToken}");

        if ($response->failed()) {
            return response()->json([
                'message' => 'Google authentication failed. Invalid token.'
            ], 400);
        }

        $payload = $response->json();

        $clientId = config('services.google.client_id');
        if ($clientId && isset($payload['aud']) && $payload['aud'] !== $clientId) {
            return response()->json([
                'message' => 'Google authentication failed. Client ID mismatch.'
            ], 400);
        }

        $email = $payload['email'] ?? null;
        if (!$email) {
            return response()->json([
                'message' => 'Unable to retrieve email address from Google profile.'
            ], 400);
        }

        $staff = ClinicStaff::where('email', $email)
            ->where('is_active', true)
            ->first();

        if (!$staff) {
            return response()->json([
                'message' => 'No registered staff account found for this Google email address (' . $email . '). Please contact your clinic administrator.'
            ], 401);
        }

        $clinic = Clinic::with('fbPageIntegration')->find($staff->clinic_id);

        $staff->tokens()->delete();
        $token = $staff->createToken('dashboard-access')->plainTextToken;

        return response()->json([
            'user' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                'role' => $staff->role,
                'clinic_id' => $staff->clinic_id,
            ],
            'clinic' => $clinic,
            'token' => $token
        ]);
    }
}
