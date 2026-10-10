<?php

declare(strict_types=1);

namespace App\Domain\Community\Actions;

use App\Domain\Community\Models\CourseReview;
use App\Domain\Identity\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Validation\ValidationException;

class ReplyToReviewAction
{
    public function execute(User $instructor, CourseReview $review, string $reply): CourseReview
    {
        // 1. Authorize: user must be course instructor
        if ($review->course->primary_instructor_id !== $instructor->id) {
            throw new AuthorizationException('Only the primary course instructor may reply to this review.');
        }

        // 2. Instructors may reply once publicly (COM-02)
        if ($review->instructor_reply !== null) {
            throw ValidationException::withMessages([
                'reply' => ['You have already posted a response to this review.'],
            ]);
        }

        $review->update([
            'instructor_reply' => $reply,
            'instructor_replied_at' => now(),
        ]);

        return $review->fresh();
    }
}
