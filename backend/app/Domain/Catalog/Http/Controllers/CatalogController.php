<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Http\Controllers;

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Http\Resources\CourseCardResource;
use App\Domain\Catalog\Http\Resources\CourseDetailResource;
use App\Domain\Catalog\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\QueryBuilder;

class CatalogController extends Controller
{
    /**
     * Home page storefront rails (Featured, Trending, Newest).
     */
    public function home(): JsonResponse
    {
        $featured = Course::query()
            ->published()
            ->with(['category', 'primaryInstructor'])
            ->where('is_featured', true)
            ->limit(8)
            ->get();

        $trending = Course::query()
            ->published()
            ->with(['category', 'primaryInstructor'])
            ->where('is_trending', true)
            ->orderByDesc('enrollments_count')
            ->limit(8)
            ->get();

        $newest = Course::query()
            ->published()
            ->with(['category', 'primaryInstructor'])
            ->orderByDesc('published_at')
            ->limit(8)
            ->get();

        return response()->json([
            'data' => [
                'featured' => CourseCardResource::collection($featured),
                'trending' => CourseCardResource::collection($trending),
                'newest' => CourseCardResource::collection($newest),
            ],
        ]);
    }

    /**
     * Search and filter course catalog.
     */
    public function index(Request $request): JsonResponse
    {
        $query = QueryBuilder::for(Course::query()->published()->with(['category', 'primaryInstructor']))
            ->allowedFilters([
                AllowedFilter::exact('level'),
                AllowedFilter::exact('language'),
                AllowedFilter::scope('price_type', 'filterPriceType'),
                AllowedFilter::callback('category', function ($query, $value) {
                    $query->whereHas('category', fn ($q) => $q->where('slug', $value));
                }),
                AllowedFilter::callback('rating', function ($query, $value) {
                    $query->where('rating_cache', '>=', (float) $value);
                }),
                AllowedFilter::callback('search', function ($query, $value) {
                    $query->where(function ($q) use ($value) {
                        $q->where('title', 'like', "%{$value}%")
                            ->orWhere('subtitle', 'like', "%{$value}%");
                    });
                }),
            ])
            ->allowedSorts(['published_at', 'rating_cache', 'enrollments_count', 'price_amount'])
            ->defaultSort('-published_at');

        $courses = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'data' => CourseCardResource::collection($courses->items()),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
            ],
        ]);
    }

    /**
     * Get detailed course page outline and metadata by slug.
     */
    public function show(string $slug): JsonResponse
    {
        /** @var Course $course */
        $course = Course::query()
            ->published()
            ->with([
                'category',
                'primaryInstructor',
                'sections.lectures',
                'tags',
            ])
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'data' => new CourseDetailResource($course),
        ]);
    }

    /**
     * Retrieve related courses in the same category.
     */
    public function related(string $slug): JsonResponse
    {
        /** @var Course $course */
        $course = Course::query()
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        $related = Course::query()
            ->published()
            ->with(['category', 'primaryInstructor'])
            ->where('category_id', $course->category_id)
            ->where('id', '!=', $course->id)
            ->limit(4)
            ->get();

        return response()->json([
            'data' => CourseCardResource::collection($related),
        ]);
    }

    /**
     * Fast debounced autocomplete search suggestions.
     */
    public function autocomplete(Request $request): JsonResponse
    {
        $term = trim($request->string('q')->toString());

        if (strlen($term) < 2) {
            return response()->json(['data' => []]);
        }

        $suggestions = Course::query()
            ->published()
            ->where('title', 'like', "%{$term}%")
            ->select(['id', 'ulid', 'title', 'slug', 'thumbnail_url'])
            ->limit(6)
            ->get()
            ->map(fn ($c) => [
                'id' => $c->ulid,
                'title' => $c->title,
                'slug' => $c->slug,
                'thumbnail_url' => $c->thumbnail_url,
            ]);

        return response()->json([
            'data' => $suggestions,
        ]);
    }
}
