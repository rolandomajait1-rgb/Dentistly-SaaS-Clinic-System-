<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notification;
use App\Services\MessengerService;
use Illuminate\Support\Facades\Log;

class SendMessengerReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chatbot:send-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send scheduled automated reminders to patients via Messenger';

    /**
     * Execute the console command.
     */
    public function handle(MessengerService $messengerService)
    {
        $this->info('Checking for pending automated reminders...');

        // Fetch notifications that are scheduled to be sent today or earlier and are still pending
        $pendingNotifications = Notification::where('status', 'pending')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->with(['patient', 'clinic.fbPageIntegration'])
            ->get();

        if ($pendingNotifications->isEmpty()) {
            $this->info('No pending reminders found.');
            return;
        }

        $sentCount = 0;
        $failedCount = 0;

        foreach ($pendingNotifications as $notification) {
            $integration = $notification->clinic->fbPageIntegration;
            $patient = $notification->patient;

            if (!$integration || !$patient || !$patient->fb_messenger_id) {
                $notification->update([
                    'status' => 'failed',
                    'error_message' => 'Missing integration or Facebook Messenger ID',
                ]);
                $failedCount++;
                continue;
            }

            // Build the reminder message
            $message = "🔔 *DENTAL CLINIC REMINDER*\n";
            $message .= "━━━━━━━━━━━━━━\n\n";
            $message .= "Hi {$patient->full_name},\n\n";
            $message .= $notification->message . "\n\n";
            $message .= "Please tap an option below to proceed:\n";

            $buttons = [
                ['title' => '📅 Book Appointment', 'payload' => 'BOOK_APPOINTMENT'],
                ['title' => '📞 Contact Clinic', 'payload' => 'CONTACT_US'],
            ];

            // Send via Messenger
            $success = $messengerService->sendButtonMessage(
                $patient->fb_messenger_id,
                $message,
                $buttons,
                $integration
            );

            if ($success) {
                $notification->update([
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);
                $sentCount++;
            } else {
                $notification->update([
                    'status' => 'failed',
                    'error_message' => 'Failed to send via Messenger API',
                    'retry_count' => $notification->retry_count + 1,
                ]);
                
                // If it failed less than 3 times, set it back to pending for the next run
                if ($notification->retry_count < 3) {
                    $notification->update(['status' => 'pending']);
                }
                
                $failedCount++;
            }
            
            // Avoid rate limiting
            sleep(1);
        }

        $this->info("Process complete! Sent: {$sentCount}, Failed: {$failedCount}");
        Log::info("Automated reminders processed. Sent: {$sentCount}, Failed: {$failedCount}");
    }
}
