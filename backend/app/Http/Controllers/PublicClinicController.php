<?php

namespace App\Http\Controllers;

use App\Models\{Clinic, Patient, Appointment, CalendarSlot, DentalService};
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use App\Services\AuditLogger;

class PublicClinicController extends Controller
{
    /**
     * Helper to find clinic by ID, subdomain, or slug.
     */
    protected function findClinic($clinicSlug)
    {
        $clinic = Clinic::where('id', $clinicSlug)
            ->orWhereHas('tenant', function ($q) use ($clinicSlug) {
                $q->where('subdomain', $clinicSlug);
            })
            ->first();

        if (!$clinic) {
            $clinic = Clinic::all()->first(function ($c) use ($clinicSlug) {
                return Str::slug($c->clinic_name) === $clinicSlug;
            });
        }

        if (!$clinic) {
            $clinic = Clinic::first();
        }

        return $clinic;
    }

    /**
     * Get active services of the clinic, grouped by category.
     */
    public function services($clinicSlug)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $services = $clinic->services()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $grouped = $services->groupBy(function ($item) {
            return $item->category ?: 'General Dentistry';
        });

        return response()->json($grouped);
    }

    /**
     * Helper to compute allowable booking date range based on clinic policies.
     */
    protected function getPolicyDateRange(Clinic $clinic): array
    {
        $notifSettings = $clinic->notification_settings ?? [];
        $allowSameDay = $notifSettings['allow_same_day_booking'] ?? true;
        $advanceLimitStr = strtolower(trim($notifSettings['advance_booking_limit'] ?? '1 year'));

        $startDate = $allowSameDay ? Carbon::today() : Carbon::tomorrow();

        $days = 365; // default 1 year (allows distant months like December)
        if (str_contains($advanceLimitStr, '1 week')) {
            $days = 7;
        } elseif (str_contains($advanceLimitStr, '2 week')) {
            $days = 14;
        } elseif (str_contains($advanceLimitStr, '3 week')) {
            $days = 21;
        } elseif (str_contains($advanceLimitStr, '4 week') || str_contains($advanceLimitStr, '1 month')) {
            $days = 30;
        } elseif (str_contains($advanceLimitStr, '8 week') || str_contains($advanceLimitStr, '2 month')) {
            $days = 60;
        } elseif (str_contains($advanceLimitStr, '12 week') || str_contains($advanceLimitStr, '3 month')) {
            $days = 90;
        } elseif (str_contains($advanceLimitStr, '6 month')) {
            $days = 180;
        } elseif (str_contains($advanceLimitStr, '1 year') || str_contains($advanceLimitStr, '12 month')) {
            $days = 365;
        } elseif (preg_match('/(\d+)\s*year/', $advanceLimitStr, $m)) {
            $days = (int)$m[1] * 365;
        } elseif (preg_match('/(\d+)\s*month/', $advanceLimitStr, $m)) {
            $days = (int)$m[1] * 30;
        } elseif (preg_match('/(\d+)\s*week/', $advanceLimitStr, $m)) {
            $days = (int)$m[1] * 7;
        } elseif (preg_match('/(\d+)\s*day/', $advanceLimitStr, $m)) {
            $days = (int)$m[1];
        }

        $endDate = Carbon::today()->addDays($days);

        return [$startDate, $endDate, $allowSameDay, $days];
    }

    /**
     * Parse and get schedule [open => H:i, close => H:i] for a specific date, or null if closed.
     */
    protected function getDaySchedule(Clinic $clinic, Carbon $date): ?array
    {
        $rawHours = $clinic->operating_hours;
        if (is_string($rawHours)) {
            $rawHours = json_decode($rawHours, true);
        }

        $dayName = strtolower($date->format('l'));

        if (!is_array($rawHours) || empty($rawHours)) {
            if ($date->isSunday()) {
                return null;
            }
            return [
                'open' => '08:00',
                'close' => $date->isSaturday() ? '15:00' : '17:00',
            ];
        }

        $dayConfig = null;
        foreach ($rawHours as $k => $v) {
            if (strtolower(trim($k)) === $dayName) {
                $dayConfig = $v;
                break;
            }
        }

        if ($dayConfig === null) {
            return $date->isSunday() ? null : ['open' => '08:00', 'close' => '17:00'];
        }

        if (is_array($dayConfig)) {
            if (empty($dayConfig['enabled'])) {
                return null;
            }
            $open = !empty($dayConfig['open']) ? Carbon::parse($dayConfig['open'])->format('H:i') : '08:00';
            $close = !empty($dayConfig['close']) ? Carbon::parse($dayConfig['close'])->format('H:i') : '17:00';
            return ['open' => $open, 'close' => $close];
        }

        if (is_string($dayConfig)) {
            $val = strtolower(trim($dayConfig));
            if ($val === 'closed' || empty($val)) {
                return null;
            }
            if (str_contains($val, '-')) {
                $parts = explode('-', $val);
                $open = Carbon::parse(trim($parts[0]))->format('H:i');
                $close = Carbon::parse(trim($parts[1]))->format('H:i');
                return ['open' => $open, 'close' => $close];
            }
            return ['open' => '08:00', 'close' => '17:00'];
        }

        return null;
    }

    /**
     * Check whether the clinic is open on the given day of the week according to its operating hours.
     */
    protected function isDayOpen(Clinic $clinic, Carbon $date): bool
    {
        return $this->getDaySchedule($clinic, $date) !== null;
    }

    /**
     * Dynamically ensure CalendarSlot entries exist and match real-time appointment status.
     */
    public function ensureSlotsForClinic(Clinic $clinic, Carbon $startDate, Carbon $endDate): void
    {
        $existingSlots = CalendarSlot::where('clinic_id', $clinic->id)
            ->whereDate('slot_date', '>=', $startDate)
            ->whereDate('slot_date', '<=', $endDate)
            ->get()
            ->keyBy(function ($slot) {
                $d = $slot->slot_date instanceof Carbon ? $slot->slot_date->toDateString() : Carbon::parse($slot->slot_date)->toDateString();
                $t = Carbon::parse($slot->slot_time)->format('H:i');
                return $d . '_' . $t;
            });

        $activeAppointments = Appointment::where('clinic_id', $clinic->id)
            ->whereDate('appointment_date', '>=', $startDate)
            ->whereDate('appointment_date', '<=', $endDate)
            ->whereNotIn('status', ['cancelled', 'rejected', 'no_show'])
            ->get()
            ->groupBy(function ($appt) {
                $d = Carbon::parse($appt->appointment_date)->toDateString();
                $t = Carbon::parse($appt->appointment_time)->format('H:i');
                return $d . '_' . $t;
            });

        $newSlotsToInsert = [];
        $now = now();

        for ($currDate = $startDate->copy(); $currDate <= $endDate; $currDate->addDay()) {
            $schedule = $this->getDaySchedule($clinic, $currDate);
            if (!$schedule) {
                continue;
            }

            $openTime = Carbon::parse($currDate->toDateString() . ' ' . $schedule['open']);
            $closeTime = Carbon::parse($currDate->toDateString() . ' ' . $schedule['close']);
            $dateStr = $currDate->toDateString();

            // 30-minute intervals from open time to 30 mins before close time
            for ($t = $openTime->copy(); $t->lt($closeTime); $t->addMinutes(30)) {
                $timeStr = $t->format('H:i');
                $key = $dateStr . '_' . $timeStr;

                // Skip 12:00 - 13:00 lunch break
                if ($timeStr === '12:00' || $timeStr === '12:30') {
                    continue;
                }

                $hasActiveAppt = $activeAppointments->has($key);
                $apptId = $hasActiveAppt ? $activeAppointments->get($key)->first()->id : null;

                if ($existingSlots->has($key)) {
                    $slot = $existingSlots->get($key);
                    // Synchronize slot status if appointment status changed
                    if ($hasActiveAppt && $slot->status === 'available') {
                        $slot->update([
                            'status' => 'booked',
                            'appointment_id' => $apptId,
                        ]);
                    } elseif (!$hasActiveAppt && $slot->status === 'booked' && empty($slot->blocked_by)) {
                        $slot->update([
                            'status' => 'available',
                            'appointment_id' => null,
                        ]);
                    }
                } else {
                    $newSlotsToInsert[] = [
                        'clinic_id' => $clinic->id,
                        'slot_date' => $dateStr,
                        'slot_time' => $timeStr . ':00',
                        'status' => $hasActiveAppt ? 'booked' : 'available',
                        'appointment_id' => $apptId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }
            }
        }

        if (!empty($newSlotsToInsert)) {
            foreach (array_chunk($newSlotsToInsert, 100) as $chunk) {
                CalendarSlot::insertOrIgnore($chunk);
            }
        }
    }

    /**
     * Get available calendar slots of the clinic based on its policy window and operating days.
     */
    public function slots($clinicSlug, Request $request)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        [$policyStartDate, $policyEndDate, $allowSameDay, $advanceDays] = $this->getPolicyDateRange($clinic);

        $startDate = $policyStartDate->copy();
        $endDate = $policyEndDate->copy();

        if ($request->filled('month')) {
            $monthVal = trim($request->query('month'));
            try {
                if (preg_match('/^\d{4}-\d{1,2}$/', $monthVal)) {
                    $monthCarbon = Carbon::createFromFormat('Y-m', $monthVal)->startOfMonth();
                } else {
                    $monthCarbon = Carbon::parse($monthVal)->startOfMonth();
                }
                $monthEnd = $monthCarbon->copy()->endOfMonth();
                $startDate = $monthCarbon->max($policyStartDate);
                $endDate = $monthEnd->min($policyEndDate);
            } catch (\Exception $e) {
                $startDate = $policyStartDate->copy();
                $endDate = $policyStartDate->copy()->addDays(90)->min($policyEndDate);
            }
        } elseif ($request->filled('date')) {
            try {
                $dateCarbon = Carbon::parse($request->query('date'))->startOfDay();
                $startDate = $dateCarbon->max($policyStartDate);
                $endDate = $dateCarbon->min($policyEndDate);
            } catch (\Exception $e) {
                $startDate = $policyStartDate->copy();
                $endDate = $policyStartDate->copy()->addDays(90)->min($policyEndDate);
            }
        } elseif ($request->filled('start_date') && $request->filled('end_date')) {
            try {
                $startDate = Carbon::parse($request->query('start_date'))->startOfDay()->max($policyStartDate);
                $endDate = Carbon::parse($request->query('end_date'))->startOfDay()->min($policyEndDate);
            } catch (\Exception $e) {
                $startDate = $policyStartDate->copy();
                $endDate = $policyStartDate->copy()->addDays(90)->min($policyEndDate);
            }
        } else {
            // Default initial load: next 90 days (covers current and next 2-3 months)
            $endDate = $policyStartDate->copy()->addDays(90)->min($policyEndDate);
        }

        if ($startDate->lte($endDate)) {
            // Dynamically ensure slots exist and match real-time appointment status
            $this->ensureSlotsForClinic($clinic, $startDate, $endDate);
        }

        $slots = CalendarSlot::where('clinic_id', $clinic->id)
            ->where('status', 'available')
            ->whereDate('slot_date', '>=', $startDate)
            ->whereDate('slot_date', '<=', $endDate)
            ->orderBy('slot_date')
            ->orderBy('slot_time')
            ->get();

        $grouped = [];
        foreach ($slots as $slot) {
            $dateObj = $slot->slot_date instanceof Carbon
                ? $slot->slot_date
                : Carbon::parse($slot->slot_date);

            // Respect clinic operating days
            if (!$this->isDayOpen($clinic, $dateObj)) {
                continue;
            }

            $dateStr = $dateObj->toDateString();

            if (!isset($grouped[$dateStr])) {
                $grouped[$dateStr] = [];
            }
            $grouped[$dateStr][] = Carbon::parse($slot->slot_time)->format('H:i');
        }

        return response()->json($grouped);
    }

    /**
     * Create a public booking.
     */
    public function bookings($clinicSlug, Request $request)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $validated = $request->validate([
            'service_id' => 'required|exists:dental_services,id',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|date_format:H:i',
            'name' => 'required|string|max:255',
            'contact' => 'required|string',
            'email' => 'nullable|email',
            'address' => 'required|string',
            'age' => 'required|integer|min:1|max:120',
            'medical_history' => 'nullable|string',
            'reason' => 'required|string',
            'birth_date' => 'nullable|string',
            'nationality' => 'nullable|string',
            'occupation' => 'nullable|string',
            'insurance' => 'nullable|string',
            'referral' => 'nullable|string',
            'dental_history' => 'nullable|string',
            'dentist_name' => 'nullable|string',
        ]);

        $formattedTime = Carbon::parse($validated['time'])->format('H:i:s');
        $requestedDate = Carbon::parse($validated['date'])->startOfDay();

        [$startDate, $endDate, $allowSameDay, $advanceDays] = $this->getPolicyDateRange($clinic);

        if (!$allowSameDay && $requestedDate->isToday()) {
            return response()->json([
                'error' => 'Clinic policy does not permit same-day bookings. Please select a date starting tomorrow.'
            ], 400);
        }

        if ($requestedDate->lt($startDate)) {
            return response()->json([
                'error' => 'The selected date is no longer open for appointment bookings.'
            ], 400);
        }

        if ($requestedDate->gt($endDate)) {
            return response()->json([
                'error' => "Clinic policy: Appointments can only be booked up to {$advanceDays} days in advance."
            ], 400);
        }

        if (!$this->isDayOpen($clinic, $requestedDate)) {
            return response()->json([
                'error' => 'The clinic is closed on ' . $requestedDate->format('l') . 's.'
            ], 400);
        }

        $dentistName = $request->input('dentist_name') ?: 'Dr. James Kim';
        $patientNotes = trim(
            ($request->filled('nationality') ? "Nationality: " . $request->input('nationality') . "\n" : '') .
            ($request->filled('occupation') ? "Occupation: " . $request->input('occupation') . "\n" : '') .
            ($request->filled('insurance') ? "Insurance: " . $request->input('insurance') . "\n" : '') .
            ($request->filled('referral') ? "Referral: " . $request->input('referral') . "\n" : '') .
            ($request->filled('dental_history') ? "Dental History: " . $request->input('dental_history') : '')
        );

        // Atomic booking with concurrency locking (lockForUpdate) and tier limits check
        try {
            $bookingResult = DB::transaction(function () use ($clinic, $validated, $formattedTime, $request, $patientNotes, $dentistName) {
                // Check SaaS subscription plan monthly appointment limit
                $plan = $clinic->subscription?->plan;
                if ($plan && $plan->max_appointments_per_month) {
                    $monthCount = Appointment::where('clinic_id', $clinic->id)
                        ->whereMonth('appointment_date', Carbon::parse($validated['date'])->month)
                        ->whereYear('appointment_date', Carbon::parse($validated['date'])->year)
                        ->count();
                    if ($monthCount >= $plan->max_appointments_per_month) {
                        return ['error' => 'PLAN_LIMIT_EXCEEDED'];
                    }
                }

                // 1. Direct active appointment check to prevent double booking
                $existingAppointment = Appointment::where('clinic_id', $clinic->id)
                    ->whereDate('appointment_date', $validated['date'])
                    ->where('appointment_time', $formattedTime)
                    ->whereNotIn('status', ['cancelled', 'rejected', 'no_show'])
                    ->lockForUpdate()
                    ->first();

                if ($existingAppointment) {
                    return ['error' => 'SLOT_UNAVAILABLE'];
                }

                // 2. Acquire exclusive row lock on the slot to eliminate race conditions
                $slot = CalendarSlot::where('clinic_id', $clinic->id)
                    ->whereDate('slot_date', $validated['date'])
                    ->where('slot_time', $formattedTime)
                    ->lockForUpdate()
                    ->first();

                if ($slot) {
                    if ($slot->status === 'booked') {
                        return ['error' => 'SLOT_UNAVAILABLE'];
                    }
                    if ($slot->status === 'blocked' || $slot->status === 'holiday') {
                        return ['error' => 'SLOT_BLOCKED'];
                    }
                } else {
                    // Check if clinic is open on this date/time
                    $dateObj = Carbon::parse($validated['date']);
                    if (!$this->isDayOpen($clinic, $dateObj)) {
                        return ['error' => 'CLINIC_CLOSED'];
                    }

                    // Dynamically create the slot
                    $slot = CalendarSlot::create([
                        'clinic_id' => $clinic->id,
                        'slot_date' => $validated['date'],
                        'slot_time' => $formattedTime,
                        'status' => 'available',
                    ]);
                }

                // Find or create patient record locally
                $patient = Patient::where('clinic_id', $clinic->id)
                    ->where('contact_number', $validated['contact'])
                    ->first();

                $senderId = $request->input('sender_id') ?: $request->input('psid');

                if (!$patient) {
                    $patient = Patient::create([
                        'clinic_id' => $clinic->id,
                        'fb_messenger_id' => $senderId ?: null,
                        'full_name' => $validated['name'],
                        'email' => $validated['email'] ?? null,
                        'contact_number' => $validated['contact'],
                        'address' => $validated['address'],
                        'age' => $validated['age'],
                        'birth_date' => $request->input('birth_date') ? Carbon::parse($request->input('birth_date')) : null,
                        'medical_history' => !empty($validated['medical_history']) ? $validated['medical_history'] : 'None',
                        'notes' => $patientNotes,
                    ]);
                } else {
                    $updateData = ['notes' => $patientNotes];
                    if ($senderId) {
                        $updateData['fb_messenger_id'] = $senderId;
                    }
                    if (isset($validated['email'])) {
                        $updateData['email'] = $validated['email'];
                    }
                    if ($request->input('birth_date')) {
                        $updateData['birth_date'] = Carbon::parse($request->input('birth_date'));
                    }
                    $patient->update($updateData);
                }

                $dentistName = $request->input('dentist_name') ?: 'Dr. James Kim';

                // Create the pending appointment
                $appointment = Appointment::create([
                    'clinic_id' => $clinic->id,
                    'patient_id' => $patient->id,
                    'dental_service_id' => $validated['service_id'],
                    'appointment_date' => $validated['date'],
                    'appointment_time' => $formattedTime,
                    'status' => 'pending',
                    'queue_number' => null,
                    'reason_for_visit' => $validated['reason'],
                    'staff_notes' => 'Dentist: ' . $dentistName,
                ]);

                // Update calendar slot
                $slot->update([
                    'status' => 'booked',
                    'appointment_id' => $appointment->id,
                ]);

                // Audit log creation of patient and appointment
                AuditLogger::log(
                    $clinic->id,
                    'public_booking_created',
                    'Appointment',
                    $appointment->id,
                    ['patient_name' => $patient->full_name, 'slot_time' => $formattedTime]
                );

                return [
                    'slot' => $slot,
                    'patient' => $patient,
                    'appointment' => $appointment,
                ];
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Public booking transaction error: ' . $e->getMessage());
            return response()->json([
                'error' => 'An error occurred while confirming your booking. Please try again.'
            ], 500);
        }

        if (isset($bookingResult['error'])) {
            if ($bookingResult['error'] === 'PLAN_LIMIT_EXCEEDED') {
                return response()->json([
                    'error' => 'Clinic has reached its maximum appointment booking limit for the month.'
                ], 429);
            }
            if ($bookingResult['error'] === 'CLINIC_CLOSED') {
                return response()->json([
                    'error' => 'The clinic is closed on the selected date. Please choose another date.'
                ], 400);
            }
            if ($bookingResult['error'] === 'SLOT_BLOCKED') {
                return response()->json([
                    'error' => 'The selected time slot is currently unavailable. Please choose another time or date.'
                ], 400);
            }
            return response()->json([
                'error' => 'Double-booking error: This slot was just taken. Please choose another slot.'
            ], 400);
        }

        $patient = $bookingResult['patient'];
        $appointment = $bookingResult['appointment'];

        // Dispatch automated workflow (SMS, Email, Messenger receipt)
        try {
            $workflowService = resolve(\App\Services\WorkflowAutomationService::class);
            $workflowService->triggerWorkflow($clinic, $patient, $appointment, 'booking_created');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Public booking workflow dispatch error: ' . $e->getMessage());
        }

        $service = DentalService::find($validated['service_id']);
        $serviceName = $service ? $service->service_name : 'Routine Checkup';
        $formattedDateTime = Carbon::parse($validated['date'] . ' ' . $validated['time'])->format('F j, Y \a\t g:i A');

        $integration = $clinic->fbPageIntegration()->where('is_active', true)->latest()->first() ?? $clinic->fbPageIntegration;
        $fbPageId = $integration?->fb_page_id;

        return response()->json([
            'success' => true,
            'reference_number' => $appointment->reference_number,
            'appointment_id' => $appointment->id,
            'patient_name' => $patient->full_name,
            'dentist_name' => $dentistName,
            'service_name' => $serviceName,
            'date_time' => $formattedDateTime,
            'fb_page_id' => $fbPageId,
            'fb_messenger_id' => $patient->fb_messenger_id,
        ]);
    }

    /**
     * Get public clinic information, hours, and FAQs.
     */
    public function info($clinicSlug)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $faqs = \App\Models\ClinicFaq::where('clinic_id', $clinic->id)
            ->where('is_active', true)
            ->get();

        $dentists = [
            [
                'id' => 'dr-hana-park',
                'name' => 'Dr. Hana Park',
                'initials' => 'HP',
                'specialty' => 'General & Cosmetic Dentistry',
                'rating' => 4.9,
                'reviews_count' => 128,
                'is_available' => true,
            ],
            [
                'id' => 'dr-james-kim',
                'name' => 'Dr. James Kim',
                'initials' => 'JK',
                'specialty' => 'Orthodontics & Implants',
                'rating' => 4.8,
                'reviews_count' => 97,
                'is_available' => true,
            ],
            [
                'id' => 'dr-sofia-reyes',
                'name' => 'Dr. Sofia Reyes',
                'initials' => 'SR',
                'specialty' => 'Pediatric Dentistry',
                'rating' => 5.0,
                'reviews_count' => 64,
                'is_available' => false,
            ],
        ];

        // Security: Expose ONLY public booking policies, never expose private SMTP or webhook credentials
        $rawSettings = $clinic->notification_settings ?? [];
        $publicPolicies = array_intersect_key($rawSettings, array_flip([
            'allow_same_day_booking',
            'advance_booking_limit',
            'cancellation_lock_window_hours',
            'booking_policy_notice',
            'chatbot_welcome_template',
        ]));

        $activeIntegration = $clinic->fbPageIntegration()->where('is_active', true)->latest()->first() ?? $clinic->fbPageIntegration;
        $fbPageId = $activeIntegration?->fb_page_id;

        return response()->json([
            'id' => $clinic->id,
            'clinic_name' => $clinic->clinic_name,
            'owner_name' => $clinic->owner_name,
            'email' => $clinic->email,
            'contact_number' => $clinic->contact_number,
            'address' => $clinic->address,
            'logo_url' => $clinic->logo_url,
            'branding_settings' => $clinic->branding_settings,
            'slug' => $clinic->slug,
            'public_booking_url' => $clinic->getPublicBookingUrl(),
            'fb_page_id' => $fbPageId,
            'timezone' => $clinic->timezone,
            'operating_hours' => $clinic->operating_hours,
            'notification_settings' => $publicPolicies,
            'faqs' => $faqs,
            'dentists' => $dentists,
        ]);
    }

    /**
     * Look up appointment status and queue position by reference number or patient contact.
     */
    public function lookupAppointment($clinicSlug, Request $request)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $query = $request->query('query') ?? $request->query('reference');

        if (empty($query)) {
            return response()->json(['error' => 'Reference number or contact number is required'], 400);
        }

        $cleanQuery = trim($query);
        $lowerQuery = strtolower($cleanQuery);

        $mockPatients = [
            'p-001' => [
                'id' => 'P-001',
                'full_name' => 'Evelyn Hughes',
                'dob' => '1996-07-21',
                'age' => 30,
                'nationality' => 'Filipino',
                'occupation' => 'UI/UX Designer',
                'address' => '123 Dental Avenue, Makati City',
                'contact' => '0917-555-0101',
                'email' => 'evelyn.hughes@example.com',
                'insurance' => 'Maxicare',
                'referral' => 'Friend recommendation',
                'reason' => 'Routine dental cleaning and checkup',
            ],
            'p-002' => [
                'id' => 'P-002',
                'full_name' => 'Maria Santos',
                'dob' => '1992-03-15',
                'age' => 34,
                'nationality' => 'Filipino',
                'occupation' => 'Accountant',
                'address' => '456 Ayala Avenue, Makati City',
                'contact' => '0918-555-0202',
                'email' => 'maria.santos@example.com',
                'insurance' => 'Intellicare',
                'referral' => 'Facebook page',
                'reason' => 'Tooth sensitivity on upper right molar',
            ],
            'p-003' => [
                'id' => 'P-003',
                'full_name' => 'Juan Dela Cruz',
                'dob' => '1988-11-04',
                'age' => 38,
                'nationality' => 'Filipino',
                'occupation' => 'Architect',
                'address' => '789 Buendia Avenue, Pasig City',
                'contact' => '0919-555-0303',
                'email' => 'juan.delacruz@example.com',
                'insurance' => 'PhilHealth',
                'referral' => 'Google search',
                'reason' => 'Consultation for orthodontic braces',
            ],
            'p-004' => [
                'id' => 'P-004',
                'full_name' => 'Sofia Reyes',
                'dob' => '2000-09-12',
                'age' => 26,
                'nationality' => 'Filipino',
                'occupation' => 'Marketing Specialist',
                'address' => '101 BGC, Taguig City',
                'contact' => '0920-555-0404',
                'email' => 'sofia.reyes@example.com',
                'insurance' => 'None',
                'referral' => 'Walk-in referral',
                'reason' => 'Comprehensive checkup and teeth whitening',
            ],
        ];

        if (isset($mockPatients[$lowerQuery])) {
            return response()->json([
                'patient_found' => true,
                'patient' => $mockPatients[$lowerQuery],
                'appointments' => [],
            ]);
        }

        $appointments = Appointment::where('clinic_id', $clinic->id)
            ->where(function ($q) use ($cleanQuery) {
                $q->where('reference_number', $cleanQuery)
                  ->orWhereHas('patient', function ($pq) use ($cleanQuery) {
                      $pq->where('contact_number', $cleanQuery)
                        ->orWhere('email', $cleanQuery);
                  });
            })
            ->with(['patient', 'service'])
            ->orderBy('appointment_date', 'desc')
            ->get();

        $results = $appointments->map(function ($appt) use ($clinic) {
            // Count serving/pending ahead of this appointment today
            $aheadCount = 0;
            if (in_array(strtolower($appt->status), ['pending', 'approved', 'confirmed'])) {
                $aheadCount = Appointment::where('clinic_id', $clinic->id)
                    ->whereDate('appointment_date', $appt->appointment_date)
                    ->whereIn('status', ['pending', 'approved', 'confirmed', 'Serving', 'in_progress'])
                    ->where('queue_number', '<', $appt->queue_number)
                    ->count();
            }

            return [
                'id' => $appt->id,
                'reference_number' => $appt->reference_number,
                'status' => $appt->status,
                'appointment_date' => $appt->appointment_date,
                'appointment_time' => $appt->appointment_time,
                'queue_number' => $appt->queue_number,
                'patients_ahead' => $aheadCount,
                'reason_for_visit' => $appt->reason_for_visit,
                'cancellation_reason' => $appt->cancellation_reason,
                'patient' => [
                    'full_name' => $appt->patient->full_name ?? 'N/A',
                    'contact_number' => $appt->patient->contact_number ?? 'N/A',
                    'email' => $appt->patient->email ?? null,
                ],
                'service' => [
                    'service_name' => $appt->service->service_name ?? 'Dental Service',
                    'price' => $appt->service->price ?? 0,
                    'duration_minutes' => $appt->service->duration_minutes ?? 45,
                ],
            ];
        });

        return response()->json($results);
    }

    /**
     * Cancel appointment by patient via reference number & contact verification.
     */
    public function cancelBooking($clinicSlug, Request $request)
    {
        $clinic = $this->findClinic($clinicSlug);

        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $validated = $request->validate([
            'reference_number' => 'required|string',
            'contact_number' => 'required|string',
            'reason' => 'nullable|string',
        ]);

        $appointment = Appointment::where('clinic_id', $clinic->id)
            ->where('reference_number', trim($validated['reference_number']))
            ->whereHas('patient', function ($q) use ($validated) {
                $q->where('contact_number', trim($validated['contact_number']));
            })
            ->first();

        if (!$appointment) {
            return response()->json([
                'error' => 'Appointment not found. Please double-check your Reference Number and Contact Number.'
            ], 404);
        }

        if (in_array(strtolower($appointment->status), ['completed', 'cancelled'])) {
            return response()->json([
                'error' => "Cannot cancel appointment because it is already {$appointment->status}."
            ], 400);
        }

        $notifSettings = $clinic->notification_settings ?? [];
        $lockHours = (int)($notifSettings['cancellation_lock_window_hours'] ?? 1);

        $apptDateStr = $appointment->appointment_date instanceof Carbon
            ? $appointment->appointment_date->toDateString()
            : substr((string)$appointment->appointment_date, 0, 10);
        $appointmentDateTime = Carbon::parse($apptDateStr . ' ' . $appointment->appointment_time);
        if ($appointmentDateTime->isPast()) {
            return response()->json([
                'error' => 'Past appointments cannot be cancelled.'
            ], 400);
        }

        if (now()->diffInHours($appointmentDateTime, false) < $lockHours) {
            return response()->json([
                'error' => "Cancellation policy: Appointments cannot be cancelled within {$lockHours} hour(s) of the scheduled time. Please contact the clinic directly."
            ], 400);
        }

        $appointment->status = 'Cancelled';
        $appointment->cancellation_reason = $validated['reason'] ?? 'Cancelled by Patient via Portal';
        $appointment->save();

        // Release the calendar slot
        CalendarSlot::where('clinic_id', $clinic->id)
            ->where('appointment_id', $appointment->id)
            ->update([
                'status' => 'available',
                'appointment_id' => null,
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Appointment cancelled successfully.',
            'reference_number' => $appointment->reference_number,
        ]);
    }

    /**
     * Politely end the Messenger conversation for a patient from the public booking portal.
     */
    public function endConversation($clinicSlug, Request $request)
    {
        $clinic = $this->findClinic($clinicSlug);
        if (!$clinic) {
            return response()->json(['error' => 'Clinic not found'], 404);
        }

        $senderId = $request->input('sender_id') ?: $request->input('psid');
        if ($senderId) {
            $integration = $clinic->fbPageIntegration()->where('is_active', true)->latest()->first() ?? $clinic->fbPageIntegration;

            if ($integration && !empty($integration->page_access_token)) {
                try {
                    $chatbotService = resolve(\App\Services\ChatbotService::class);
                    $chatbotService->handlePostback($clinic, $senderId, 'END_CONVERSATION', $integration);
                } catch (\Exception $e) {
                    \Illuminate\Support\Facades\Log::warning('Error ending Messenger conversation from portal: ' . $e->getMessage());
                }
            }
        }

        return response()->json(['success' => true]);
    }
}

