<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Models;

use App\Infrastructure\Support\Concerns\HasUlidField;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model
{
    use HasUlidField;

    protected $table = 'sections';

    protected $fillable = [
        'ulid',
        'course_id',
        'title',
        'sort_order',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
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
     * @return HasMany<Lecture, $this>
     */
    public function lectures(): HasMany
    {
        return $this->hasMany(Lecture::class)->orderBy('sort_order');
    }
}
