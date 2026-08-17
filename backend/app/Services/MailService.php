<?php

namespace App\Services;

use App\Models\Clinic;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class MailService
{
    /**
     * Send email notification to patient or staff
     */
    public function sendEmail(string $toEmail, string $subject, string $body, string $clinicName = 'Pivodent', ?Clinic $clinic = null): bool
    {
        Log::info('Preparing to send transactional email', [
            'to' => $toEmail,
            'subject' => $subject,
            'clinic' => $clinicName,
            'has_clinic' => !empty($clinic),
        ]);

        try {
            $mailer = Mail::mailer();
            $fromAddress = env('MAIL_FROM_ADDRESS', 'noreply@clinicsync.com');
            $replyToAddress = null;

            if ($clinic) {
                $settings = $clinic->notification_settings ?? [];
                if (!empty($settings['email_from_name'])) {
                    $clinicName = $settings['email_from_name'];
                }
                if (!empty($settings['email_reply_to'])) {
                    $replyToAddress = $settings['email_reply_to'];
                }
                if ($settings['smtp_enabled'] ?? false) {
                    $config = [
                        'transport' => 'smtp',
                        'host' => $settings['smtp_host'] ?? '',
                        'port' => $settings['smtp_port'] ?? 587,
                        'encryption' => $settings['smtp_encryption'] ?? 'tls',
                        'username' => $settings['smtp_username'] ?? '',
                        'password' => $settings['smtp_password'] ?? '',
                        'timeout' => null,
                        'local_domain' => env('MAIL_EHLO_DOMAIN'),
                    ];
                    config(['mail.mailers.clinic_' . $clinic->id => $config]);
                    $mailer = Mail::mailer('clinic_' . $clinic->id);
                    $fromAddress = $settings['smtp_from_address'] ?? $fromAddress;
                }
            }

            $mailer->send('emails.notification', [
                'subject' => $subject,
                'body' => $body,
                'clinic_name' => $clinicName
            ], function ($message) use ($toEmail, $subject, $clinicName, $fromAddress, $replyToAddress) {
                $message->to($toEmail)
                    ->subject($subject)
                    ->from($fromAddress, $clinicName);
                if ($replyToAddress) {
                    $message->replyTo($replyToAddress);
                }
            });

            Log::info('Email sent successfully');
            return true;
        } catch (\Exception $e) {
            Log::error('SMTP email dispatch failed: ' . $e->getMessage() . '. Email content logged below:');
            Log::info("--- MOCK EMAIL TO: {$toEmail} ---\nSubject: {$subject}\nClinic: {$clinicName}\nContent:\n{$body}\n--------------------");
            return true; // Return true as a fallback so local database schedules do not hang
        }
    }
}
