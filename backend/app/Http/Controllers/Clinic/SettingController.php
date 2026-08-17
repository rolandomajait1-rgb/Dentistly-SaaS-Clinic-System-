<?php

namespace App\Http\Controllers\Clinic;

use App\Http\Controllers\Controller;
use App\Models\{Clinic, ClinicFaq, FbPageIntegration, Patient};
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Get clinic profile, branding and notification settings
     */
    public function getSettings(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $clinic = Clinic::with('fbPageIntegration')->findOrFail($clinicId);

        return response()->json($clinic);
    }

    /**
     * Update clinic profile and notification settings
     */
    public function updateSettings(Request $request)
    {
        $clinicId = $request->user()->clinic_id;

        $request->validate([
            'clinic_name' => 'required|string',
            'contact_number' => 'required|string',
            'address' => 'required|string',
            'fb_page_id' => 'nullable|string',
            'page_access_token' => 'nullable|string',
            'webhook_verify_token' => 'nullable|string',
            'notification_settings' => 'nullable|array',
        ]);

        $clinic = Clinic::findOrFail($clinicId);
        $clinic->update([
            'clinic_name' => $request->clinic_name,
            'contact_number' => $request->contact_number,
            'address' => $request->address,
            'notification_settings' => $request->notification_settings,
        ]);

        $notifSettings = $request->notification_settings ?? [];

        // Upsert location FAQ if chatbot_location_address is provided
        if (isset($notifSettings['chatbot_location_address'])) {
            ClinicFaq::updateOrCreate(
                [
                    'clinic_id' => $clinic->id,
                    'category' => 'location',
                    'question' => 'Where is the clinic located?',
                ],
                [
                    'answer' => $notifSettings['chatbot_location_address'],
                    'keywords' => ['location', 'address', 'saan', 'parking', 'landmark', 'direksyon', 'map', 'near'],
                    'is_active' => true,
                ]
            );
        }

        // Upsert payment methods FAQ if chatbot_payment_methods is provided
        if (isset($notifSettings['chatbot_payment_methods'])) {
            ClinicFaq::updateOrCreate(
                [
                    'clinic_id' => $clinic->id,
                    'category' => 'pricing',
                    'question' => 'What payment methods do you accept?',
                ],
                [
                    'answer' => 'We accept the following payment methods: ' . $notifSettings['chatbot_payment_methods'],
                    'keywords' => ['payment', 'gcash', 'cash', 'credit card', 'maya', 'pay', 'bayad', 'methods'],
                    'is_active' => true,
                ]
            );
        }

        if ($request->has('fb_page_id')) {
            $existing = FbPageIntegration::where('clinic_id', $clinic->id)->first();
            $token = $request->page_access_token;
            if (empty($token) && $existing && $existing->fb_page_id === $request->fb_page_id) {
                $token = $existing->page_access_token;
            }

            FbPageIntegration::updateOrCreate(
                ['clinic_id' => $clinic->id],
                [
                    'fb_page_id' => $request->fb_page_id,
                    'fb_page_name' => $request->clinic_name,
                    'page_access_token' => $token,
                    'webhook_verify_token' => $request->webhook_verify_token ?? ($existing ? $existing->webhook_verify_token : 'dental_appointment_webhook_token'),
                    'is_active' => !empty($request->fb_page_id) && !empty($token),
                ]
            );
        }

        return response()->json([
            'message' => 'Settings updated successfully.',
            'clinic' => $clinic->load('fbPageIntegration')
        ]);
    }

    /**
     * Trigger a test Email workflow dispatch directly from Clinic Settings
     */
    public function testEmailWorkflow(Request $request)
    {
        $clinicId = $request->user()->clinic_id;
        $clinic = Clinic::findOrFail($clinicId);

        $request->validate([
            'email' => 'required|email',
            'subject' => 'nullable|string',
            'body' => 'nullable|string',
        ]);

        $dummyPatient = new Patient([
            'full_name' => 'Sample Patient',
            'email' => $request->email,
        ]);

        $workflow = resolve(\App\Services\WorkflowAutomationService::class);
        $mailService = resolve(\App\Services\MailService::class);

        $subjTemplate = $request->subject ?? ($clinic->notification_settings['email_subject_approved'] ?? "Confirmed: Your Appointment at {$clinic->clinic_name}");
        $bodyTemplate = $request->body ?? ($clinic->notification_settings['email_body_approved'] ?? "<p>Dear <strong>{patient_name}</strong>,</p><p>Great news! Your dental appointment has been approved and confirmed by our team.</p>");

        $parsedSubj = $workflow->parseTemplate($subjTemplate, $clinic, $dummyPatient, null);
        $parsedBody = $workflow->parseTemplate($bodyTemplate, $clinic, $dummyPatient, null);

        $success = $mailService->sendEmail($request->email, $parsedSubj, $parsedBody, $clinic->clinic_name, $clinic);

        return response()->json([
            'success' => $success,
            'email' => $request->email,
            'subject' => $parsedSubj,
            'body' => $parsedBody,
            'detail' => $success ? 'Test Email workflow successfully dispatched via SMTP mailer.' : 'SMTP Mailer returned an error.'
        ]);
    }
}
