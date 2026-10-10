<?php

declare(strict_types=1);

namespace App\Domain\Community\Actions;

use App\Domain\Catalog\Models\Course;
use App\Domain\Community\Models\CourseReview;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Models\Enrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateOrUpdateReviewAction
{
    /**
     * @param  array{rating: int, content?: ?string}  $data
     */
    public function execute(User $user, Course $course, array $data): CourseReview
    {
        // 1. Verify enrollment and progress >= 10% (COM-01)
        /** @var Enrollment|null $enrollment */
        $enrollment = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (! $enrollment) {
            throw ValidationException::withMessages([
                'course' => ['You must be enrolled in this course to leave a review.'],
            ]);
        }

        if ($enrollment->progress_percent < 10) {
            throw ValidationException::withMessages([
                'progress' => ['You must complete at least 10% of the course content before leaving a review.'],
            ]);
        }

        return DB::transaction(function () use ($user, $course, $data) {
            /** @var CourseReview $review */
            $review = CourseReview::query()->updateOrCreate(
                [
                    'course_id' => $course->id,
                    'user_id' => $user->id,
                ],
                [
                    'ulid' => (string) Str::ulid(),
                    'rating' => $data['rating'],
                    'content' => $data['content'] ?? null,
                    'is_verified_purchase' => true,
                ]
            );

            // 2. Denormalize rating and review count onto course
            $stats = CourseReview::query()
                ->where('course_id', $course->id)
                ->selectRaw('COUNT(*) as total_reviews, AVG(rating) as avg_rating')
                ->first();

            $totalReviews = (int) ($stats->total_reviews ?? 0);
            $avgRating = round((float) ($stats->avg_rating ?? 0.0), 2);

            $course->update([
                'reviews_count' => $totalReviews,
                'rating_cache' => $avgRating,
            ]);

            return $review;
        });
    }
}
