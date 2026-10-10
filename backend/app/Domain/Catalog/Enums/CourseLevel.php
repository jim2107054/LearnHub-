<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Enums;

enum CourseLevel: string
{
    case ALL_LEVELS = 'all_levels';
    case BEGINNER = 'beginner';
    case INTERMEDIATE = 'intermediate';
    case ADVANCED = 'advanced';

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
