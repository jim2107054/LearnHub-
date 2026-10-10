<?php

declare(strict_types=1);

namespace App\Domain\Instructor\Actions;

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\CourseReviewSubmission;
use App\Domain\Instructor\Services\CourseStatusTransitionService;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SubmitCourseForReviewAction
{
    public function __construct(
        protected ValidateCourseForPublishAction $validator,
        protected CourseStatusTransitionService $transitionService
    ) {}

    public function execute(Course $course, User $instructor): CourseReviewSubmission
    {
        $validationResult = $this->validator->execute($course);

        if (! $validationResult['is_valid']) {
            throw ValidationException::withMessages([
                'course' => ['Your course does not meet the pre-publish quality requirements.'],
                'failures' => collect($validationResult['checklist'])->filter(fn ($c) => ! $c['passed'])->pluck('message')->toArray(),
            ]);
        }

        $this->transitionService->transition($course, CourseStatus::IN_REVIEW);

        return CourseReviewSubmission::query()->create([
            'ulid' => (string) Str::ulid(),
            'course_id' => $course->id,
            'submitted_by' => $instructor->id,
            'status' => 'pending',
        ]);
    }
}
