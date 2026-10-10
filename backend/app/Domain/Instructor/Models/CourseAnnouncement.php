<?php

declare(strict_types=1);

namespace App\Domain\Instructor\Models;

use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseAnnouncement extends Model
{
    use HasUlids;

    protected $table = 'course_announcements';

    protected $fillable = [
        'ulid',
        'course_id',
        'instructor_id',
        'title',
        'body',
    ];

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
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
}
