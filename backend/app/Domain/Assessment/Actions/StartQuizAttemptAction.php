<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Actions;

use App\Domain\Assessment\Models\Quiz;
use App\Domain\Assessment\Models\QuizAttempt;
use App\Domain\Identity\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StartQuizAttemptAction
{
    /**
     * @return array{attempt: QuizAttempt, questions: array<int, mixed>}
     */
    public function execute(Quiz $quiz, User $user): array
    {
        // 1. Check max attempts
        if ($quiz->max_attempts !== null) {
            $pastAttemptsCount = QuizAttempt::query()
                ->where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->where('status', 'submitted')
                ->count();

            if ($pastAttemptsCount >= $quiz->max_attempts) {
                throw ValidationException::withMessages([
                    'quiz' => [sprintf('You have exhausted the maximum limit of %d attempts for this quiz.', $quiz->max_attempts)],
                ]);
            }
        }

        // 2. Check for active unsubmitted attempt
        /** @var QuizAttempt|null $activeAttempt */
        $activeAttempt = QuizAttempt::query()
            ->where('quiz_id', $quiz->id)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if ($activeAttempt && ! $activeAttempt->isExpired()) {
            $attempt = $activeAttempt;
        } else {
            $expiresAt = $quiz->time_limit_minutes ? now()->addMinutes($quiz->time_limit_minutes) : null;

            $attempt = QuizAttempt::query()->create([
                'ulid' => (string) Str::ulid(),
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
                'status' => 'in_progress',
                'started_at' => now(),
                'expires_at' => $expiresAt,
            ]);
        }

        // 3. Load questions and strip correctness answers
        $quiz->loadMissing(['questions.options']);
        $questions = $quiz->questions;

        if ($quiz->is_randomized) {
            $questions = $questions->shuffle();
        }

        $sanitizedQuestions = $questions->map(function ($q) {
            return [
                'id' => $q->ulid,
                'prompt' => $q->prompt,
                'question_type' => $q->question_type,
                'points' => $q->points,
                'options' => $q->options->map(fn ($opt) => [
                    'id' => $opt->id,
                    'text' => $opt->option_text,
                ]),
            ];
        })->toArray();

        return [
            'attempt' => $attempt,
            'questions' => $sanitizedQuestions,
        ];
    }
}
