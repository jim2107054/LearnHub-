<?php

declare(strict_types=1);

namespace App\Domain\Learning\Http\Controllers;

use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Actions\RecordLectureProgressAction;
use App\Domain\Learning\Http\Resources\EnrollmentResource;
use App\Domain\Learning\Models\Enrollment;
use App\Domain\Learning\Models\LearningNote;
use App\Domain\Learning\Models\LectureProgress;
use App\Domain\Learning\Services\StreamLimiterService;
use App\Domain\Media\Models\MediaAsset;
use App\Infrastructure\Gateways\Video\VideoPipeline;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class LearningController extends Controller
{
    public function __construct(
        protected VideoPipeline $videoPipeline,
        protected StreamLimiterService $streamLimiter
    ) {}

    /**
     * My Learning: list all active course enrollments with progress metrics.
     */
    public function enrollments(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $enrollments = Enrollment::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->with(['course.primaryInstructor', 'lastAccessedLecture'])
            ->orderByDesc('last_accessed_at')
            ->get();

        return response()->json([
            'data' => EnrollmentResource::collection($enrollments),
        ]);
    }

    /**
     * Access lecture content with short-lived signed video URL and stream limiter check.
     */
    public function lecture(Request $request, string $courseUlid, string $lectureUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()->where('ulid', $courseUlid)->firstOrFail();

        /** @var Lecture $lecture */
        $lecture = Lecture::query()->where('ulid', $lectureUlid)->where('course_id', $course->id)->firstOrFail();

        // Verify enrollment entitlement unless it's a free preview lecture
        $hasActiveEnrollment = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->whereIn('status', ['active', 'completed'])
            ->exists();

        if (! $hasActiveEnrollment && ! $lecture->is_preview) {
            throw new AccessDeniedHttpException('You must be enrolled in this course to access this lecture.');
        }

        // Enforce concurrent stream limit (LRN-12)
        $playbackSessionId = $request->header('X-Playback-Session', (string) Str::uuid());
        $this->streamLimiter->acquire($user, $playbackSessionId);

        // Fetch associated media asset if video lecture
        /** @var MediaAsset|null $mediaAsset */
        $mediaAsset = MediaAsset::query()->where('lecture_id', $lecture->id)->where('status', 'ready')->first();

        $signedPlaybackUrl = null;
        if ($mediaAsset && $mediaAsset->hls_manifest_key) {
            $signedPlaybackUrl = $this->videoPipeline->generateSignedPlaybackUrl(
                manifestKey: $mediaAsset->hls_manifest_key,
                expiresInMinutes: 120
            );
        }

        // Fetch previous saved position
        $progress = LectureProgress::query()
            ->where('user_id', $user->id)
            ->where('lecture_id', $lecture->id)
            ->first();

        return response()->json([
            'data' => [
                'lecture' => [
                    'id' => $lecture->ulid,
                    'title' => $lecture->title,
                    'lecture_type' => $lecture->lecture_type->value,
                    'duration_seconds' => $lecture->duration_seconds,
                    'content_payload' => $lecture->content_payload,
                ],
                'playback' => [
                    'hls_stream_url' => $signedPlaybackUrl,
                    'captions' => $mediaAsset?->captions ?? [],
                    'last_position_seconds' => $progress?->last_position_seconds ?? 0,
                    'is_completed' => $progress?->is_completed ?? false,
                ],
            ],
        ]);
    }

    /**
     * Record video heartbeat playback position and evaluate completion rules.
     */
    public function progress(
        Request $request,
        string $courseUlid,
        string $lectureUlid,
        RecordLectureProgressAction $action
    ): JsonResponse {
        $validated = $request->validate([
            'position_seconds' => ['required', 'integer', 'min:0'],
            'manual_complete' => ['sometimes', 'boolean'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()->where('ulid', $courseUlid)->firstOrFail();

        /** @var Lecture $lecture */
        $lecture = Lecture::query()->where('ulid', $lectureUlid)->where('course_id', $course->id)->firstOrFail();

        $result = $action->execute(
            user: $user,
            course: $course,
            lecture: $lecture,
            positionSeconds: $validated['position_seconds'],
            manualComplete: $validated['manual_complete'] ?? false
        );

        return response()->json([
            'data' => [
                'is_completed' => $result['progress']->is_completed,
                'course_progress_percent' => $result['course_percent'],
            ],
            'message' => 'Progress saved.',
        ]);
    }

    // -------------------------------------------------------------------------
    // Learning Notes & Bookmarks
    // -------------------------------------------------------------------------

    public function notes(Request $request, string $lectureUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Lecture $lecture */
        $lecture = Lecture::query()->where('ulid', $lectureUlid)->firstOrFail();

        $notes = LearningNote::query()
            ->where('user_id', $user->id)
            ->where('lecture_id', $lecture->id)
            ->orderBy('timestamp_seconds')
            ->get();

        return response()->json(['data' => $notes]);
    }

    public function storeNote(Request $request, string $lectureUlid): JsonResponse
    {
        $validated = $request->validate([
            'timestamp_seconds' => ['required', 'integer', 'min:0'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var Lecture $lecture */
        $lecture = Lecture::query()->where('ulid', $lectureUlid)->firstOrFail();

        $note = LearningNote::query()->create([
            'ulid' => (string) Str::ulid(),
            'user_id' => $user->id,
            'lecture_id' => $lecture->id,
            'timestamp_seconds' => $validated['timestamp_seconds'],
            'body' => $validated['body'],
        ]);

        return response()->json(['data' => $note], 201);
    }

    public function destroyNote(Request $request, string $noteUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        LearningNote::query()
            ->where('user_id', $user->id)
            ->where('ulid', $noteUlid)
            ->delete();

        return response()->json(['message' => 'Note deleted.']);
    }
}
