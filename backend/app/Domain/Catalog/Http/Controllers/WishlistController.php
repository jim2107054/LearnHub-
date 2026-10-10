<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Http\Controllers;

use App\Domain\Catalog\Http\Resources\CourseCardResource;
use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Wishlist;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class WishlistController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $courses = Course::query()
            ->published()
            ->with(['category', 'primaryInstructor'])
            ->whereHas('wishlists', fn ($q) => $q->where('user_id', $user->id))
            ->get();

        return response()->json([
            'data' => CourseCardResource::collection($courses),
        ]);
    }

    public function store(Request $request, string $courseUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()->where('ulid', $courseUlid)->firstOrFail();

        Wishlist::firstOrCreate([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        return response()->json([
            'message' => 'Course added to your wishlist.',
        ], 201);
    }

    public function destroy(Request $request, string $courseUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()->where('ulid', $courseUlid)->firstOrFail();

        Wishlist::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->delete();

        return response()->json([
            'message' => 'Course removed from your wishlist.',
        ]);
    }
}
