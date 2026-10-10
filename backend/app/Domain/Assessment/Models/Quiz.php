<?php

declare(strict_types=1);

namespace App\Domain\Assessment\Models;

use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasUlids;

    protected $table = 'quizzes';

    protected $fillable = [
        'ulid',
        'course_id',
        'lecture_id',
        'title',
        'description',
        'pass_mark_percent',
        'max_attempts',
        'time_limit_minutes',
        'is_randomized',
        'show_explanations',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'pass_mark_percent' => 'integer',
            'max_attempts' => 'integer',
            'time_limit_minutes' => 'integer',
            'is_randomized' => 'boolean',
            'show_explanations' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * @return BelongsTo<Lecture, $this>
     */
    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }

    /**
     * @return HasMany<QuizQuestion, $this>
     */
    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<QuizAttempt, $this>
     */
    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }
}
