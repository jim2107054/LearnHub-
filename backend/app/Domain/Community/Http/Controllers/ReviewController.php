<?php

declare(strict_types=1);

namespace App\Domain\Community\Http\Controllers;

use App\Domain\Catalog\Models\Course;
use App\Domain\Community\Actions\CreateOrUpdateReviewAction;
use App\Domain\Community\Actions\ReplyToReviewAction;
use App\Domain\Community\Models\CourseReview;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ReviewController extends Controller
{
    /**
     * Public course reviews listing with rating distribution (COM-03).
     */
    public function index(string $courseSlug): JsonResponse
    {
        /** @var Course $course */
        $course = Course::query()->where('slug', $courseSlug)->firstOrFail();

        $reviews = CourseReview::query()
            ->where('course_id', $course->id)
            ->with(['user:id,ulid,name,avatar_url'])
            ->latest()
            ->paginate(15);

        // Compute rating distribution (1 to 5 stars)
        $distributionRaw = CourseReview::query()
            ->where('course_id', $course->id)
            ->selectRaw('rating, count(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating')
            ->toArray();

        $totalReviews = (int) $course->reviews_count;
        $distribution = [];
        for ($star = 5; $star >= 1; $star--) {
            $count = (int) ($distributionRaw[$star] ?? 0);
            $distribution[$star] = [
                'count' => $count,
                'percentage' => $totalReviews > 0 ? round(($count / $totalReviews) * 100, 1) : 0,
            ];
        }

        return response()->json([
            'data' => $reviews->items(),
            'meta' => [
                'rating' => $course->rating_cache,
                'total_reviews' => $totalReviews,
                'distribution' => $distribution,
                'pagination' => [
                    'current_page' => $reviews->currentPage(),
                    'last_page' => $reviews->lastPage(),
                    'per_page' => $reviews->perPage(),
                    'total' => $reviews->total(),
                ],
            ],
        ]);
    }

    /**
     * Enrolled learner writes or updates review (COM-01).
     */
    public function store(Request $request, string $courseSlug, CreateOrUpdateReviewAction $action): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'content' => ['nullable', 'string', 'max:5000'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()->where('slug', $courseSlug)->firstOrFail();

        $review = $action->execute($user, $course, $validated);

        return response()->json([
            'data' => $review,
            'message' => 'Your review has been submitted successfully.',
        ], 201);
    }

    /**
     * Enrolled learner deletes their review.
     */
    public function destroy(Request $request, string $reviewUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var CourseReview $review */
        $review = CourseReview::query()
            ->where('ulid', $reviewUlid)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $course = $review->course;
        $review->delete();

        // Recalculate course rating
        $stats = CourseReview::query()
            ->where('course_id', $course->id)
            ->selectRaw('COUNT(*) as total_reviews, AVG(rating) as avg_rating')
            ->first();

        $course->update([
            'reviews_count' => (int) ($stats->total_reviews ?? 0),
            'rating_cache' => round((float) ($stats->avg_rating ?? 0.0), 2),
        ]);

        return response()->json([
            'message' => 'Review deleted successfully.',
        ]);
    }

    /**
     * Course instructor single public reply (COM-02).
     */
    public function reply(Request $request, string $reviewUlid, ReplyToReviewAction $action): JsonResponse
    {
        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:3000'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var CourseReview $review */
        $review = CourseReview::query()
            ->where('ulid', $reviewUlid)
            ->with(['course'])
            ->firstOrFail();

        $updated = $action->execute($user, $review, $validated['reply']);

        return response()->json([
            'data' => $updated,
            'message' => 'Instructor reply posted.',
        ]);
    }
}
