<?php

declare(strict_types=1);

namespace App\Domain\Finance\Actions;

use App\Domain\Commerce\Models\OrderItem;

class CalculateRevenueShareAction
{
    /**
     * Calculate instructor vs platform revenue share (EAR-01).
     *
     * @return array{revenue_share_percent: int, gross_amount: int, platform_fee_amount: int, net_earnings_amount: int, source_type: string}
     */
    public function execute(OrderItem $item, bool $isInstructorReferred = false): array
    {
        $gross = (int) $item->price_amount;

        // Model: 97% for instructor-referred / coupon sales, 37% for platform-sourced sales
        if ($isInstructorReferred) {
            $sharePercent = 97;
            $sourceType = 'instructor_coupon';
        } else {
            $sharePercent = 37;
            $sourceType = 'platform_organic';
        }

        $netEarnings = (int) round(($gross * $sharePercent) / 100);
        $platformFee = $gross - $netEarnings;

        return [
            'revenue_share_percent' => $sharePercent,
            'gross_amount' => $gross,
            'platform_fee_amount' => $platformFee,
            'net_earnings_amount' => $netEarnings,
            'source_type' => $sourceType,
        ];
    }
}
