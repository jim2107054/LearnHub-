<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Services;

use App\Domain\Commerce\Models\CartItem;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\Coupon;
use App\Infrastructure\Gateways\Tax\TaxCalculator;
use App\Infrastructure\Support\ValueObjects\Money;

class CartService
{
    public function __construct(
        protected TaxCalculator $taxCalculator
    ) {}

    /**
     * @return array{
     *     items: \Illuminate\Database\Eloquent\Collection<int, CartItem>,
     *     subtotal: Money,
     *     discount: Money,
     *     tax: Money,
     *     total: Money,
     *     currency: string
     * }
     */
    public function getSummary(User $user, string $countryCode = 'US'): array
    {
        $items = CartItem::query()
            ->where('user_id', $user->id)
            ->with(['course.primaryInstructor', 'coupon'])
            ->get();

        $subtotalCents = 0;
        $discountCents = 0;
        $currency = 'USD';

        foreach ($items as $item) {
            $course = $item->course;
            $currency = $course->price_currency;
            $priceCents = $course->price_amount;
            $subtotalCents += $priceCents;

            if ($item->coupon && $item->coupon->isValid()) {
                $coupon = $item->coupon;
                if ($coupon->discount_type === 'percentage') {
                    $itemDiscount = (int) round(($priceCents * $coupon->discount_value) / 100);
                } else {
                    $itemDiscount = min($priceCents, $coupon->discount_value);
                }
                $discountCents += $itemDiscount;
            }
        }

        $afterDiscountCents = max(0, $subtotalCents - $discountCents);
        $afterDiscountMoney = Money::fromCents($afterDiscountCents, $currency);

        $taxMoney = $this->taxCalculator->calculateTax($afterDiscountMoney, $countryCode);
        $totalCents = $afterDiscountCents + $taxMoney->amount;

        return [
            'items' => $items,
            'subtotal' => Money::fromCents($subtotalCents, $currency),
            'discount' => Money::fromCents($discountCents, $currency),
            'tax' => $taxMoney,
            'total' => Money::fromCents($totalCents, $currency),
            'currency' => $currency,
        ];
    }
}
