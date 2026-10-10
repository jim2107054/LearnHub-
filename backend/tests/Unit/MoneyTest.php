<?php

use App\Infrastructure\Support\ValueObjects\Money;

test('it creates money with minor units and default currency', function () {
    $money = Money::fromCents(4999);

    expect($money->amount)->toBe(4999);
    expect($money->currency)->toBe('USD');
    expect($money->toMajorUnits())->toBe(49.99);
    expect((string) $money)->toBe('USD 49.99');
});

test('it adds money with the same currency', function () {
    $a = Money::fromCents(2000, 'USD');
    $b = Money::fromCents(3000, 'USD');

    $sum = $a->add($b);

    expect($sum->amount)->toBe(5000);
    expect($sum->currency)->toBe('USD');
});

test('it rejects addition of different currencies', function () {
    $usd = Money::fromCents(1000, 'USD');
    $eur = Money::fromCents(1000, 'EUR');

    $usd->add($eur);
})->throws(InvalidArgumentException::class);

test('it subtracts money correctly', function () {
    $a = Money::fromCents(5000, 'USD');
    $b = Money::fromCents(1500, 'USD');

    $diff = $a->subtract($b);

    expect($diff->amount)->toBe(3500);
});

test('it calculates percentages and rounds to integer cents', function () {
    $price = Money::fromCents(1999, 'USD'); // $19.99
    $tax = $price->percentage(15); // 15% of 19.99 = 2.9985 -> 300 cents ($3.00)

    expect($tax->amount)->toBe(300);
});

test('it serializes to json properly', function () {
    $money = Money::fromCents(10000, 'USD');

    expect(json_encode($money))->toBe('{"amount":10000,"currency":"USD"}');
});
