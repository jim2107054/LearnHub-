<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Enums;

enum LectureType: string
{
    case VIDEO = 'video';
    case ARTICLE = 'article';
    case RESOURCE = 'resource';
    case QUIZ = 'quiz';
    case ASSIGNMENT = 'assignment';
    case EXTERNAL_LINK = 'external_link';

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
