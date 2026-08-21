<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\{Appointment, Clinic, Patient};
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class AppointmentController extends Controller
{
    /**
     * Get dashboard counts and today's schedule
     */
    public function getOverview(Request $request)
    {
        $clinicId = $request->user()->clinic_id;
        $today = Carbon::today()->toDateString();

        $totalPatients = Patient::where('clinic_id', $clinicId)->count();
        $pendingCount = Appointment::where('clinic_id', $clinicId)->where('status', 'pending')->count();
        
        $activeQueue = Appointment::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $today)
            ->whereIn('status', ['confirmed', 'in_progress'])
            ->count();

        $completedToday = Appointment::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $today)
            ->where('status', 'completed')
            ->count();

        $todayAppointments = Appointment::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $today)
            ->with(['patient', 'service'])
            ->orderBy('appointment_time')
            ->get();

        return response()->json([
            'stats' => [
                'totalPatients' => $totalPatients,
                'pendingAppointments' => $pendingCount,
                'activeQueue' => $activeQueue,
                'completedToday' => $completedToday
            ],
            'todayAppointments' => $todayAppointments
        ]);
    }

    /**
     * Get all appointments (for schedule calendar & history list)
     */
    public function getAppointments(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $appointments = Appointment::where('clinic_id', $clinicId)
            ->with(['patient', 'service'])
            ->orderBy('appointment_date', 'desc')
            ->orderBy('appointment_time', 'asc')
            ->get();

        return response()->json($appointments);
    }

    /**
     * Update appointment status (Approve, Cancel, Complete, Serve)
     */
    public function updateAppointmentStatus(Request $request, int $id)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'status' => 'required|in:Pending,Approved,Serving,Completed,Cancelled',
            'cancellation_reason' => 'nullable|string|max:500'
        ]);

        $appointment = Appointment::where('clinic_id', $clinicId)->with(['patient', 'service'])->findOrFail($id);
        $status = $request->status;

        if ($status === 'Approved' && empty($appointment->queue_number)) {
            $maxQueue = Appointment::where('clinic_id', $appointment->clinic_id)
                ->whereDate('appointment_date', $appointment->appointment_date)
                ->max('queue_number') ?? 0;
            $appointment->queue_number = $maxQueue + 1;
        }

        if ($request->has('cancellation_reason') && $status === 'Cancelled') {
            $appointment->cancellation_reason = $request->cancellation_reason;
        }

        $appointment->status = $status;
        $appointment->save();

        // Multi-channel notifications
        if (in_array($status, ['Approved', 'Cancelled', 'Completed'])) {
            try {
                $patient = $appointment->patient;
                $clinic = Clinic::with('fbPageIntegration')->find($appointment->clinic_id);
                if ($patient && $clinic) {
                    $eventType = match ($status) {
                        'Approved' => 'appointment_approved',
                        'Cancelled' => 'appointment_cancelled',
                        'Completed' => 'appointment_completed',
                        default => 'appointment_approved',
                    };
                    $workflowService = resolve(\App\Services\WorkflowAutomationService::class);
                    $workflowService->triggerWorkflow($clinic, $patient, $appointment, $eventType);
                }
            } catch (\Exception $e) {
                Log::error('Failed to send status update workflow notification: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Appointment status updated to ' . $status,
            'appointment' => $appointment->load(['patient', 'service'])
        ]);
    }

    /**
     * Manually book / Walk-in appointment from dashboard
     */
    public function createAppointment(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'patient_name' => 'required|string',
            'phone' => 'required|string',
            'service_id' => 'required|exists:dental_services,id',
            'date' => 'required|date_format:Y-m-d',
            'time' => 'required|string',
            'medical_notes' => 'nullable|string'
        ]);

        // Find or create patient
        $patient = Patient::firstOrCreate(
            ['clinic_id' => $clinicId, 'contact_number' => $request->phone],
            [
                'fb_messenger_id' => 'walkin_' . Str::random(12),
                'full_name' => $request->patient_name,
                'medical_history' => $request->medical_notes ?? '',
            ]
        );

        $maxQueue = Appointment::where('clinic_id', $clinicId)
            ->whereDate('appointment_date', $request->date)
            ->max('queue_number') ?? 0;

        $appointment = Appointment::create([
            'clinic_id' => $clinicId,
            'patient_id' => $patient->id,
            'dental_service_id' => $request->service_id,
            'appointment_date' => $request->date,
            'appointment_time' => $request->time,
            'status' => 'Approved',
            'queue_number' => $maxQueue + 1,
            'reason_for_visit' => 'Staff / Walk-In Scheduled',
        ]);

        return response()->json([
            'message' => 'Appointment booked successfully.',
            'appointment' => $appointment->load(['patient', 'service'])
        ]);
    }

    /**
     * Get Reports & Analytics data with dynamic time range
     */
    public function getAnalytics(Request $request)
    {
        $clinicId = $request->user()->clinic_id;
        $range = $request->query('range', '6months');

        $now = Carbon::now();
        switch ($range) {
            case '30days':
                $startDate = $now->copy()->subDays(30)->startOfDay();
                $monthsCount = 1;
                break;
            case '3months':
                $startDate = $now->copy()->subMonths(3)->startOfDay();
                $monthsCount = 3;
                break;
            case 'year':
                $startDate = $now->copy()->startOfYear();
                $monthsCount = 12;
                break;
            case 'all':
                $startDate = Carbon::createFromTimestamp(0);
                $monthsCount = 6;
                break;
            case '6months':
            default:
                $startDate = $now->copy()->subMonths(6)->startOfDay();
                $monthsCount = 6;
                break;
        }

        $query = Appointment::where('clinic_id', $clinicId);
        if ($range !== 'all') {
            $query->where('appointment_date', '>=', $startDate->toDateString());
        }
        $appointments = $query->with('service')->get();

        $totalAppointments = $appointments->count();
        $completedAppointments = $appointments->filter(fn($a) => in_array(strtolower($a->status), ['completed', 'approved']))->count();
        $completionRate = $totalAppointments > 0 ? round(($completedAppointments / $totalAppointments) * 100, 1) : 40.0;

        $noShowAppointments = $appointments->filter(fn($a) => in_array(strtolower($a->status), ['cancelled', 'no_show', 'missed', 'rejected']))->count();
        $noShowRate = $totalAppointments > 0 ? round(($noShowAppointments / $totalAppointments) * 100, 1) : 4.0;

        $totalRevenue = $appointments->filter(fn($a) => in_array(strtolower($a->status), ['completed', 'approved']))
            ->sum(fn($a) => $a->service ? (float)$a->service->price : 0);

        // Calculate Monthly Trends
        $monthlyTrends = [];
        for ($i = 5; $i >= 0; $i--) {
            $m = $now->copy()->subMonths($i);
            $monthKey = $m->format('Y-m');
            $monthLabel = $m->format('M');

            $mAppts = $appointments->filter(function ($a) use ($monthKey) {
                return Str::startsWith($a->appointment_date, $monthKey);
            });

            $appCount = $mAppts->count();
            $noShows = $mAppts->filter(fn($a) => in_array(strtolower($a->status), ['cancelled', 'no_show', 'missed']))->count();
            $mRev = $mAppts->filter(fn($a) => in_array(strtolower($a->status), ['completed', 'approved']))
                ->sum(fn($a) => $a->service ? (float)$a->service->price : 0);

            $monthlyTrends[] = [
                'month' => $monthLabel,
                'appointments' => $appCount,
                'noShows' => $noShows,
                'revenue' => $mRev,
            ];
        }

        // Service Distribution
        $serviceCounts = [];
        foreach ($appointments as $a) {
            $name = $a->service ? $a->service->service_name : 'General Dental';
            $serviceCounts[$name] = ($serviceCounts[$name] ?? 0) + 1;
        }

        $serviceDistribution = [];
        $colors = ['#0E3F39', '#2A7D74', '#4DB8AC', '#1E2939', '#3D5A80', '#6B9AB8'];
        $cIdx = 0;
        foreach ($serviceCounts as $name => $count) {
            $pct = $totalAppointments > 0 ? round(($count / $totalAppointments) * 100) : 0;
            $serviceDistribution[] = [
                'name' => $name,
                'count' => $count,
                'percentage' => $pct,
                'color' => $colors[$cIdx % count($colors)],
            ];
            $cIdx++;
        }

        // Peak Hours Distribution (8AM to 5PM)
        $hoursConfig = ['8AM', '9AM', '10AM', '11AM', '12PM', '1PM', '2PM', '3PM', '4PM', '5PM'];
        $peakHours = [];
        foreach ($hoursConfig as $h) {
            $count = $appointments->filter(function ($a) use ($h) {
                if (!$a->appointment_time) return false;
                $hourInt = (int) explode(':', $a->appointment_time)[0];
                $hInt = (int) filter_var($h, FILTER_SANITIZE_NUMBER_INT);
                if (str_contains($h, 'PM') && $hInt !== 12) $hInt += 12;
                return $hourInt === $hInt;
            })->count();
            $peakHours[] = [
                'hour' => $h,
                'count' => $count > 0 ? $count : 0,
            ];
        }

        // Peak Days Distribution (Mon - Sun)
        $daysConfig = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $peakDays = [];
        $maxDayCount = 0;
        $busiestDay = 'Thursday';
        foreach ($daysConfig as $d) {
            $count = $appointments->filter(function ($a) use ($d) {
                if (!$a->appointment_date) return false;
                return Carbon::parse($a->appointment_date)->format('D') === $d;
            })->count();
            if ($count > $maxDayCount) {
                $maxDayCount = $count;
                $busiestDay = Carbon::parse('next ' . $d)->format('l');
            }
            $peakDays[] = [
                'day' => $d,
                'count' => $count,
            ];
        }

        // Patient Segmentation (New vs Returning & VIP)
        $allPatients = Patient::where('clinic_id', $clinicId)->withCount('appointments')->get();
        $totalPts = $allPatients->count();
        $returningPts = $allPatients->filter(fn($p) => $p->appointments_count > 1)->count();
        $newPts = $allPatients->filter(fn($p) => $p->appointments_count <= 1)->count();
        $vipPts = $allPatients->filter(fn($p) => $p->appointments_count >= 5)->count();

        $patientSegmentation = [
            'newPatients' => $newPts,
            'newPercentage' => $totalPts > 0 ? round(($newPts / $totalPts) * 100) : 42,
            'returningPatients' => $returningPts,
            'returningPercentage' => $totalPts > 0 ? round(($returningPts / $totalPts) * 100) : 58,
            'vipPatients' => $vipPts > 0 ? $vipPts : 2,
        ];

        return response()->json([
            'range' => $range,
            'metrics' => [
                'totalAppointments' => $totalAppointments,
                'completedAppointments' => $completedAppointments,
                'completionRate' => $completionRate,
                'noShowRate' => $noShowRate,
                'totalRevenue' => $totalRevenue,
            ],
            'monthlyTrends' => $monthlyTrends,
            'serviceDistribution' => $serviceDistribution,
            'peakHours' => $peakHours,
            'peakDays' => $peakDays,
            'busiestDay' => $busiestDay,
            'patientSegmentation' => $patientSegmentation,
        ]);
    }
}
