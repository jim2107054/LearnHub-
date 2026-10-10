<?php

declare(strict_types=1);

namespace App\Domain\Identity\Enums;

enum UserRole: string
{
    case LEARNER = 'learner';
    case INSTRUCTOR = 'instructor';
    case TA = 'ta';
    case MODERATOR = 'moderator';
    case SUPPORT = 'support';
    case FINANCE = 'finance';
    case SUPER_ADMIN = 'super_admin';

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function requiresMfa(): bool
    {
        return match ($this) {
            self::SUPER_ADMIN, self::FINANCE => true,
            default => false,
        };
    }
}
