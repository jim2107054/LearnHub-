<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Http\Resources;

use App\Domain\Catalog\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Course
 */
class CourseCardResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'title' => $this->title,
            'slug' => $this->slug,
            'subtitle' => $this->subtitle,
            'thumbnail_url' => $this->thumbnail_url,
            'price_amount' => $this->price_amount,
            'price_currency' => $this->price_currency,
            'is_free' => $this->isFree(),
            'price' => [
                'amount' => $this->price_amount,
                'currency' => $this->price_currency,
                'formatted' => $this->price->format(),
                'is_free' => $this->isFree(),
            ],
            'rating' => $this->rating_cache,
            'reviews_count' => $this->reviews_count,
            'enrollments_count' => $this->enrollments_count,
            'level' => $this->level->value,
            'duration_seconds' => $this->total_duration_seconds,
            'lectures_count' => $this->lectures_count,
            'category' => $this->category ? [
                'id' => $this->category->ulid,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null,
            'instructor' => $this->primaryInstructor ? [
                'id' => $this->primaryInstructor->ulid,
                'name' => $this->primaryInstructor->name,
                'avatar_url' => $this->primaryInstructor->avatar_url,
            ] : null,
            'is_wishlisted' => $request->user() ? $this->wishlists()->where('user_id', $request->user()->id)->exists() : false,
        ];
    }
}
