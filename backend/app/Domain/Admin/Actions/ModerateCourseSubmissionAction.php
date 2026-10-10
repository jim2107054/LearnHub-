<?php

declare(strict_types=1);

namespace App\Domain\Admin\Actions;

use App\Domain\Admin\Models\AuditLog;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\CourseReviewSubmission;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ModerateCourseSubmissionAction
{
    public function execute(CourseReviewSubmission $submission, User $moderator, string $decision, ?string $feedback = null): CourseReviewSubmission
    {
        return DB::transaction(function () use ($submission, $moderator, $decision, $feedback) {
            $course = $submission->course;

            if ($decision === 'approved') {
                $submission->update([
                    'status' => 'approved',
                    'reviewer_notes' => $feedback,
                    'reviewed_at' => now(),
                ]);

                $course->update([
                    'status' => CourseStatus::PUBLISHED,
                    'published_at' => now(),
                ]);
            } else {
                $submission->update([
                    'status' => 'rejected',
                    'reviewer_notes' => $feedback,
                    'reviewed_at' => now(),
                ]);

                $course->update([
                    'status' => CourseStatus::DRAFT,
                ]);
            }

            // Log audit
            AuditLog::query()->create([
                'id' => (string) Str::ulid(),
                'user_id' => $moderator->id,
                'action' => 'course.moderate.'.$decision,
                'auditable_type' => get_class($course),
                'auditable_id' => (string) $course->id,
                'new_values' => ['decision' => $decision, 'feedback' => $feedback],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'correlation_id' => request()->header('X-Correlation-ID', (string) Str::uuid()),
                'created_at' => now(),
            ]);

            return $submission->fresh(['course']);
        });
    }
}
