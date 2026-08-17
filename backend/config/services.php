<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'messenger' => [
        'verify_token'       => env('MESSENGER_VERIFY_TOKEN'),
        'page_access_token'  => env('MESSENGER_PAGE_ACCESS_TOKEN'),
    ],

    'facebook' => [
        'webhook_verify_token' => env('MESSENGER_VERIFY_TOKEN'),
        'page_access_token'    => env('MESSENGER_PAGE_ACCESS_TOKEN'),
        'app_id'               => env('FACEBOOK_APP_ID'),
        'app_secret'           => env('FACEBOOK_APP_SECRET'),
        'redirect_uri'         => env('FACEBOOK_REDIRECT_URI', 'http://localhost:3000/dashboard/settings'),
    ],

    'wit_ai' => [
        'server_token' => env('WIT_AI_SERVER_TOKEN'),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect_uri' => env('GOOGLE_REDIRECT_URI', 'http://localhost:5173/'),
        'service_account_json' => env('GOOGLE_SERVICE_ACCOUNT_JSON'),
    ],

];
