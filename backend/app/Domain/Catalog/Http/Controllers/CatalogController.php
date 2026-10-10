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
        $query = Course::query()
            ->published()
            ->with(['category', 'primaryInstructor', 'tags']);

        // 1. Text Search (title, subtitle, description)
        $search = $request->input('q') ?? $request->input('filter.search') ?? $request->input('search');
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $driver = $q->getConnection()->getDriverName();
                $like = $driver === 'pgsql' ? 'ilike' : 'like';
                $q->where('title', $like, "%{$search}%")
                    ->orWhere('subtitle', $like, "%{$search}%")
                    ->orWhere('description', $like, "%{$search}%");
            });
        }

        // 2. Category Filter (slug, ULID, or partial name match)
        $category = $request->input('category') ?? $request->input('filter.category');
        if (! empty($category)) {
            $query->whereHas('category', function ($q) use ($category, $like) {
                $q->where('slug', $category)
                    ->orWhere('ulid', $category)
                    ->orWhere('slug', $like, "%{$category}%")
                    ->orWhere('name', $like, "%{$category}%");
            });
        }

        // 3. Level Filter
        $level = $request->input('level') ?? $request->input('filter.level');
        if (! empty($level) && $level !== 'all_levels') {
            $query->where('level', $level);
        }

        // 4. Rating Filter
        $rating = $request->input('rating') ?? $request->input('filter.rating');
        if (! empty($rating)) {
            $query->where('rating_cache', '>=', (float) $rating);
        }

        // 5. Price Filter (free, paid)
        $price = $request->input('price') ?? $request->input('filter.price') ?? $request->input('filter.price_type');
        if ($price === 'free') {
            $query->where('price_amount', 0);
        } elseif ($price === 'paid') {
            $query->where('price_amount', '>', 0);
        }

        // 6. Sorting
        $sort = $request->input('sort', 'most_popular');
        match ($sort) {
            'most_popular', '-enrollments_count', 'popular' => $query->orderByDesc('enrollments_count'),
            'highest_rated', '-rating_cache', '-rating', 'rating' => $query->orderByDesc('rating_cache'),
            'newest', '-published_at', '-created_at', 'recent' => $query->orderByDesc('published_at'),
            'price_low_to_high', 'price_amount', 'price', 'price_asc' => $query->orderBy('price_amount'),
            'price_high_to_low', '-price_amount', '-price', 'price_desc' => $query->orderByDesc('price_amount'),
            default => $query->orderByDesc('enrollments_count'),
        };

        $courses = $query->paginate($request->integer('per_page', 12));

        return response()->json([
            'data' => CourseCardResource::collection($courses->items()),
            'meta' => [
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
                'per_page' => $courses->perPage(),
                'total' => $courses->total(),
                'pagination' => [
                    'current_page' => $courses->currentPage(),
                    'last_page' => $courses->lastPage(),
                    'per_page' => $courses->perPage(),
                    'total' => $courses->total(),
                ],
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
            return response()->json([
                'data' => [
                    'courses' => [],
                    'categories' => [],
                ],
            ]);
        }

        $driver = Course::query()->getConnection()->getDriverName();
        $like = $driver === 'pgsql' ? 'ilike' : 'like';

        $courses = Course::query()
            ->published()
            ->with(['category', 'primaryInstructor'])
            ->where(function ($q) use ($term, $like) {
                $q->where('title', $like, "%{$term}%")
                    ->orWhere('subtitle', $like, "%{$term}%");
            })
            ->limit(6)
            ->get();

        $categories = \App\Domain\Catalog\Models\Category::query()
            ->where('name', $like, "%{$term}%")
            ->orWhere('slug', $like, "%{$term}%")
            ->limit(4)
            ->get(['name', 'slug']);

        return response()->json([
            'data' => [
                'courses' => CourseCardResource::collection($courses),
                'categories' => $categories,
            ],
        ]);
    }

    /**
     * Retrieve public instructor profile and their authored courses.
     */
    public function instructorProfile(string $username): JsonResponse
    {
        $term = trim(str_replace('-', ' ', $username));
        $driver = Course::query()->getConnection()->getDriverName();
        $like = $driver === 'pgsql' ? 'ilike' : 'like';

        /** @var \App\Domain\Identity\Models\User|null $instructor */
        $instructor = \App\Domain\Identity\Models\User::query()
            ->where('ulid', $username)
            ->orWhere('name', $like, $term)
            ->orWhere('name', $like, "%{$term}%")
            ->orWhere('email', $like, "%{$username}%")
            ->first();

        if (! $instructor) {
            return response()->json([
                'error' => [
                    'code' => 'instructor_not_found',
                    'message' => 'Instructor profile not found.',
                ],
            ], 404);
        }

        $courses = Course::query()
            ->published()
            ->with(['category', 'primaryInstructor'])
            ->where('primary_instructor_id', $instructor->id)
            ->orderByDesc('enrollments_count')
            ->get();

        $studentsCount = (int) $courses->sum('enrollments_count');
        $reviewsCount = (int) $courses->sum('reviews_count');
        $avgRating = $courses->count() > 0 ? round((float) $courses->avg('rating_cache'), 1) : 5.0;

        return response()->json([
            'data' => [
                'id' => $instructor->ulid,
                'name' => $instructor->name,
                'avatar_url' => $instructor->avatar_url,
                'headline' => $instructor->headline ?: 'Senior Instructor at LearnHub',
                'bio' => $instructor->bio ?: 'Experienced software engineer and educator specializing in industry-grade software architectures.',
                'rating' => $avgRating,
                'reviews_count' => $reviewsCount,
                'students_count' => $studentsCount,
                'courses_count' => $courses->count(),
                'courses' => CourseCardResource::collection($courses),
            ],
        ]);
    }
}

