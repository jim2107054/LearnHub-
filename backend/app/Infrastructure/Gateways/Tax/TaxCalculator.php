<?php

declare(strict_types=1);

namespace App\Infrastructure\Gateways\Tax;

use App\Infrastructure\Support\ValueObjects\Money;

interface TaxCalculator
{
    /**
     * Compute applicable indirect tax (VAT/GST/Sales Tax) based on customer location.
     */
    public function calculateTax(Money $subtotal, string $countryCode, ?string $state = null): Money;
}
