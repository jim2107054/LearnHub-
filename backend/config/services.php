<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Third Party Services Configuration
    |--------------------------------------------------------------------------
    */

    'stripe' => [
        'key' => env('STRIPE_KEY'),
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'currency' => env('STRIPE_CURRENCY', 'USD'),
    ],

    'mediaconvert' => [
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
        'endpoint' => env('AWS_MEDIACONVERT_ENDPOINT'),
        'role_arn' => env('AWS_MEDIACONVERT_ROLE_ARN'),
        'queue' => env('AWS_MEDIACONVERT_QUEUE'),
    ],

    'cloudfront' => [
        'domain' => env('CDN_BASE_URL', 'http://127.0.0.1:9000/learnhub-storage'),
        'key_pair_id' => env('CDN_KEY_PAIR_ID'),
        'private_key_path' => env('CDN_PRIVATE_KEY_PATH'),
        'signing_ttl_minutes' => (int) env('CDN_URL_SIGNING_TTL_MINUTES', 120),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI'),
    ],

    'apple' => [
        'client_id' => env('APPLE_CLIENT_ID'),
        'client_secret' => env('APPLE_CLIENT_SECRET'),
        'redirect' => env('APPLE_REDIRECT_URI'),
    ],

    'facebook' => [
        'client_id' => env('FACEBOOK_CLIENT_ID'),
        'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('FACEBOOK_REDIRECT_URI'),
    ],
];
