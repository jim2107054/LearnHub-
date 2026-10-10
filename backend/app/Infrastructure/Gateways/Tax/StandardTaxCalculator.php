<?php

declare(strict_types=1);

namespace App\Infrastructure\Gateways\Tax;

use App\Infrastructure\Support\ValueObjects\Money;

class StandardTaxCalculator implements TaxCalculator
{
    /**
     * Standard statutory rates per country ISO-2 (sample tax lookup table).
     *
     * @var array<string, float>
     */
    protected array $taxRates = [
        'BD' => 5.0,  // Bangladesh VAT
        'US' => 0.0,  // US origin/state handled separately
        'GB' => 20.0, // UK VAT
        'DE' => 19.0, // Germany VAT
        'FR' => 20.0, // France VAT
        'CA' => 13.0, // Canada HST average
        'AU' => 10.0, // Australia GST
    ];

    public function calculateTax(Money $subtotal, string $countryCode, ?string $state = null): Money
    {
        $country = strtoupper(trim($countryCode));
        $rate = $this->taxRates[$country] ?? 0.0;

        return $subtotal->percentage($rate);
    }
}
