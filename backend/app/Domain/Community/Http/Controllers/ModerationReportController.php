<?php

declare(strict_types=1);

namespace App\Domain\Community\Http\Controllers;

use App\Domain\Community\Models\CourseReview;
use App\Domain\Community\Models\DirectMessage;
use App\Domain\Community\Models\ModerationReport;
use App\Domain\Community\Models\QaAnswer;
use App\Domain\Community\Models\QaQuestion;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ModerationReportController extends Controller
{
    /**
     * Report/flag content for platform moderation (COM-05).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reportable_type' => ['required', 'string', Rule::in(['review', 'question', 'answer', 'message'])],
            'reportable_id' => ['required', 'string'],
            'reason' => ['required', 'string', Rule::in(['spam', 'harassment', 'hate_speech', 'copyright', 'inappropriate'])],
            'details' => ['nullable', 'string', 'max:2000'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $morphClass = match ($validated['reportable_type']) {
            'review' => CourseReview::class,
            'question' => QaQuestion::class,
            'answer' => QaAnswer::class,
            'message' => DirectMessage::class,
        };

        /** @var \Illuminate\Database\Eloquent\Model $target */
        $target = $morphClass::query()->where('ulid', $validated['reportable_id'])->firstOrFail();

        $report = ModerationReport::query()->create([
            'ulid' => (string) Str::ulid(),
            'reporter_id' => $user->id,
            'reportable_type' => $morphClass,
            'reportable_id' => $target->id,
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'data' => [
                'id' => $report->ulid,
                'status' => $report->status,
                'created_at' => $report->created_at?->toIso8601String(),
            ],
            'message' => 'Thank you for your report. Our trust & safety team will review this shortly.',
        ], 201);
    }
}
