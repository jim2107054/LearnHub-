<?php

declare(strict_types=1);

namespace App\Domain\Instructor\Http\Controllers;

use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Enums\LectureType;
use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Catalog\Models\Section;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Actions\ReorderCurriculumAction;
use App\Domain\Instructor\Actions\SubmitCourseForReviewAction;
use App\Domain\Instructor\Actions\ValidateCourseForPublishAction;
use App\Domain\Instructor\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class InstructorController extends Controller
{
    /**
     * Onboard current user into the instructor program.
     */
    public function onboard(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->hasRole(UserRole::INSTRUCTOR->value)) {
            $user->assignRole(UserRole::INSTRUCTOR->value);
        }

        return response()->json([
            'message' => 'Congratulations! You are now registered as an instructor.',
        ]);
    }

    /**
     * List courses owned by current instructor.
     */
    public function courses(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $courses = Course::query()
            ->where('primary_instructor_id', $user->id)
            ->with(['category'])
            ->orderByDesc('updated_at')
            ->get();

        return response()->json([
            'data' => $courses,
        ]);
    }

    /**
     * Create a new course draft.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'category_id' => ['nullable', 'exists:categories,id'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $course = Course::query()->create([
            'ulid' => (string) Str::ulid(),
            'primary_instructor_id' => $user->id,
            'title' => $validated['title'],
            'slug' => Str::slug($validated['title']).'-'.Str::random(6),
            'category_id' => $validated['category_id'] ?? null,
            'status' => CourseStatus::DRAFT,
            'level' => CourseLevel::ALL_LEVELS,
            'language' => 'en',
            'price_amount' => 0,
            'price_currency' => 'USD',
        ]);

        return response()->json([
            'data' => $course,
            'message' => 'Course draft created successfully.',
        ], 201);
    }

    /**
     * Update course draft basics, pricing, and curriculum requirements.
     */
    public function update(Request $request, string $courseUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()
            ->where('ulid', $courseUlid)
            ->where('primary_instructor_id', $user->id)
            ->firstOrFail();

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'level' => ['sometimes', 'string', 'in:all_levels,beginner,intermediate,advanced'],
            'language' => ['sometimes', 'string', 'max:10'],
            'price_amount' => ['sometimes', 'integer', 'min:0'],
            'thumbnail_url' => ['nullable', 'url'],
            'promo_video_url' => ['nullable', 'url'],
            'requirements' => ['nullable', 'array'],
            'what_you_will_learn' => ['nullable', 'array'],
            'category_id' => ['nullable', 'exists:categories,id'],
        ]);

        $course->update($validated);

        return response()->json([
            'data' => $course->fresh(),
            'message' => 'Course updated successfully.',
        ]);
    }

    /**
     * Delete course draft. Blocked if enrollments exist (BR-09).
     */
    public function destroy(Request $request, string $courseUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()
            ->where('ulid', $courseUlid)
            ->where('primary_instructor_id', $user->id)
            ->firstOrFail();

        if ($course->enrollments_count > 0) {
            throw ValidationException::withMessages([
                'course' => ['Cannot delete a course that already has enrolled learners.'],
            ]);
        }

        $course->delete();

        return response()->json([
            'message' => 'Course deleted successfully.',
        ]);
    }

    /**
     * Run pre-publish checklist validation (BR-03, INS-10).
     */
    public function validateChecklist(Request $request, string $courseUlid, ValidateCourseForPublishAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()
            ->where('ulid', $courseUlid)
            ->where('primary_instructor_id', $user->id)
            ->firstOrFail();

        $result = $action->execute($course);

        return response()->json([
            'data' => $result,
        ]);
    }

    /**
     * Submit course for review.
     */
    public function submitReview(Request $request, string $courseUlid, SubmitCourseForReviewAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()
            ->where('ulid', $courseUlid)
            ->where('primary_instructor_id', $user->id)
            ->firstOrFail();

        $submission = $action->execute($course, $user);

        return response()->json([
            'data' => $submission,
            'message' => 'Course successfully submitted for quality review.',
        ]);
    }

    // -------------------------------------------------------------------------
    // Curriculum Management
    // -------------------------------------------------------------------------

    public function storeSection(Request $request, string $courseUlid): JsonResponse
    {
        $validated = $request->validate(['title' => ['required', 'string', 'max:255']]);
        /** @var User $user */
        $user = $request->user();
        /** @var Course $course */
        $course = Course::query()->where('ulid', $courseUlid)->where('primary_instructor_id', $user->id)->firstOrFail();

        $maxOrder = (int) Section::where('course_id', $course->id)->max('sort_order');

        $section = Section::create([
            'ulid' => (string) Str::ulid(),
            'course_id' => $course->id,
            'title' => $validated['title'],
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json(['data' => $section], 201);
    }

    public function storeLecture(Request $request, string $courseUlid, string $sectionUlid): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'lecture_type' => ['required', 'string', 'in:video,article,resource,quiz,assignment,external_link'],
            'is_preview' => ['sometimes', 'boolean'],
            'duration_seconds' => ['sometimes', 'integer', 'min:0'],
        ]);

        /** @var User $user */
        $user = $request->user();
        /** @var Course $course */
        $course = Course::query()->where('ulid', $courseUlid)->where('primary_instructor_id', $user->id)->firstOrFail();
        /** @var Section $section */
        $section = Section::query()->where('ulid', $sectionUlid)->where('course_id', $course->id)->firstOrFail();

        $maxOrder = (int) Lecture::where('section_id', $section->id)->max('sort_order');

        $lecture = Lecture::create([
            'ulid' => (string) Str::ulid(),
            'course_id' => $course->id,
            'section_id' => $section->id,
            'title' => $validated['title'],
            'lecture_type' => LectureType::from($validated['lecture_type']),
            'is_preview' => $validated['is_preview'] ?? false,
            'duration_seconds' => $validated['duration_seconds'] ?? 0,
            'sort_order' => $maxOrder + 1,
        ]);

        return response()->json(['data' => $lecture], 201);
    }

    public function reorderCurriculum(Request $request, string $courseUlid, ReorderCurriculumAction $action): JsonResponse
    {
        $validated = $request->validate([
            'curriculum' => ['required', 'array'],
            'curriculum.*.id' => ['required', 'string'],
            'curriculum.*.lectures' => ['required', 'array'],
        ]);

        /** @var User $user */
        $user = $request->user();
        /** @var Course $course */
        $course = Course::query()->where('ulid', $courseUlid)->where('primary_instructor_id', $user->id)->firstOrFail();

        $action->execute($course, $validated['curriculum']);

        return response()->json(['message' => 'Curriculum reordered successfully.']);
    }

    // -------------------------------------------------------------------------
    // Coupons Management
    // -------------------------------------------------------------------------

    public function coupons(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $coupons = Coupon::query()
            ->where('instructor_id', $user->id)
            ->with(['course'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $coupons]);
    }

    public function storeCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:30', 'unique:coupons,code'],
            'discount_type' => ['required', 'string', 'in:percentage,fixed'],
            'discount_value' => ['required', 'integer', 'min:1'],
            'course_id' => ['nullable', 'exists:courses,id'],
            'max_uses' => ['nullable', 'integer', 'min:1'],
            'expires_at' => ['nullable', 'date', 'after:now'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $coupon = Coupon::create([
            'ulid' => (string) Str::ulid(),
            'instructor_id' => $user->id,
            'course_id' => $validated['course_id'] ?? null,
            'code' => strtoupper($validated['code']),
            'discount_type' => $validated['discount_type'],
            'discount_value' => $validated['discount_value'],
            'max_uses' => $validated['max_uses'] ?? null,
            'expires_at' => $validated['expires_at'] ?? null,
            'is_active' => true,
        ]);

        return response()->json(['data' => $coupon], 201);
    }
}
