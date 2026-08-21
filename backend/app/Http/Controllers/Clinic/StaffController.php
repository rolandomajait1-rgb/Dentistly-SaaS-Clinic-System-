<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\ClinicStaff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class StaffController extends Controller
{
    /**
     * Get list of staff users for the clinic
     */
    public function getStaff(Request $request)
    {
        $clinicId = $request->user()->clinic_id ?? 1;

        $staff = ClinicStaff::where('clinic_id', $clinicId)
            ->orderBy('id', 'asc')
            ->get();

        // If no records in database yet, return the default mock list matching Figma
        if ($staff->isEmpty()) {
            return response()->json([
                'success' => true,
                'staff' => [
                    [
                        'id' => 1,
                        'name' => 'Admin_Name',
                        'email' => 'admin@pivodent.com',
                        'role' => 'Admin',
                        'role_display' => 'Admin',
                        'last_login' => 'Jul 19, 2026 10:30 AM',
                        'started' => 'Dec 12, 2022',
                        'is_active' => true,
                    ],
                    [
                        'id' => 2,
                        'name' => 'Dr. Park',
                        'email' => 'park@pivodent.com',
                        'role' => 'Dentist',
                        'role_display' => 'Dentist',
                        'last_login' => 'Jul 19, 2026 10:30 AM',
                        'started' => 'Jan 15, 2023',
                        'is_active' => true,
                    ],
                    [
                        'id' => 3,
                        'name' => 'Dr. Lee',
                        'email' => 'lee@pivodent.com',
                        'role' => 'Dentist',
                        'role_display' => 'Dentist',
                        'last_login' => 'Jul 19, 2026 10:30 AM',
                        'started' => 'Jan 10, 2023',
                        'is_active' => true,
                    ],
                    [
                        'id' => 4,
                        'name' => 'Miranda Bailey',
                        'email' => 'bailey@pivodent.com',
                        'role' => 'Dental Assistant',
                        'role_display' => 'Dental Assistant',
                        'last_login' => 'Jul 19, 2026 10:30 AM',
                        'started' => 'Jan 10, 2023',
                        'is_active' => true,
                    ],
                    [
                        'id' => 5,
                        'name' => 'Pia Carlos',
                        'email' => 'pia@pivodent.com',
                        'role' => 'Admin (restricted)',
                        'role_display' => 'Admin (restricted)',
                        'last_login' => 'Jul 19, 2026 10:30 AM',
                        'started' => 'Jan 10, 2023',
                        'is_active' => true,
                    ],
                ]
            ]);
        }

        $formatted = $staff->map(function ($s) {
            $roleDisplay = match (strtolower($s->role)) {
                'owner', 'admin' => 'Admin',
                'doctor', 'dentist' => 'Dentist',
                'assistant', 'dental assistant' => 'Dental Assistant',
                'restricted', 'admin (restricted)' => 'Admin (restricted)',
                default => ucfirst($s->role),
            };

            return [
                'id' => $s->id,
                'name' => $s->name,
                'email' => $s->email,
                'role' => $s->role,
                'role_display' => $roleDisplay,
                'last_login' => $s->updated_at ? $s->updated_at->format('M d, Y h:i A') : 'Jul 19, 2026 10:30 AM',
                'started' => $s->created_at ? $s->created_at->format('M d, Y') : 'Jan 10, 2023',
                'is_active' => (bool) $s->is_active,
            ];
        });

        return response()->json([
            'success' => true,
            'staff' => $formatted,
        ]);
    }

    /**
     * Create a new staff user for the clinic
     */
    public function createStaff(Request $request)
    {
        $clinicId = $request->user()->clinic_id ?? 1;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'role' => 'required|string',
            'password' => 'nullable|string|min:6',
        ]);

        // Map role to standard DB enum if needed
        $dbRole = match (strtolower($validated['role'])) {
            'dentist', 'doctor' => 'doctor',
            'admin', 'owner' => 'admin',
            default => 'staff',
        };

        // Check if email already exists
        $existing = ClinicStaff::where('email', $validated['email'])->first();
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'A staff member or user with this email address already exists.',
            ], 422);
        }

        $staff = ClinicStaff::create([
            'clinic_id' => $clinicId,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password'] ?? 'Pivodent123!'),
            'role' => $dbRole,
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Staff member created successfully.',
            'staff' => [
                'id' => $staff->id,
                'name' => $staff->name,
                'email' => $staff->email,
                'role' => $validated['role'],
                'role_display' => $validated['role'],
                'last_login' => now()->format('M d, Y h:i A'),
                'started' => now()->format('M d, Y'),
                'is_active' => true,
            ]
        ], 201);
    }

    /**
     * Delete a staff user
     */
    public function deleteStaff(Request $request, int $id)
    {
        $clinicId = $request->user()->clinic_id ?? 1;

        $staff = ClinicStaff::where('id', $id)->where('clinic_id', $clinicId)->first();
        if ($staff) {
            $staff->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Staff member removed successfully.',
        ]);
    }
}
