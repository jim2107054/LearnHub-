<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Models;

use App\Domain\Catalog\Enums\LectureType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lecture extends Model
{
    use HasUlids;

    protected $table = 'lectures';

    protected $fillable = [
        'ulid',
        'section_id',
        'course_id',
        'title',
        'lecture_type',
        'duration_seconds',
        'is_preview',
        'sort_order',
        'content_payload',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'lecture_type' => LectureType::class,
            'duration_seconds' => 'integer',
            'is_preview' => 'boolean',
            'sort_order' => 'integer',
            'content_payload' => 'array',
        ];
    }

    /**
     * @return BelongsTo<Section, $this>
     */
    public function section(): BelongsTo
    {
        return $this->belongsTo(Section::class);
    }

    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
