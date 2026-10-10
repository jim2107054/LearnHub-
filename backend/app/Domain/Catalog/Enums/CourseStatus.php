<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Enums;

enum CourseStatus: string
{
    case DRAFT = 'draft';
    case IN_REVIEW = 'in_review';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case PUBLISHED = 'published';
    case ARCHIVED = 'archived';

    /**
     * @return array<string>
     */
    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    public function isPubliclyVisible(): bool
    {
        return $this === self::PUBLISHED;
    }

    public function canBeEdited(): bool
    {
        return in_array($this, [self::DRAFT, self::REJECTED, self::PUBLISHED], true);
    }
}
