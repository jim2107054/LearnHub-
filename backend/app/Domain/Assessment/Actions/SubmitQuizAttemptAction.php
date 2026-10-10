<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Actions;

use App\Domain\Assessment\Models\QuizAttempt;
use App\Domain\Assessment\Models\QuizAttemptAnswer;
use App\Domain\Assessment\Models\QuizQuestion;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class SubmitQuizAttemptAction
{
    /**
     * @param  array<string, array{selected_option_ids?: array<int, int>, text_response?: string}>  $submittedAnswers
     * @return array{attempt: QuizAttempt, score_percent: int, is_passed: bool}
     */
    public function execute(QuizAttempt $attempt, array $submittedAnswers): array
    {
        if ($attempt->status === 'submitted') {
            return [
                'attempt' => $attempt,
                'score_percent' => (int) $attempt->score_percent,
                'is_passed' => (bool) $attempt->is_passed,
            ];
        }

        if ($attempt->isExpired()) {
            $attempt->update(['status' => 'expired']);
            throw new HttpException(410, 'Your quiz attempt timer has expired.');
        }

        return DB::transaction(function () use ($attempt, $submittedAnswers) {
            $quiz = $attempt->quiz;
            $quiz->loadMissing(['questions.options']);

            $totalPossiblePoints = (int) $quiz->questions->sum('points');
            $awardedPoints = 0;

            foreach ($quiz->questions as $question) {
                $userAnswer = $submittedAnswers[$question->ulid] ?? null;
                $isCorrect = false;
                $points = 0;

                if ($userAnswer && isset($userAnswer['selected_option_ids'])) {
                    $selectedIds = (array) $userAnswer['selected_option_ids'];
                    $correctOptionIds = $question->options->where('is_correct', true)->pluck('id')->toArray();

                    sort($selectedIds);
                    sort($correctOptionIds);

                    if ($selectedIds === $correctOptionIds) {
                        $isCorrect = true;
                        $points = $question->points;
                        $awardedPoints += $points;
                    }
                }

                QuizAttemptAnswer::query()->updateOrCreate(
                    [
                        'attempt_id' => $attempt->id,
                        'question_id' => $question->id,
                    ],
                    [
                        'selected_option_ids' => $userAnswer['selected_option_ids'] ?? null,
                        'text_response' => $userAnswer['text_response'] ?? null,
                        'is_correct' => $isCorrect,
                        'points_awarded' => $points,
                    ]
                );
            }

            $scorePercent = $totalPossiblePoints > 0
                ? (int) round(($awardedPoints / $totalPossiblePoints) * 100)
                : 0;

            $isPassed = $scorePercent >= $quiz->pass_mark_percent;

            $attempt->update([
                'status' => 'submitted',
                'score_percent' => $scorePercent,
                'is_passed' => $isPassed,
                'submitted_at' => now(),
            ]);

            return [
                'attempt' => $attempt->fresh(),
                'score_percent' => $scorePercent,
                'is_passed' => $isPassed,
            ];
        });
    }
}
