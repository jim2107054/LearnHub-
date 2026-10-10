<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Http\Controllers;

use App\Domain\Assessment\Actions\StartQuizAttemptAction;
use App\Domain\Assessment\Actions\SubmitQuizAttemptAction;
use App\Domain\Assessment\Models\Assignment;
use App\Domain\Assessment\Models\AssignmentSubmission;
use App\Domain\Assessment\Models\Quiz;
use App\Domain\Assessment\Models\QuizAttempt;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class AssessmentController extends Controller
{
    public function startQuiz(Request $request, string $quizUlid, StartQuizAttemptAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Quiz $quiz */
        $quiz = Quiz::query()->where('ulid', $quizUlid)->firstOrFail();

        $result = $action->execute($quiz, $user);

        return response()->json([
            'data' => [
                'attempt_id' => $result['attempt']->ulid,
                'status' => $result['attempt']->status,
                'started_at' => $result['attempt']->started_at?->toIso8601String(),
                'expires_at' => $result['attempt']->expires_at?->toIso8601String(),
                'questions' => $result['questions'],
            ],
            'message' => 'Quiz attempt started.',
        ]);
    }

    public function submitQuiz(Request $request, string $attemptUlid, SubmitQuizAttemptAction $action): JsonResponse
    {
        $validated = $request->validate([
            'answers' => ['required', 'array'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var QuizAttempt $attempt */
        $attempt = QuizAttempt::query()
            ->where('ulid', $attemptUlid)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $result = $action->execute($attempt, $validated['answers']);

        return response()->json([
            'data' => [
                'attempt_id' => $result['attempt']->ulid,
                'score_percent' => $result['score_percent'],
                'is_passed' => $result['is_passed'],
                'status' => $result['attempt']->status,
            ],
            'message' => $result['is_passed'] ? 'Congratulations! You passed the quiz.' : 'You did not achieve the required passing score.',
        ]);
    }

    public function submitAssignment(Request $request, string $assignmentUlid): JsonResponse
    {
        $validated = $request->validate([
            'submission_text' => ['nullable', 'string'],
            'attachment_url' => ['nullable', 'url'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var Assignment $assignment */
        $assignment = Assignment::query()->where('ulid', $assignmentUlid)->firstOrFail();

        $submission = AssignmentSubmission::query()->create([
            'ulid' => (string) Str::ulid(),
            'assignment_id' => $assignment->id,
            'user_id' => $user->id,
            'submission_text' => $validated['submission_text'] ?? null,
            'attachment_url' => $validated['attachment_url'] ?? null,
            'status' => 'submitted',
        ]);

        return response()->json([
            'data' => $submission,
            'message' => 'Assignment submitted successfully for review.',
        ], 201);
    }
}
