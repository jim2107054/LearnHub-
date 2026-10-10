<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Http\Resources;

use App\Domain\Catalog\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

/**
 * @mixin Course
 */
class CourseDetailResource extends JsonResource
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
            'description' => $this->description,
            'level' => $this->level->value,
            'language' => $this->language,
            'price_amount' => $this->price_amount,
            'price_currency' => $this->price_currency,
            'is_free' => $this->isFree(),
            'price' => [
                'amount' => $this->price_amount,
                'currency' => $this->price_currency,
                'formatted' => $this->price->format(),
                'is_free' => $this->isFree(),
            ],
            'thumbnail_url' => $this->thumbnail_url,
            'promo_video_url' => $this->promo_video_url,
            'requirements' => $this->requirements ?? [],
            'what_you_will_learn' => $this->what_you_will_learn ?? [],
            'rating' => $this->rating_cache,
            'reviews_count' => $this->reviews_count,
            'enrollments_count' => $this->enrollments_count,
            'total_duration_seconds' => $this->total_duration_seconds,
            'lectures_count' => $this->lectures_count,
            'category' => $this->category ? [
                'id' => $this->category->ulid,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ] : null,
            'instructor' => $this->primaryInstructor ? [
                'id' => $this->primaryInstructor->ulid,
                'name' => $this->primaryInstructor->name,
                'headline' => $this->primaryInstructor->headline,
                'bio' => $this->primaryInstructor->bio,
                'avatar_url' => $this->primaryInstructor->avatar_url,
            ] : null,
            'sections' => SectionResource::collection($this->whenLoaded('sections')),
            'tags' => $this->tags->pluck('name')->toArray(),
            'is_wishlisted' => $request->user() ? $this->wishlists()->where('user_id', $request->user()->id)->exists() : false,
            'published_at' => $this->published_at?->toIso8601String(),
            'seo' => [
                'meta_title' => $this->title.' | LearnHub',
                'meta_description' => $this->subtitle ?: Str::limit(strip_tags((string) $this->description), 160),
                'canonical_url' => url('/courses/'.$this->slug),
                'json_ld' => [
                    '@context' => 'https://schema.org',
                    '@type' => 'Course',
                    'name' => $this->title,
                    'description' => $this->subtitle ?: Str::limit(strip_tags((string) $this->description), 160),
                    'provider' => [
                        '@type' => 'Organization',
                        'name' => 'LearnHub',
                        'sameAs' => config('app.url'),
                    ],
                    'aggregateRating' => $this->reviews_count > 0 ? [
                        '@type' => 'AggregateRating',
                        'ratingValue' => (string) $this->rating_cache,
                        'reviewCount' => (string) $this->reviews_count,
                    ] : null,
                    'offers' => [
                        '@type' => 'Offer',
                        'price' => (string) ($this->price_amount / 100),
                        'priceCurrency' => $this->price_currency,
                        'category' => $this->isFree() ? 'Free' : 'Paid',
                    ],
                ],
            ],
        ];
    }
}
