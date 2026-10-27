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
Route::post('/webhook', [DentalWebhookController::class, 'handle'])
    ->middleware('verify.messenger')
    ->name('webhook.handle');

// Messenger Webview Routes
Route::get('/webview/calendar/{sessionId}', [\App\Http\Controllers\WebviewController::class, 'showCalendar'])
    ->name('webview.calendar');
Route::get('/webview/patient/portal/{sessionId}', [\App\Http\Controllers\WebviewController::class, 'showPatientPortal'])
    ->name('webview.patient_portal');

// Public Booking Portal Route (handles /book/{clinicSlug} without 404)
Route::get('/book/{clinicSlug}', function ($clinicSlug) {
    $frontendUrl = config('app.frontend_url') ?: env('FRONTEND_URL');
    $appUrl = config('app.url');

    // If frontend URL is defined and points to a different host (e.g. Vite frontend tunnel), redirect there
    if (!empty($frontendUrl) && $frontendUrl !== $appUrl && !str_contains($frontendUrl, request()->getHost())) {
        return redirect(rtrim($frontendUrl, '/') . '/book/' . $clinicSlug);
    }

    $clinic = \App\Models\Clinic::where('slug', $clinicSlug)
        ->orWhere('id', $clinicSlug)
        ->orWhereHas('tenant', fn($q) => $q->where('subdomain', $clinicSlug))
        ->first();

    if (!$clinic) {
        $clinic = \App\Models\Clinic::first();
    }

    if (!$clinic) {
        return response("Clinic not found", 404);
    }

    // Fallback: Open the clinic calendar booking webview cleanly
    $session = \App\Models\ChatSession::where('clinic_id', $clinic->id)->latest()->first();
    if (!$session) {
        $session = \App\Models\ChatSession::create([
            'clinic_id' => $clinic->id,
            'session_id' => (string) \Illuminate\Support\Str::uuid(),
            'fb_messenger_id' => 'web_' . \Illuminate\Support\Str::random(10),
            'current_step' => 'welcome',
            'last_interaction_at' => now(),
        ]);
    }

    return redirect()->route('webview.calendar', ['sessionId' => $session->session_id]);
})->name('public.booking');

