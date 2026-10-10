<?php

declare(strict_types=1);

namespace App\Domain\Identity\Enums;

enum AccountStatus: string
{
    case ACTIVE = 'active';
    case DEACTIVATED = 'deactivated';
    case SUSPENDED = 'suspended';
    case BANNED = 'banned';
    case DELETION_PENDING = 'deletion_pending';

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function canLogin(): bool
    {
        return $this === self::ACTIVE;
    }
}
