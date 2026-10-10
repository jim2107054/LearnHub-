<?php

declare(strict_types=1);

namespace App\Domain\Admin\Http\Controllers;

use App\Domain\Admin\Models\DmcaNotice;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class DmcaController extends Controller
{
    /**
     * List all DMCA notices (ADM-08).
     */
    public function index(Request $request): JsonResponse
    {
        $notices = DmcaNotice::query()
            ->with(['course:id,ulid,title,status', 'instructor:id,ulid,name,email'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $notices->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $notices->currentPage(),
                    'last_page' => $notices->lastPage(),
                    'per_page' => $notices->perPage(),
                    'total' => $notices->total(),
                ],
            ],
        ]);
    }

    /**
     * Ingest DMCA copyright takedown claim.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_ulid' => ['required', 'string'],
            'claimant_name' => ['required', 'string', 'max:255'],
            'claimant_email' => ['required', 'email'],
            'infringing_work_url' => ['required', 'url'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        /** @var Course $course */
        $course = Course::query()->where('ulid', $validated['course_ulid'])->firstOrFail();

        $notice = DmcaNotice::query()->create([
            'ulid' => (string) Str::ulid(),
            'course_id' => $course->id,
            'instructor_id' => $course->primary_instructor_id,
            'claimant_name' => $validated['claimant_name'],
            'claimant_email' => $validated['claimant_email'],
            'infringing_work_url' => $validated['infringing_work_url'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'received',
            'strike_applied' => false,
        ]);

        return response()->json([
            'data' => $notice,
            'message' => 'DMCA notice logged for legal review.',
        ], 201);
    }

    /**
     * Issue strike against instructor and unpublish course (BR-08).
     */
    public function issueStrike(Request $request, string $noticeUlid): JsonResponse
    {
        /** @var DmcaNotice $notice */
        $notice = DmcaNotice::query()->where('ulid', $noticeUlid)->firstOrFail();

        $notice->update([
            'status' => 'strike_issued',
            'strike_applied' => true,
        ]);

        // Unpublish course immediately
        $notice->course->update(['status' => CourseStatus::UNPUBLISHED]);

        // Check total strikes for instructor (BR-08: 3 strikes leads to suspension)
        $totalStrikes = DmcaNotice::query()
            ->where('instructor_id', $notice->instructor_id)
            ->where('strike_applied', true)
            ->count();

        if ($totalStrikes >= 3) {
            $notice->instructor->update(['status' => 'suspended']);
        }

        return response()->json([
            'data' => [
                'notice' => $notice,
                'total_strikes' => $totalStrikes,
                'instructor_suspended' => $totalStrikes >= 3,
            ],
            'message' => 'Copyright strike issued against instructor.',
        ]);
    }
}
