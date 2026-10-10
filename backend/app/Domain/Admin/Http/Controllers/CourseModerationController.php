<?php

declare(strict_types=1);

namespace App\Domain\Admin\Http\Controllers;

use App\Domain\Admin\Actions\ModerateCourseSubmissionAction;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\CourseReviewSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\Rule;

class CourseModerationController extends Controller
{
    /**
     * List course review submissions (ADM-02).
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'submitted');

        $submissions = CourseReviewSubmission::query()
            ->where('status', $status)
            ->with(['course.primaryInstructor', 'course.sections.lectures'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $submissions->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $submissions->currentPage(),
                    'last_page' => $submissions->lastPage(),
                    'per_page' => $submissions->perPage(),
                    'total' => $submissions->total(),
                ],
            ],
        ]);
    }

    /**
     * Approve or reject a course submission.
     */
    public function moderate(Request $request, string $submissionUlid, ModerateCourseSubmissionAction $action): JsonResponse
    {
        $validated = $request->validate([
            'decision' => ['required', 'string', Rule::in(['approved', 'rejected'])],
            'feedback' => ['nullable', 'string', 'max:5000'],
        ]);

        /** @var User $moderator */
        $moderator = $request->user();

        /** @var CourseReviewSubmission $submission */
        $submission = CourseReviewSubmission::query()->where('ulid', $submissionUlid)->firstOrFail();

        $updated = $action->execute($submission, $moderator, $validated['decision'], $validated['feedback'] ?? null);

        return response()->json([
            'data' => $updated,
            'message' => 'Course submission successfully marked as '.$validated['decision'].'.',
        ]);
    }
}
