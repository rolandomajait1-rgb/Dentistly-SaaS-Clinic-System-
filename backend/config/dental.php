<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Dental Appointment System Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration options for the dental appointment
    | system including Facebook integration, appointment settings, and
    | subscription management.
    |
    */

    'facebook' => [
        'app_id' => env('FACEBOOK_APP_ID'),
        'app_secret' => env('FACEBOOK_APP_SECRET'),
        'page_access_token' => env('FACEBOOK_PAGE_ACCESS_TOKEN'),
        'webhook_verify_token' => env('FACEBOOK_WEBHOOK_VERIFY_TOKEN', 'dental_appointment_webhook_token'),
        'api_version' => env('FACEBOOK_API_VERSION', 'v21.0'),
    ],

    'appointment' => [
        // Slot duration in minutes
        'slot_duration' => env('APPOINTMENT_SLOT_DURATION', 60),
        
        // How many days in advance can patients book
        'advance_booking_days' => env('APPOINTMENT_ADVANCE_DAYS', 30),
        
        // Minimum hours before appointment time to book
        'min_booking_hours' => env('APPOINTMENT_MIN_HOURS', 2),
        
        // When to send reminder notifications (hours before appointment)
        'reminder_hours' => [24, 3, 1],
        
        // Session timeout in minutes
        'session_timeout' => env('CHAT_SESSION_TIMEOUT', 30),
        
        // Default operating hours
        'default_operating_hours' => [
            'Monday' => '09:00 - 18:00',
            'Tuesday' => '09:00 - 18:00',
            'Wednesday' => '09:00 - 18:00',
            'Thursday' => '09:00 - 18:00',
            'Friday' => '09:00 - 18:00',
            'Saturday' => '09:00 - 15:00',
            'Sunday' => 'Closed',
        ],
        
        // Lunch break
        'lunch_break' => [
            'start' => '12:00',
            'end' => '13:00',
        ],
    ],

    'subscription' => [
        // Trial period in days
        'trial_days' => env('SUBSCRIPTION_TRIAL_DAYS', 30),
        
        // Grace period after subscription expires (days)
        'grace_period_days' => env('SUBSCRIPTION_GRACE_DAYS', 7),
        
        // Billing cycle
        'billing_cycle' => 'monthly', // monthly, yearly
        
        // Payment methods
        'payment_methods' => ['credit_card', 'gcash', 'paymaya', 'bank_transfer'],
    ],

    'notifications' => [
        // Channels
        'channels' => [
            'messenger' => true,
            'sms' => env('NOTIFICATION_SMS_ENABLED', false),
            'email' => env('NOTIFICATION_EMAIL_ENABLED', false),
        ],
        
        // Retry settings
        'retry_attempts' => 3,
        'retry_delay' => 5, // minutes
        
        // Queue settings
        'queue' => env('NOTIFICATION_QUEUE', 'default'),
    ],

    'queue' => [
        // Auto-assign queue numbers
        'auto_assign' => true,
        
        // Queue number format
        'number_format' => 'sequential', // sequential, time-based
        
        // Reset queue daily
        'reset_daily' => true,
        
        // Estimated service time per patient (minutes)
        'estimated_service_time' => 45,
    ],

    'security' => [
        // Encrypt sensitive patient data
        'encrypt_patient_data' => true,
        
        // Log all access to patient records
        'audit_logging' => true,
        
        // Session security
        'secure_sessions' => true,
        
        // Rate limiting
        'rate_limit' => [
            'enabled' => true,
            'max_attempts' => 60, // per minute
        ],
    ],

    'features' => [
        // Feature flags
        'cancel_reschedule' => env('FEATURE_CANCEL_RESCHEDULE', false),
        'payment_integration' => env('FEATURE_PAYMENT', false),
        'telemedicine' => env('FEATURE_TELEMEDICINE', false),
        'multi_branch' => env('FEATURE_MULTI_BRANCH', false),
        'custom_branding' => env('FEATURE_CUSTOM_BRANDING', false),
        'api_access' => env('FEATURE_API_ACCESS', false),
        'analytics' => env('FEATURE_ANALYTICS', true),
    ],

    'limits' => [
        // Default limits (can be overridden by subscription plan)
        'free' => [
            'appointments_per_month' => 50,
            'staff_accounts' => 1,
            'branches' => 1,
        ],
        'basic' => [
            'appointments_per_month' => 200,
            'staff_accounts' => 3,
            'branches' => 1,
        ],
        'professional' => [
            'appointments_per_month' => null, // unlimited
            'staff_accounts' => 10,
            'branches' => 1,
        ],
        'enterprise' => [
            'appointments_per_month' => null, // unlimited
            'staff_accounts' => null, // unlimited
            'branches' => 10,
        ],
    ],

    'ui' => [
        // Chatbot messages
        'welcome_message' => '👋 Hi! Welcome to {clinic_name}! I\'m your dental appointment assistant.',
        
        // Emojis
        'emojis' => [
            'available' => '🟢',
            'booked' => '🔴',
            'pending' => '⏳',
            'confirmed' => '✅',
            'cancelled' => '❌',
            'completed' => '✔️',
            'no_show' => '⚠️',
        ],
        
        // Colors
        'colors' => [
            'primary' => '#4F46E5',
            'success' => '#10B981',
            'warning' => '#F59E0B',
            'danger' => '#EF4444',
        ],
    ],

];
