<?php

declare(strict_types=1);

namespace App\Domain\Learning\Models;

use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LectureProgress extends Model
{
    protected $table = 'lecture_progress';

    protected $fillable = [
        'user_id',
        'lecture_id',
        'course_id',
        'last_position_seconds',
        'is_completed',
        'completed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'last_position_seconds' => 'integer',
            'is_completed' => 'boolean',
            'completed_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Lecture, $this>
     */
    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }

    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}
