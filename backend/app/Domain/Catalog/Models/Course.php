<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Models;

use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Identity\Models\User;
use App\Infrastructure\Support\ValueObjects\Money;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable;

class Course extends Model
{
    use HasUlids;
    use Searchable;
    use SoftDeletes;

    protected $table = 'courses';

    protected $fillable = [
        'ulid',
        'category_id',
        'primary_instructor_id',
        'title',
        'slug',
        'subtitle',
        'description',
        'level',
        'language',
        'price_amount',
        'price_currency',
        'thumbnail_url',
        'promo_video_url',
        'status',
        'requirements',
        'what_you_will_learn',
        'rating_cache',
        'reviews_count',
        'enrollments_count',
        'total_duration_seconds',
        'lectures_count',
        'is_featured',
        'is_trending',
        'published_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'level' => CourseLevel::class,
            'status' => CourseStatus::class,
            'requirements' => 'array',
            'what_you_will_learn' => 'array',
            'rating_cache' => 'float',
            'reviews_count' => 'integer',
            'enrollments_count' => 'integer',
            'total_duration_seconds' => 'integer',
            'lectures_count' => 'integer',
            'is_featured' => 'boolean',
            'is_trending' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function getPriceAttribute(): Money
    {
        return Money::fromCents($this->price_amount, $this->price_currency);
    }

    public function isFree(): bool
    {
        return $this->price_amount === 0;
    }

    /**
     * @return BelongsTo<Category, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function primaryInstructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'primary_instructor_id');
    }

    /**
     * @return HasMany<Section, $this>
     */
    public function sections(): HasMany
    {
        return $this->hasMany(Section::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<Lecture, $this>
     */
    public function lectures(): HasMany
    {
        return $this->hasMany(Lecture::class)->orderBy('sort_order');
    }

    /**
     * @return HasMany<CourseInstructor, $this>
     */
    public function coInstructors(): HasMany
    {
        return $this->hasMany(CourseInstructor::class);
    }

    /**
     * @return BelongsToMany<Tag, $this>
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'course_tag');
    }

    /**
     * Scope for published visible courses.
     *
     * @param  Builder<$this>  $query
     */
    public function scopePublished(Builder $query): void
    {
        $query->where('status', CourseStatus::PUBLISHED->value);
    }

    /**
     * Searchable representation for Laravel Scout / Meilisearch.
     *
     * @return array<string, mixed>
     */
    public function toSearchableArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => strip_tags($this->description ?? ''),
            'category' => $this->category?->name,
            'instructor' => $this->primaryInstructor?->name,
            'level' => $this->level->value,
            'language' => $this->language,
            'price_amount' => $this->price_amount,
            'rating' => $this->rating_cache,
            'tags' => $this->tags->pluck('name')->toArray(),
        ];
    }
}
