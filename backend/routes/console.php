<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run automated messenger reminders every hour
Schedule::command('chatbot:send-reminders')->hourly();

// Run SaaS multi-channel (SMS/Email/Messenger) reminders hourly for 24h & same-day upcoming notices
Schedule::command('app:send-appointment-reminders')->hourly();

// Keep calendar slots rolling 30 days ahead daily
Schedule::command('slots:generate')->dailyAt('00:01');
