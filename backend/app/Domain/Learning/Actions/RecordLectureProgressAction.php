<?php

declare(strict_types=1);

namespace App\Domain\Learning\Actions;

use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Events\CourseCompleted;
use App\Domain\Learning\Events\LectureCompleted;
use App\Domain\Learning\Models\Enrollment;
use App\Domain\Learning\Models\LectureProgress;
use Illuminate\Support\Facades\DB;

class RecordLectureProgressAction
{
    /**
     * @return array{progress: LectureProgress, course_percent: int}
     */
    public function execute(
        User $user,
        Course $course,
        Lecture $lecture,
        int $positionSeconds,
        bool $manualComplete = false
    ): array {
        return DB::transaction(function () use ($user, $course, $lecture, $positionSeconds, $manualComplete) {
            /** @var LectureProgress $progress */
            $progress = LectureProgress::query()->firstOrNew([
                'user_id' => $user->id,
                'lecture_id' => $lecture->id,
            ], [
                'course_id' => $course->id,
            ]);

            $progress->last_position_seconds = $positionSeconds;

            // 90% watch threshold completion rule
            $duration = $lecture->duration_seconds;
            $wasAlreadyCompleted = (bool) $progress->is_completed;
            $shouldComplete = $manualComplete || ($duration > 0 && $positionSeconds >= (int) floor($duration * 0.90));

            if (! $wasAlreadyCompleted && $shouldComplete) {
                $progress->is_completed = true;
                $progress->completed_at = now();

                event(new LectureCompleted($user, $lecture));
            }

            $progress->save();

            // Recompute overall course progress
            $totalLectures = (int) $course->lectures()->count();
            $completedLectures = (int) LectureProgress::query()
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->where('is_completed', true)
                ->count();

            $coursePercent = $totalLectures > 0
                ? (int) min(100, round(($completedLectures / $totalLectures) * 100))
                : 0;

            /** @var Enrollment|null $enrollment */
            $enrollment = Enrollment::query()
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if ($enrollment) {
                $enrollment->update([
                    'progress_percent' => $coursePercent,
                    'last_accessed_lecture_id' => $lecture->id,
                    'last_accessed_at' => now(),
                    'status' => $coursePercent >= 100 ? 'completed' : 'active',
                    'completed_at' => $coursePercent >= 100 && ! $enrollment->completed_at ? now() : $enrollment->completed_at,
                ]);

                if ($coursePercent >= 100 && ! $wasAlreadyCompleted) {
                    event(new CourseCompleted($user, $course, $enrollment));
                }
            }

            return [
                'progress' => $progress,
                'course_percent' => $coursePercent,
            ];
        });
    }
}
