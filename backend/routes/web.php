<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DentalWebhookController;

Route::get('/', function () {
    return response()->json([
        'message' => 'Pivodent Headless API is running.',
        'frontend_url' => 'http://localhost:5173'
    ]);
});

// Privacy Policy (required for Facebook App Review)
Route::get('/privacy-policy', function () {
    return response(
        "<h1>Privacy Policy - Dental Appointment System</h1>
        <p>This dental appointment chatbot collects your name, contact number, address, age, and medical history for appointment booking purposes only.</p>
        <p>Your data is stored securely and will not be shared with third parties.</p>
        <p>For concerns, contact us through our Facebook Page.</p>",
        200,
        ['Content-Type' => 'text/html']
    );
});

// ─── Facebook Webhook Aliases ──────────────────────────────────────────────
// Facebook Developer Dashboard is configured to POST /webhook
// These aliases handle it directly without needing to change the dashboard.
Route::get('/webhook',  [DentalWebhookController::class, 'verify'])->name('webhook.verify');
Route::post('/webhook', [DentalWebhookController::class, 'handle'])->name('webhook.handle');

// Messenger Webview Routes
Route::get('/webview/calendar/{sessionId}', [\App\Http\Controllers\WebviewController::class, 'showCalendar'])
    ->name('webview.calendar');
Route::get('/webview/patient/portal/{sessionId}', [\App\Http\Controllers\WebviewController::class, 'showPatientPortal'])
    ->name('webview.patient_portal');
