<?php

namespace App\Services;

use App\Models\{Clinic, Patient, Appointment, Notification};
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class WorkflowAutomationService
{
    public function __construct(
        protected MailService $mailService,
        protected MessengerService $messengerService
    ) {}

    /**
     * Trigger dynamic workflow for a given event type across active channels (Email & Messenger)
     */
    public function triggerWorkflow(
        Clinic $clinic,
        Patient $patient,
        ?Appointment $appointment,
        string $eventType,
        array $extraData = []
    ): array {
        $results = [
            'email' => ['sent' => false, 'message' => null],
            'messenger' => ['sent' => false, 'message' => null],
        ];

        $notifSettings = $clinic->notification_settings ?? [];

        // 1. Process Email Workflow
        $emailEnabled = $notifSettings['email_enabled'] ?? true;
        if ($emailEnabled && !empty($patient->email) && $this->isEmailEventAllowed($eventType, $notifSettings)) {
            $emailDetails = $this->getEmailDetails($eventType, $clinic, $patient, $appointment, $notifSettings, $extraData);
            if ($emailDetails) {
                $emailSuccess = $this->mailService->sendEmail(
                    $patient->email,
                    $emailDetails['subject'],
                    $emailDetails['body'],
                    $clinic->clinic_name,
                    $clinic
                );

                $notifTypeEnum = $this->mapEventTypeToNotificationEnum($eventType);
                Notification::create([
                    'clinic_id' => $clinic->id,
                    'patient_id' => $patient->id,
                    'appointment_id' => $appointment?->id,
                    'notification_type' => $notifTypeEnum,
                    'message' => "Subject: {$emailDetails['subject']}\n\n{$emailDetails['body']}",
                    'channel' => 'email',
                    'status' => $emailSuccess ? 'sent' : 'failed',
                    'sent_at' => $emailSuccess ? now() : null,
                    'error_message' => $emailSuccess ? null : 'SMTP dispatch failed',
                ]);

                $results['email'] = [
                    'sent' => $emailSuccess,
                    'message' => $emailDetails['body']
                ];
            }
        }

        // 2. Process Messenger Workflow
        $integration = $clinic->fbPageIntegration;
        if ($integration && $integration->is_active && !empty($patient->fb_messenger_id) && !str_starts_with($patient->fb_messenger_id, 'walkin_') && !str_starts_with($patient->fb_messenger_id, 'web_')) {
            $messengerText = $this->getMessengerMessage($eventType, $clinic, $patient, $appointment, $notifSettings, $extraData);
            if (!empty($messengerText)) {
                try {
                    $msgrSuccess = $this->messengerService->sendTextMessage($patient->fb_messenger_id, $messengerText, $integration);
                    
                    $notifTypeEnum = $this->mapEventTypeToNotificationEnum($eventType);
                    Notification::create([
                        'clinic_id' => $clinic->id,
                        'patient_id' => $patient->id,
                        'appointment_id' => $appointment?->id,
                        'notification_type' => $notifTypeEnum,
                        'message' => $messengerText,
                        'channel' => 'messenger',
                        'status' => 'sent',
                        'sent_at' => now(),
                    ]);

                    $results['messenger'] = [
                        'sent' => true,
                        'message' => $messengerText
                    ];
                } catch (\Exception $e) {
                    Log::error('Workflow Messenger error: ' . $e->getMessage());
                }
            }
        }

        return $results;
    }

    /**
     * Map internal event types to database Notification Enum types
     */
    protected function mapEventTypeToNotificationEnum(string $eventType): string
    {
        return match ($eventType) {
            'booking_created' => 'booking_confirmation',
            'appointment_approved' => 'approval',
            'appointment_cancelled' => 'cancellation',
            'appointment_rescheduled' => 'reschedule',
            'appointment_completed' => 'follow_up',
            'appointment_reminder' => 'reminder_24h',
            default => 'booking_confirmation',
        };
    }

    protected function isEmailEventAllowed(string $eventType, array $settings): bool
    {
        return match ($eventType) {
            'booking_created', 'appointment_approved' => $settings['email_confirmation_enabled'] ?? true,
            'appointment_reminder' => $settings['email_reminder_enabled'] ?? true,
            'appointment_completed' => $settings['email_post_visit_enabled'] ?? true,
            default => true,
        };
    }

    /**
     * Render Email Subject and HTML body details
     */
    public function getEmailDetails(
        string $eventType,
        Clinic $clinic,
        Patient $patient,
        ?Appointment $appointment,
        array $settings,
        array $extraData = []
    ): array {
        switch ($eventType) {
            case 'booking_created':
                $subject = "Booking Request Received - {$clinic->clinic_name}";
                $bodyTemplate = "
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>Thank you for submitting your booking request with <strong>{clinic_name}</strong>.</p>
                    <ul>
                        <li><strong>Reference:</strong> {reference}</li>
                        <li><strong>Service:</strong> {service_name}</li>
                        <li><strong>Requested Date:</strong> {date}</li>
                        <li><strong>Requested Time:</strong> {time}</li>
                    </ul>
                    <p>Our clinical team is reviewing your schedule request and will send an official confirmation shortly.</p>
                    <p>Best regards,<br>The {clinic_name} Team</p>
                ";
                break;

            case 'appointment_approved':
                $subject = $settings['email_subject_approved'] ?? "Confirmed: Your Appointment at {$clinic->clinic_name}";
                $defaultBody = "
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>Great news! Your dental appointment has been approved and confirmed by our team.</p>
                    <ul>
                        <li><strong>Reference:</strong> {reference}</li>
                        <li><strong>Service:</strong> {service_name}</li>
                        <li><strong>Date:</strong> {date}</li>
                        <li><strong>Time:</strong> {time}</li>
                    </ul>
                    <p><strong>Location:</strong> {clinic_address}</p>
                    <p>Please arrive at least 10 minutes before your scheduled time. If you need to cancel or reschedule, please reach out to us at {clinic_phone}.</p>
                    <p>See you soon!</p>
                ";
                $bodyTemplate = $settings['email_body_approved'] ?? $defaultBody;
                break;

            case 'appointment_cancelled':
                $subject = $settings['email_subject_cancelled'] ?? "Cancelled: Your Appointment at {$clinic->clinic_name}";
                $defaultBody = "
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>Please be advised that your dental appointment (Reference: <strong>{reference}</strong>) has been cancelled by our staff.</p>
                    <p><strong>{reason}</strong></p>
                    <p>If you wish to schedule another visit or discuss this cancellation, feel free to call us at {clinic_phone}.</p>
                    <p>Best regards,<br>The {clinic_name} Team</p>
                ";
                $bodyTemplate = $settings['email_body_cancelled'] ?? $defaultBody;
                break;

            case 'appointment_rescheduled':
                $subject = "Rescheduled: Your Appointment at {$clinic->clinic_name}";
                $bodyTemplate = "
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>Your appointment at <strong>{clinic_name}</strong> has been updated to a new schedule:</p>
                    <ul>
                        <li><strong>Reference:</strong> {reference}</li>
                        <li><strong>New Date:</strong> {date}</li>
                        <li><strong>New Time:</strong> {time}</li>
                        <li><strong>Service:</strong> {service_name}</li>
                    </ul>
                    <p>If this new slot does not work for you, please contact us at {clinic_phone}.</p>
                    <p>Best regards,<br>The {clinic_name} Team</p>
                ";
                break;

            case 'appointment_completed':
                $subject = "Thank you for visiting {$clinic->clinic_name}!";
                $bodyTemplate = "
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>Thank you for choosing <strong>{clinic_name}</strong> for your <strong>{service_name}</strong> treatment today!</p>
                    <p>Please follow any prescribed post-treatment care instructions. If you experience any discomfort or have questions, don't hesitate to reach out to us at {clinic_phone}.</p>
                    <p>Wishing you a healthy smile,<br>The {clinic_name} Team</p>
                ";
                break;

            case 'appointment_reminder':
                $subject = "Reminder: Your Dental Appointment Tomorrow at {$clinic->clinic_name}";
                $bodyTemplate = "
                    <p>Dear <strong>{patient_name}</strong>,</p>
                    <p>This is a friendly reminder of your upcoming appointment tomorrow:</p>
                    <ul>
                        <li><strong>Date:</strong> {date}</li>
                        <li><strong>Time:</strong> {time}</li>
                        <li><strong>Service:</strong> {service_name}</li>
                        <li><strong>Clinic:</strong> {clinic_name}</li>
                    </ul>
                    <p>Location: {clinic_address}</p>
                    <p>If you need assistance, call us at {clinic_phone}.</p>
                    <p>Best regards,<br>The {clinic_name} Team</p>
                ";
                break;

            default:
                $subject = "Notification from {$clinic->clinic_name}";
                $bodyTemplate = "<p>Hi {patient_name}, you have a new update regarding your appointment at {clinic_name}.</p>";
                break;
        }

        return [
            'subject' => $this->parseTemplate($subject, $clinic, $patient, $appointment, $extraData),
            'body' => $this->parseTemplate($bodyTemplate, $clinic, $patient, $appointment, $extraData),
        ];
    }

    /**
     * Render Messenger message
     */
    public function getMessengerMessage(
        string $eventType,
        Clinic $clinic,
        Patient $patient,
        ?Appointment $appointment,
        array $settings,
        array $extraData = []
    ): string {
        $dateStr = $appointment ? Carbon::parse($appointment->appointment_date)->format('M d, Y') : Carbon::today()->format('M d, Y');
        $timeStr = $appointment ? Carbon::parse($appointment->appointment_time)->format('g:i A') : 'TBD';
        $serviceName = $appointment?->service?->service_name ?? 'Dental Service';
        $ref = $appointment?->reference_number ?? 'N/A';

        return match ($eventType) {
            'booking_created' => "📩 BOOKING RECEIVED!\n━━━━━━━━━━━━━━\n\nHi {$patient->full_name}, your booking request at {$clinic->clinic_name} for {$serviceName} on {$dateStr} at {$timeStr} has been received. Reference: {$ref}. We'll verify and approve it shortly!",
            'appointment_approved' => "✅ APPOINTMENT CONFIRMED!\n━━━━━━━━━━━━━━\n\nYour appointment at {$clinic->clinic_name} has been approved! 😊\n\nReference: {$ref}\nService: {$serviceName}\nDate: {$dateStr}\nTime: {$timeStr}\n" . ($appointment?->queue_number ? "Queue Number: #{$appointment->queue_number}\n" : "") . "\n📍 Address: {$clinic->address}\nPlease arrive 10 mins early. See you soon!",
            'appointment_cancelled' => "❌ APPOINTMENT CANCELLED\n━━━━━━━━━━━━━━\n\nYour appointment (Ref: {$ref}) at {$clinic->clinic_name} has been cancelled.\n\n" . ($appointment?->cancellation_reason ? "Reason: {$appointment->cancellation_reason}\n\n" : "") . "If you have questions, call us at {$clinic->contact_number}.",
            'appointment_rescheduled' => "📅 APPOINTMENT RESCHEDULED\n━━━━━━━━━━━━━━\n\nYour appointment at {$clinic->clinic_name} has been updated to {$dateStr} at {$timeStr}. Reference: {$ref}.",
            'appointment_completed' => "🦷 THANK YOU FOR YOUR VISIT!\n━━━━━━━━━━━━━━\n\nThank you for visiting {$clinic->clinic_name} today for {$serviceName}! Have a great day!",
            'appointment_reminder' => "🔔 APPOINTMENT REMINDER\n━━━━━━━━━━━━━━\n\nReminder: You have an appointment at {$clinic->clinic_name} tomorrow, {$dateStr} at {$timeStr} for {$serviceName}. Reference: {$ref}.",
            default => "Update regarding your appointment at {$clinic->clinic_name}.",
        };
    }

    /**
     * Replace standard placeholders with real context data
     */
    public function parseTemplate(
        string $template,
        Clinic $clinic,
        Patient $patient,
        ?Appointment $appointment,
        array $extraData = []
    ): string {
        $dateStr = $appointment ? Carbon::parse($appointment->appointment_date)->format('M d, Y') : ($extraData['date'] ?? Carbon::tomorrow()->format('M d, Y'));
        $timeStr = $appointment ? Carbon::parse($appointment->appointment_time)->format('g:i A') : ($extraData['time'] ?? '09:00 AM');
        $serviceName = $appointment?->service?->service_name ?? ($extraData['service_name'] ?? 'Dental Service');
        $ref = $appointment?->reference_number ?? ($extraData['reference'] ?? 'REF-' . strtoupper(substr(md5(time()), 0, 6)));
        $reason = $appointment?->cancellation_reason ?? ($extraData['reason'] ?? 'Schedule adjustment');
        $queueNo = $appointment?->queue_number ? "#{$appointment->queue_number}" : ($extraData['queue_number'] ?? '#1');

        $replacements = [
            '{patient_name}' => $patient->full_name ?? 'Valued Patient',
            '{clinic_name}' => $clinic->clinic_name,
            '{date}' => $dateStr,
            '{time}' => $timeStr,
            '{service_name}' => $serviceName,
            '{reference}' => $ref,
            '{reason}' => $reason ? "Reason: {$reason}." : "",
            '{clinic_phone}' => $clinic->contact_number ?? 'our clinic desk',
            '{clinic_address}' => $clinic->address ?? 'our clinic location',
            '{queue_number}' => $queueNo,
        ];

        return str_replace(array_keys($replacements), array_values($replacements), $template);
    }
}
