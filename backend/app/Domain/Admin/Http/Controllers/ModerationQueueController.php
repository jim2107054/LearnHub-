<?php

declare(strict_types=1);

namespace App\Domain\Admin\Http\Controllers;

use App\Domain\Community\Models\ModerationReport;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\Rule;

class ModerationQueueController extends Controller
{
    /**
     * List user reports and flags queue (ADM-03).
     */
    public function index(Request $request): JsonResponse
    {
        $status = $request->query('status', 'pending');

        $reports = ModerationReport::query()
            ->where('status', $status)
            ->with(['reporter:id,ulid,name,email', 'reportable'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $reports->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $reports->currentPage(),
                    'last_page' => $reports->lastPage(),
                    'per_page' => $reports->perPage(),
                    'total' => $reports->total(),
                ],
            ],
        ]);
    }

    /**
     * Resolve report with action taken.
     */
    public function resolve(Request $request, string $reportUlid): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['resolved', 'dismissed', 'action_taken'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        /** @var User $moderator */
        $moderator = $request->user();

        /** @var ModerationReport $report */
        $report = ModerationReport::query()->where('ulid', $reportUlid)->firstOrFail();

        $report->update([
            'status' => $validated['status'],
            'moderator_notes' => $validated['notes'] ?? null,
            'moderated_by' => $moderator->id,
            'moderated_at' => now(),
        ]);

        return response()->json([
            'data' => $report,
            'message' => 'Report status updated to '.$validated['status'].'.',
        ]);
    }
}
