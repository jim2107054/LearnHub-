<?php

return [
    /*
    |--------------------------------------------------------------------------
    | LearnHub Platform Business Engine Configuration
    |--------------------------------------------------------------------------
    */

    'currency' => env('LEARNHUB_DEFAULT_CURRENCY', 'USD'),

    'platform_fee_percent' => (int) env('LEARNHUB_PLATFORM_FEE_PERCENT', 20),

    'earnings_hold_days' => (int) env('LEARNHUB_EARNINGS_HOLD_DAYS', 30),

    'minimum_payout_amount_cents' => (int) env('LEARNHUB_MINIMUM_PAYOUT_AMOUNT_CENTS', 5000),

    'refund_window_days' => (int) env('LEARNHUB_REFUND_WINDOW_DAYS', 30),

    'max_progress_for_refund_percent' => (int) env('LEARNHUB_MAX_PROGRESS_FOR_REFUND_PERCENT', 10),

    'concurrent_stream_limit' => (int) env('LEARNHUB_CONCURRENT_STREAM_LIMIT', 3),

    'payment_gateway' => env('PAYMENT_GATEWAY_DEFAULT', 'stripe'),

    'video_pipeline_driver' => env('VIDEO_PIPELINE_DRIVER', 'fake'),
];
