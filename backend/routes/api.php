<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DentalWebhookController;
use App\Http\Controllers\WebviewController;
use App\Http\Controllers\PublicClinicController;
use App\Http\Controllers\DashboardApiController;
use App\Http\Controllers\SuperadminApiController;

// Dental Appointment System - Messenger Webhook (NO auth middleware, must be public)
Route::get('/webhook',  [DentalWebhookController::class, 'verify'])->name('api.webhook.verify');
Route::post('/webhook', [DentalWebhookController::class, 'handle'])
    ->middleware('verify.messenger')
    ->name('api.webhook.handle');

Route::get('/webhook/dental',  [DentalWebhookController::class, 'verify'])->name('dental.webhook.verify');
Route::post('/webhook/dental', [DentalWebhookController::class, 'handle'])
    ->middleware('verify.messenger')
    ->name('dental.webhook.handle');

Route::get('/webhook/messenger',  [DentalWebhookController::class, 'verify'])->name('api.webhook.messenger.verify');
Route::post('/webhook/messenger', [DentalWebhookController::class, 'handle'])
    ->middleware('verify.messenger')
    ->name('api.webhook.messenger.handle');

// Webview API
Route::post('/webview/calendar/submit', [WebviewController::class, 'submitCalendar']);

// Public Clinic Booking API
Route::prefix('public/clinics/{clinicSlug}')->group(function () {
    Route::get('/info', [PublicClinicController::class, 'info'])->name('api.public.info');
    Route::get('/services', [PublicClinicController::class, 'services'])->name('api.public.services');
    Route::get('/slots', [PublicClinicController::class, 'slots'])->name('api.public.slots');
    Route::post('/bookings', [PublicClinicController::class, 'bookings'])->name('api.public.bookings');
    Route::get('/appointments/lookup', [PublicClinicController::class, 'lookupAppointment'])->name('api.public.appointments.lookup');
    Route::post('/appointments/cancel', [PublicClinicController::class, 'cancelBooking'])->name('api.public.appointments.cancel');
});

// Clinic Dashboard API
Route::prefix('dashboard')->group(function () {
    // Public auth routes
    Route::post('/auth/login', [DashboardApiController::class, 'login']);
    Route::post('/auth/register', [DashboardApiController::class, 'register']);
    Route::post('/auth/verify-email', [DashboardApiController::class, 'verifyEmail']);
    Route::post('/auth/resend-verification', [DashboardApiController::class, 'resendVerification']);
    Route::post('/auth/google-login', [DashboardApiController::class, 'googleLogin']);
    
    // Protected routes - require authentication
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [DashboardApiController::class, 'logout']);
        Route::get('/overview', [DashboardApiController::class, 'getOverview']);
        Route::get('/appointments', [DashboardApiController::class, 'getAppointments']);
        Route::post('/appointments', [DashboardApiController::class, 'createAppointment']);
        Route::post('/appointments/{id}/status', [DashboardApiController::class, 'updateAppointmentStatus']);
        Route::get('/queue', [DashboardApiController::class, 'getQueue']);
        Route::get('/patients', [DashboardApiController::class, 'getPatients']);
        Route::get('/patients/{id}/ehr', [DashboardApiController::class, 'getPatientEhr']);
        Route::post('/patients/{id}/prescriptions', [DashboardApiController::class, 'createPrescription']);
        Route::get('/settings', [DashboardApiController::class, 'getSettings']);
        Route::post('/settings', [DashboardApiController::class, 'updateSettings']);
        Route::post('/settings/test-email', [DashboardApiController::class, 'testEmailWorkflow']);
        Route::get('/services', [DashboardApiController::class, 'getServices']);
        Route::post('/services', [DashboardApiController::class, 'addService']);
        Route::put('/services/{id}', [DashboardApiController::class, 'updateService']);
        Route::delete('/services/{id}', [DashboardApiController::class, 'deleteService']);

        // Facebook Integration Routes
        Route::prefix('facebook')->group(function () {
            Route::get('/auth-url', [DashboardApiController::class, 'getFacebookAuthUrl']);
            Route::post('/callback', [DashboardApiController::class, 'handleFacebookCallback']);
            Route::post('/connect', [DashboardApiController::class, 'connectFacebookPage']);
            Route::post('/disconnect', [DashboardApiController::class, 'disconnectFacebookPage']);
            Route::get('/page-details', [DashboardApiController::class, 'getFacebookPageDetails']);
            Route::post('/validate-token', [DashboardApiController::class, 'validateFacebookToken']);
            Route::post('/test-webhook', [DashboardApiController::class, 'testFacebookWebhook']);
        });
    });
});

// Superadmin Portal API Routes
Route::prefix('superadmin')->group(function () {
    Route::post('/auth/login', [SuperadminApiController::class, 'login']);

    Route::middleware(['auth:sanctum', 'superadmin'])->group(function () {
        Route::get('/stats', [SuperadminApiController::class, 'getStats']);
        Route::get('/clinics', [SuperadminApiController::class, 'getClinics']);
        Route::post('/clinics/{id}/status', [SuperadminApiController::class, 'updateClinicStatus']);
        
        Route::get('/plans', [SuperadminApiController::class, 'getPlans']);
        Route::post('/plans', [SuperadminApiController::class, 'savePlan']);
        Route::delete('/plans/{id}', [SuperadminApiController::class, 'deletePlan']);
    });
});
