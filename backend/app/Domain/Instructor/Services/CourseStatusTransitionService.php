<?php

declare(strict_types=1);

namespace App\Domain\Instructor\Services;

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use Illuminate\Validation\ValidationException;

class CourseStatusTransitionService
{
    /**
     * Permitted state transitions map.
     *
     * @var array<string, array<string>>
     */
    protected array $allowedTransitions = [
        CourseStatus::DRAFT->value => [
            CourseStatus::IN_REVIEW->value,
            CourseStatus::ARCHIVED->value,
        ],
        CourseStatus::IN_REVIEW->value => [
            CourseStatus::APPROVED->value,
            CourseStatus::REJECTED->value,
            CourseStatus::DRAFT->value,
        ],
        CourseStatus::APPROVED->value => [
            CourseStatus::PUBLISHED->value,
            CourseStatus::DRAFT->value,
        ],
        CourseStatus::REJECTED->value => [
            CourseStatus::DRAFT->value,
            CourseStatus::IN_REVIEW->value,
        ],
        CourseStatus::PUBLISHED->value => [
            CourseStatus::DRAFT->value, // Unpublish
            CourseStatus::ARCHIVED->value,
        ],
        CourseStatus::ARCHIVED->value => [
            CourseStatus::DRAFT->value,
        ],
    ];

    public function transition(Course $course, CourseStatus $newStatus): void
    {
        $current = $course->status->value;
        $target = $newStatus->value;

        if ($current === $target) {
            return;
        }

        $allowed = $this->allowedTransitions[$current] ?? [];

        if (! in_array($target, $allowed, true)) {
            throw ValidationException::withMessages([
                'status' => [
                    sprintf('Illegal course status transition from [%s] to [%s].', $current, $target),
                ],
            ]);
        }

        $updates = ['status' => $newStatus];

        if ($newStatus === CourseStatus::PUBLISHED && $course->published_at === null) {
            $updates['published_at'] = now();
        }

        $course->update($updates);
    }
}
