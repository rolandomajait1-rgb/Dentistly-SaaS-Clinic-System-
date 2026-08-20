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

        $staff = ClinicStaff::where('email', $request->email)->first();

        if (!$staff || !Hash::check($request->password, $staff->password)) {
            return response()->json([
                'message' => 'Invalid email or password.'
            ], 401);
        }

        if (!$staff->email_verified_at) {
            return response()->json([
                'requires_verification' => true,
                'email' => $staff->email,
                'message' => 'Please verify your email address to activate your account. Check your inbox for the verification link.'
            ], 403);
        }

        if (!$staff->is_active) {
            return response()->json([
                'message' => 'Your account is deactivated. Please contact support.'
            ], 403);
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

            $verificationToken = Str::random(64);

            // Create owner staff account (unverified until email link is clicked)
            $staff = ClinicStaff::create([
                'clinic_id' => $clinic->id,
                'name' => $request->owner_name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'owner',
                'permissions' => ['all'],
                'is_active' => false,
                'email_verified_at' => null,
                'verification_token' => $verificationToken,
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

            // Send registration email verification link
            try {
                $mailService = resolve(\App\Services\MailService::class);
                $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
                $verifyUrl = rtrim($frontendUrl, '/') . '/verify-email?token=' . $verificationToken;
                $subject = "Verify your email - Pivodent Dental System";
                $body = "
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;'>
                        <h2 style='color: #004E47; margin-bottom: 8px;'>Welcome to Pivodent, {$request->owner_name}!</h2>
                        <p style='font-size: 15px; line-height: 1.5; color: #475569;'>Thank you for registering <strong>{$request->clinic_name}</strong>. Before you can access your clinic dashboard, please verify your email address by clicking the button below:</p>
                        <div style='text-align: center; margin: 32px 0;'>
                            <a href='{$verifyUrl}' style='background-color: #00B074; color: #ffffff; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;'>Verify Email & Activate Clinic</a>
                        </div>
                        <p style='font-size: 13px; color: #64748b; margin-top: 24px;'>If the button doesn't work, copy and paste this link into your browser:<br><a href='{$verifyUrl}' style='color: #00B074; word-break: break-all;'>{$verifyUrl}</a></p>
                        <p style='font-size: 12px; color: #94a3b8; margin-top: 20px;'>If you did not create this account, you can safely ignore this email.</p>
                    </div>
                ";
                $mailService->sendEmail($staff->email, $subject, $body, 'Pivodent');
            } catch (\Exception $e) {
                Log::error('Failed to send registration verification email: ' . $e->getMessage());
            }

            return response()->json([
                'requires_verification' => true,
                'email' => $staff->email,
                'message' => 'Registration initiated! Please check your email to verify your account.'
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
     * Verify email via token
     */
    public function verifyEmail(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
        ]);

        $staff = ClinicStaff::where('verification_token', $request->token)->first();

        if (!$staff) {
            return response()->json([
                'message' => 'Invalid or expired verification link.'
            ], 400);
        }

        $staff->update([
            'email_verified_at' => now(),
            'is_active' => true,
            'verification_token' => null,
        ]);

        $clinic = Clinic::with('fbPageIntegration')->find($staff->clinic_id);

        // Delete old tokens and generate new session token
        $staff->tokens()->delete();
        $token = $staff->createToken('dashboard-access')->plainTextToken;

        return response()->json([
            'verified' => true,
            'message' => 'Email verified successfully! Your clinic account is now active.',
            'user' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                'role' => $staff->role,
                'clinic_id' => $staff->clinic_id,
            ],
            'clinic' => $clinic,
            'token' => $token,
        ]);
    }

    /**
     * Resend verification email
     */
    public function resendVerification(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $staff = ClinicStaff::where('email', $request->email)->first();

        if (!$staff) {
            return response()->json([
                'message' => 'No account found with this email address.'
            ], 404);
        }

        if ($staff->email_verified_at) {
            return response()->json([
                'message' => 'This account has already been verified. You can log in directly.'
            ], 400);
        }

        $verificationToken = Str::random(64);
        $staff->update([
            'verification_token' => $verificationToken,
        ]);

        $clinic = Clinic::find($staff->clinic_id);
        $clinicName = $clinic ? $clinic->clinic_name : 'your clinic';

        try {
            $mailService = resolve(\App\Services\MailService::class);
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            $verifyUrl = rtrim($frontendUrl, '/') . '/verify-email?token=' . $verificationToken;
            $subject = "Verify your email - Pivodent Dental System";
            $body = "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b;'>
                    <h2 style='color: #004E47; margin-bottom: 8px;'>Verify your email address</h2>
                    <p style='font-size: 15px; line-height: 1.5; color: #475569;'>Here is your new verification link for <strong>{$clinicName}</strong>. Please click the button below to activate your account:</p>
                    <div style='text-align: center; margin: 32px 0;'>
                        <a href='{$verifyUrl}' style='background-color: #00B074; color: #ffffff; padding: 14px 32px; border-radius: 9999px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;'>Verify Email & Activate Clinic</a>
                    </div>
                    <p style='font-size: 13px; color: #64748b; margin-top: 24px;'>If the button doesn't work, copy and paste this link into your browser:<br><a href='{$verifyUrl}' style='color: #00B074; word-break: break-all;'>{$verifyUrl}</a></p>
                </div>
            ";
            $mailService->sendEmail($staff->email, $subject, $body, 'Pivodent');
        } catch (\Exception $e) {
            Log::error('Failed to resend verification email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'A fresh verification email has been sent. Please check your inbox.'
        ]);
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
