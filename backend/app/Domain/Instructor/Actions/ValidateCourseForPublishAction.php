<?php

declare(strict_types=1);

namespace App\Domain\Instructor\Actions;

use App\Domain\Catalog\Models\Course;

class ValidateCourseForPublishAction
{
    /**
     * Pre-publish validation checklist (BR-03, INS-10).
     *
     * @return array{is_valid: bool, checklist: array<string, array{label: string, passed: bool, message: string}>}
     */
    public function execute(Course $course): array
    {
        $course->loadMissing(['sections.lectures']);

        $totalLectures = $course->sections->flatMap->lectures->count();
        $totalDuration = $course->sections->flatMap->lectures->sum('duration_seconds');
        $objectivesCount = is_array($course->what_you_will_learn) ? count($course->what_you_will_learn) : 0;

        $checklist = [
            'has_sections' => [
                'label' => 'At least 1 curriculum section',
                'passed' => $course->sections->count() >= 1,
                'message' => 'Your course must have at least one section.',
            ],
            'has_minimum_lectures' => [
                'label' => 'At least 5 published lectures',
                'passed' => $totalLectures >= 5,
                'message' => sprintf('Your course has %d lectures (minimum 5 required).', $totalLectures),
            ],
            'has_minimum_video_duration' => [
                'label' => 'At least 30 minutes of video content',
                'passed' => $totalDuration >= 1800,
                'message' => sprintf('Total duration is %d minutes (minimum 30 minutes required).', (int) ($totalDuration / 60)),
            ],
            'has_thumbnail' => [
                'label' => 'Course promotional thumbnail',
                'passed' => ! empty($course->thumbnail_url),
                'message' => 'A course thumbnail image is required.',
            ],
            'has_subtitle' => [
                'label' => 'Course subtitle / tagline',
                'passed' => ! empty($course->subtitle),
                'message' => 'A compelling subtitle is required.',
            ],
            'has_learning_objectives' => [
                'label' => 'At least 4 learning objectives',
                'passed' => $objectivesCount >= 4,
                'message' => sprintf('You have defined %d objectives (minimum 4 required).', $objectivesCount),
            ],
        ];

        $isValid = collect($checklist)->every(fn ($item) => $item['passed']);

        return [
            'is_valid' => $isValid,
            'checklist' => $checklist,
        ];
    }
}
