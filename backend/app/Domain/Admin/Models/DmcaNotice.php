<?php

declare(strict_types=1);

namespace App\Domain\Admin\Models;

use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DmcaNotice extends Model
{
    use HasUlids;

    protected $table = 'dmca_notices';

    protected $fillable = [
        'ulid',
        'course_id',
        'instructor_id',
        'claimant_name',
        'claimant_email',
        'infringing_work_url',
        'status',
        'strike_applied',
        'notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'strike_applied' => 'boolean',
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
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
}
