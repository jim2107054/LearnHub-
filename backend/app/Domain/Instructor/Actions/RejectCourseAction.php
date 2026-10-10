<?php

declare(strict_types=1);

namespace App\Domain\Instructor\Actions;

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\CourseReviewSubmission;
use App\Domain\Instructor\Services\CourseStatusTransitionService;

class RejectCourseAction
{
    public function __construct(
        protected CourseStatusTransitionService $transitionService
    ) {}

    /**
     * @param  array<string>  $rejectionReasons
     */
    public function execute(Course $course, User $moderator, string $comments, array $rejectionReasons = []): CourseReviewSubmission
    {
        $submission = CourseReviewSubmission::query()
            ->where('course_id', $course->id)
            ->where('status', 'pending')
            ->latest()
            ->first();

        if ($submission) {
            $submission->update([
                'status' => 'rejected',
                'reviewed_by' => $moderator->id,
                'feedback_comments' => $comments,
                'rejection_reasons' => $rejectionReasons,
                'reviewed_at' => now(),
            ]);
        }

        $this->transitionService->transition($course, CourseStatus::REJECTED);

        return $submission ?? new CourseReviewSubmission();
    }
}
