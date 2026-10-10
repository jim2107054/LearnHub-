<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Enums;

enum OrderStatus: string
{
    case PENDING = 'pending';
    case PAID = 'paid';
    case FAILED = 'failed';
    case REFUNDED = 'refunded';
    case PARTIALLY_REFUNDED = 'partially_refunded';
    case DISPUTED = 'disputed';

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isCompleted(): bool
    {
        return $this === self::PAID;
    }
}
