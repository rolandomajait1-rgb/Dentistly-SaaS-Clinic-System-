<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Http\Request;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limit para sa Messenger Webhook (100 requests per minute)
        RateLimiter::for('webhook', function (Request $request) {
            return Limit::perMinute(100)->by($request->ip());
        });

        // Strict rate limit para sa staff login iwas brute-force (5 requests per minute)
        RateLimiter::for('login', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Strict rate limit para sa login & password reset laban sa brute-force (5 attempts per minute)
        RateLimiter::for('auth-strict', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Anti-DoS rate limit para sa public booking at cancellation (20 requests per minute)
        RateLimiter::for('public-booking', function (Request $request) {
            return Limit::perMinute(20)->by($request->ip());
        });

        // Anti-scraping rate limit para sa appointment lookup (10 requests per minute)
        RateLimiter::for('public-lookup', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });

        // ── AuthGates for Granular RBAC (WBS Module 2.0) ──
        \Illuminate\Support\Facades\Gate::define('manage-clinic-settings', function ($user) {
            return method_exists($user, 'isAdmin') ? $user->isAdmin() : false;
        });

        \Illuminate\Support\Facades\Gate::define('manage-staff', function ($user) {
            return method_exists($user, 'isAdmin') ? $user->isAdmin() : false;
        });

        \Illuminate\Support\Facades\Gate::define('manage-prescriptions', function ($user) {
            $role = strtolower($user->role ?? '');
            return in_array($role, ['owner', 'admin', 'doctor', 'dentist']);
        });

        \Illuminate\Support\Facades\Gate::define('manage-soap-notes', function ($user) {
            $role = strtolower($user->role ?? '');
            return in_array($role, ['owner', 'admin', 'doctor', 'dentist']);
        });

        \Illuminate\Support\Facades\Gate::define('view-patient-records', function ($user) {
            return !empty($user);
        });
    }
}
