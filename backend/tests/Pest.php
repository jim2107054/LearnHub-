<?php

use Tests\TestCase;

/*
|--------------------------------------------------------------------------
| Pest Test Case Configuration
|--------------------------------------------------------------------------
*/

uses(TestCase::class)->in('Feature', 'Unit');

/*
|--------------------------------------------------------------------------
| Custom Pest Expectations / Helpers
|--------------------------------------------------------------------------
*/

expect()->extend('toBeMoney', function (int $amount, string $currency = 'USD') {
    return $this->amount->toBe($amount)->currency->toBe($currency);
});
