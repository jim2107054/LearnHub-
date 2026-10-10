<?php

declare(strict_types=1);

namespace App\Domain\Community\Models;

use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QaQuestion extends Model
{
    use HasUlids;

    protected $table = 'qa_questions';

    protected $fillable = [
        'ulid',
        'course_id',
        'lecture_id',
        'user_id',
        'title',
        'body',
        'upvotes_count',
        'answers_count',
        'is_solved',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'upvotes_count' => 'integer',
            'answers_count' => 'integer',
            'is_solved' => 'boolean',
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
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<QaAnswer, $this>
     */
    public function answers(): HasMany
    {
        return $this->hasMany(QaAnswer::class, 'question_id');
    }
}
