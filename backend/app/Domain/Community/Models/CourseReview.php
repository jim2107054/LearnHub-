<?php

declare(strict_types=1);

namespace App\Domain\Community\Models;

use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class CourseReview extends Model
{
    use HasUlids;
    use SoftDeletes;

    public function uniqueIds(): array
    {
        return ['ulid'];
    }

    protected $table = 'course_reviews';

    protected $fillable = [
        'ulid',
        'course_id',
        'user_id',
        'rating',
        'content',
        'instructor_reply',
        'instructor_replied_at',
        'is_verified_purchase',
        'helpful_votes_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'rating' => 'integer',
            'is_verified_purchase' => 'boolean',
            'helpful_votes_count' => 'integer',
            'instructor_replied_at' => 'datetime',
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
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
