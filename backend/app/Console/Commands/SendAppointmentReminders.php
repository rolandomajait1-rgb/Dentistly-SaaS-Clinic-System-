<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\{Appointment, Notification};
use App\Services\WorkflowAutomationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SendAppointmentReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:send-appointment-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send Email and Messenger reminders for appointments (24h before & upcoming same-day).';

    /**
     * Execute the console command.
     */
    public function handle(WorkflowAutomationService $workflowService)
    {
        $today = Carbon::today()->toDateString();
        $tomorrow = Carbon::tomorrow()->toDateString();
        $now = Carbon::now();

        // 1. Scan for Tomorrow's appointments (24h reminder)
        $this->info("Scanning appointments for tomorrow: {$tomorrow}");
        $tomorrowAppointments = Appointment::withoutGlobalScopes()
            ->whereDate('appointment_date', $tomorrow)
            ->whereIn('status', ['confirmed', 'Approved'])
            ->with(['patient', 'clinic', 'clinic.fbPageIntegration', 'service'])
            ->get();

        $this->info("Found {$tomorrowAppointments->count()} confirmed appointments for tomorrow.");

        foreach ($tomorrowAppointments as $appointment) {
            $patient = $appointment->patient;
            $clinic = $appointment->clinic;

            if (!$patient || !$clinic) {
                continue;
            }

            // Prevent duplicate 24h reminder
            $alreadyReminded = Notification::where('appointment_id', $appointment->id)
                ->where('notification_type', 'reminder_24h')
                ->whereIn('status', ['sent', 'pending'])
                ->exists();

            if ($alreadyReminded) {
                continue;
            }

            try {
                $workflowService->triggerWorkflow($clinic, $patient, $appointment, 'appointment_reminder');
                $this->info("24h reminder workflow dispatched for patient ID: {$patient->id}");
            } catch (\Exception $e) {
                Log::error('Failed to dispatch 24h reminder workflow: ' . $e->getMessage());
            }
        }

        // 2. Scan for Today's upcoming appointments ("Malapit na" / within 2-3 hours)
        $this->info("Scanning upcoming appointments for today: {$today}");
        $todayAppointments = Appointment::withoutGlobalScopes()
            ->whereDate('appointment_date', $today)
            ->whereIn('status', ['confirmed', 'Approved'])
            ->with(['patient', 'clinic', 'clinic.fbPageIntegration', 'service'])
            ->get();

        foreach ($todayAppointments as $appointment) {
            $patient = $appointment->patient;
            $clinic = $appointment->clinic;

            if (!$patient || !$clinic || empty($appointment->appointment_time)) {
                continue;
            }

            // Calculate time difference
            try {
                $appointmentDateTime = Carbon::parse($today . ' ' . $appointment->appointment_time);
                $minutesUntilAppointment = $now->diffInMinutes($appointmentDateTime, false);

                // Trigger if appointment is between 15 minutes and 180 minutes (3 hours) away
                if ($minutesUntilAppointment >= 15 && $minutesUntilAppointment <= 180) {
                    $alreadyRemindedToday = Notification::where('appointment_id', $appointment->id)
                        ->whereIn('notification_type', ['reminder_3h', 'reminder_1h'])
                        ->whereIn('status', ['sent', 'pending'])
                        ->exists();

                    if ($alreadyRemindedToday) {
                        continue;
                    }

                    $workflowService->triggerWorkflow($clinic, $patient, $appointment, 'appointment_reminder_today', [
                        'minutes_left' => $minutesUntilAppointment
                    ]);
                    $this->info("Same-day upcoming reminder dispatched for patient ID: {$patient->id}");
                }
            } catch (\Exception $e) {
                Log::error('Failed to parse appointment time or dispatch same-day reminder: ' . $e->getMessage());
            }
        }

        $this->info("Completed sending reminders.");
    }
}

