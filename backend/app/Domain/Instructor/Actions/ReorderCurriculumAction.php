<?php

declare(strict_types=1);

namespace App\Domain\Instructor\Actions;

use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Catalog\Models\Section;
use Illuminate\Support\Facades\DB;

class ReorderCurriculumAction
{
    /**
     * @param  array<int, array{id: string, lectures: array<int, string>}>  $orderedStructure
     */
    public function execute(Course $course, array $orderedStructure): void
    {
        DB::transaction(function () use ($course, $orderedStructure) {
            foreach ($orderedStructure as $sectionIndex => $sectionData) {
                $sectionUlid = $sectionData['id'];

                /** @var Section|null $section */
                $section = Section::query()
                    ->where('course_id', $course->id)
                    ->where('ulid', $sectionUlid)
                    ->first();

                if ($section) {
                    $section->update(['sort_order' => $sectionIndex + 1]);

                    if (isset($sectionData['lectures']) && is_array($sectionData['lectures'])) {
                        foreach ($sectionData['lectures'] as $lectureIndex => $lectureUlid) {
                            Lecture::query()
                                ->where('course_id', $course->id)
                                ->where('ulid', $lectureUlid)
                                ->update([
                                    'section_id' => $section->id,
                                    'sort_order' => $lectureIndex + 1,
                                ]);
                        }
                    }
                }
            }
        });
    }
}
