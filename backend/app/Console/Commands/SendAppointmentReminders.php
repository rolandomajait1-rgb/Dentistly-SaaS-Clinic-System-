<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Appointment;
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
    protected $description = 'Send Email and Messenger reminders for appointments scheduled for tomorrow.';

    /**
     * Execute the console command.
     */
    public function handle(WorkflowAutomationService $workflowService)
    {
        $tomorrow = Carbon::tomorrow()->toDateString();
        $this->info("Scanning appointments for tomorrow: {$tomorrow}");

        // Fetch tomorrow's active/confirmed appointments (support both Approved and confirmed)
        $appointments = Appointment::withoutGlobalScopes()
            ->whereDate('appointment_date', $tomorrow)
            ->whereIn('status', ['confirmed', 'Approved'])
            ->with(['patient', 'clinic', 'clinic.fbPageIntegration', 'service'])
            ->get();

        $this->info("Found {$appointments->count()} confirmed appointments.");

        foreach ($appointments as $appointment) {
            $patient = $appointment->patient;
            $clinic = $appointment->clinic;

            if (!$patient || !$clinic) {
                continue;
            }

            try {
                $workflowService->triggerWorkflow($clinic, $patient, $appointment, 'appointment_reminder');
                $this->info("Reminder workflow dispatched for patient ID: {$patient->id}");
            } catch (\Exception $e) {
                Log::error('Failed to dispatch reminder workflow: ' . $e->getMessage());
            }
        }

        $this->info("Completed sending reminders.");
    }
}

