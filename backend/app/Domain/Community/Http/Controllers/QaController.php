<?php

declare(strict_types=1);

namespace App\Domain\Community\Http\Controllers;

use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Community\Actions\ToggleUpvoteAction;
use App\Domain\Community\Models\QaAnswer;
use App\Domain\Community\Models\QaQuestion;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class QaController extends Controller
{
    /**
     * List questions for a course (optionally filtered by lecture).
     */
    public function questions(Request $request, string $courseSlug): JsonResponse
    {
        /** @var Course $course */
        $course = Course::query()->where('slug', $courseSlug)->firstOrFail();

        $query = QaQuestion::query()
            ->where('course_id', $course->id)
            ->with(['user:id,ulid,name,avatar_url', 'lecture:id,ulid,title']);

        if ($request->filled('lecture_id')) {
            $lecture = Lecture::query()->where('ulid', $request->query('lecture_id'))->first();
            if ($lecture) {
                $query->where('lecture_id', $lecture->id);
            }
        }

        if ($request->query('sort') === 'popular') {
            $query->orderByDesc('upvotes_count');
        } else {
            $query->latest();
        }

        $questions = $query->paginate(15);

        return response()->json([
            'data' => $questions->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $questions->currentPage(),
                    'last_page' => $questions->lastPage(),
                    'per_page' => $questions->perPage(),
                    'total' => $questions->total(),
                ],
            ],
        ]);
    }

    /**
     * Post a new question.
     */
    public function storeQuestion(Request $request, string $courseSlug): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'lecture_id' => ['nullable', 'string'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()->where('slug', $courseSlug)->firstOrFail();

        $lectureId = null;
        if (! empty($validated['lecture_id'])) {
            $lecture = Lecture::query()->where('ulid', $validated['lecture_id'])->first();
            $lectureId = $lecture?->id;
        }

        $question = QaQuestion::query()->create([
            'ulid' => (string) Str::ulid(),
            'course_id' => $course->id,
            'lecture_id' => $lectureId,
            'user_id' => $user->id,
            'title' => $validated['title'],
            'body' => $validated['body'],
        ]);

        return response()->json([
            'data' => $question->load(['user:id,ulid,name,avatar_url']),
            'message' => 'Question submitted successfully.',
        ], 201);
    }

    /**
     * List answers for a question.
     */
    public function answers(string $questionUlid): JsonResponse
    {
        /** @var QaQuestion $question */
        $question = QaQuestion::query()->where('ulid', $questionUlid)->firstOrFail();

        $answers = QaAnswer::query()
            ->where('question_id', $question->id)
            ->with(['user:id,ulid,name,avatar_url'])
            ->orderByDesc('is_best_answer')
            ->orderByDesc('upvotes_count')
            ->oldest()
            ->get();

        return response()->json([
            'data' => $answers,
        ]);
    }

    /**
     * Post an answer to a question.
     */
    public function storeAnswer(Request $request, string $questionUlid): JsonResponse
    {
        $validated = $request->validate([
            'body' => ['required', 'string', 'max:10000'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var QaQuestion $question */
        $question = QaQuestion::query()->where('ulid', $questionUlid)->with(['course'])->firstOrFail();

        $isInstructorReply = $question->course->primary_instructor_id === $user->id;

        $answer = QaAnswer::query()->create([
            'ulid' => (string) Str::ulid(),
            'question_id' => $question->id,
            'user_id' => $user->id,
            'body' => $validated['body'],
            'is_instructor_reply' => $isInstructorReply,
        ]);

        $question->increment('answers_count');

        return response()->json([
            'data' => $answer->load(['user:id,ulid,name,avatar_url']),
            'message' => 'Answer submitted.',
        ], 201);
    }

    /**
     * Mark an answer as the best answer (COM-04).
     */
    public function markBestAnswer(Request $request, string $answerUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var QaAnswer $answer */
        $answer = QaAnswer::query()->where('ulid', $answerUlid)->with(['question.course'])->firstOrFail();
        $question = $answer->question;

        // Only the question creator or the course instructor can mark best answer
        if ($question->user_id !== $user->id && $question->course->primary_instructor_id !== $user->id) {
            return response()->json([
                'error' => [
                    'code' => 'forbidden',
                    'message' => 'Only the question author or course instructor may select the best answer.',
                ],
            ], 403);
        }

        // Reset previous best answer if any
        QaAnswer::query()->where('question_id', $question->id)->update(['is_best_answer' => false]);

        $answer->update(['is_best_answer' => true]);
        $question->update(['is_solved' => true]);

        return response()->json([
            'data' => $answer->fresh(),
            'message' => 'Marked as best answer.',
        ]);
    }

    /**
     * Upvote/un-upvote a question.
     */
    public function upvoteQuestion(Request $request, string $questionUlid, ToggleUpvoteAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var QaQuestion $question */
        $question = QaQuestion::query()->where('ulid', $questionUlid)->firstOrFail();

        $result = $action->execute($user, $question);

        return response()->json([
            'data' => $result,
        ]);
    }

    /**
     * Upvote/un-upvote an answer.
     */
    public function upvoteAnswer(Request $request, string $answerUlid, ToggleUpvoteAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var QaAnswer $answer */
        $answer = QaAnswer::query()->where('ulid', $answerUlid)->firstOrFail();

        $result = $action->execute($user, $answer);

        return response()->json([
            'data' => $result,
        ]);
    }
}
