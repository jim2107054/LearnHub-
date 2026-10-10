<?php

declare(strict_types=1);

namespace App\Domain\Learning\Http\Resources;

use App\Domain\Learning\Models\Enrollment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Enrollment
 */
class EnrollmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'status' => $this->status,
            'progress_percent' => $this->progress_percent,
            'last_accessed_at' => $this->last_accessed_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'course' => [
                'id' => $this->course->ulid,
                'title' => $this->course->title,
                'slug' => $this->course->slug,
                'thumbnail_url' => $this->course->thumbnail_url,
                'instructor' => $this->course->primaryInstructor?->name,
                'total_duration_seconds' => $this->course->total_duration_seconds,
                'lectures_count' => $this->course->lectures_count,
            ],
            'last_accessed_lecture' => $this->lastAccessedLecture ? [
                'id' => $this->lastAccessedLecture->ulid,
                'title' => $this->lastAccessedLecture->title,
                'lecture_type' => $this->lastAccessedLecture->lecture_type->value,
            ] : null,
        ];
    }
}
