<?php

declare(strict_types=1);

namespace App\Domain\Instructor\Actions;

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\CourseReviewSubmission;
use App\Domain\Instructor\Services\CourseStatusTransitionService;

class ApproveCourseAction
{
    public function __construct(
        protected CourseStatusTransitionService $transitionService
    ) {}

    public function execute(Course $course, User $moderator, ?string $comments = null): CourseReviewSubmission
    {
        $submission = CourseReviewSubmission::query()
            ->where('course_id', $course->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if ($submission) {
            $submission->update([
                'status' => 'approved',
                'reviewed_by' => $moderator->id,
                'feedback_comments' => $comments,
                'reviewed_at' => now(),
            ]);
        }

        $this->transitionService->transition($course, CourseStatus::PUBLISHED);

        return $submission ?? new CourseReviewSubmission();
    }
}
