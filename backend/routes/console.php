<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run automated messenger reminders every hour
Schedule::command('chatbot:send-reminders')->hourly();

// Run SaaS multi-channel (SMS/Email/Messenger) reminders daily at 8:00 AM
Schedule::command('app:send-appointment-reminders')->dailyAt('08:00');
