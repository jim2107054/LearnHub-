<?php

declare(strict_types=1);

namespace App\Domain\Finance\Http\Controllers;

use App\Domain\Finance\Actions\CreateMonthlyPayoutBatchAction;
use App\Domain\Finance\Actions\ProcessPayoutBatchAction;
use App\Domain\Finance\Models\InstructorEarning;
use App\Domain\Finance\Models\PayoutBatch;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AdminFinanceController extends Controller
{
    /**
     * List all payout batches.
     */
    public function batches(): JsonResponse
    {
        $batches = PayoutBatch::query()
            ->withCount(['payouts'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => $batches->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $batches->currentPage(),
                    'last_page' => $batches->lastPage(),
                    'per_page' => $batches->perPage(),
                    'total' => $batches->total(),
                ],
            ],
        ]);
    }

    /**
     * Generate monthly payout batch (EAR-06).
     */
    public function generateBatch(Request $request, CreateMonthlyPayoutBatchAction $action): JsonResponse
    {
        $batch = $action->execute();

        return response()->json([
            'data' => $batch,
            'message' => 'Monthly payout batch generated for review.',
        ], 201);
    }

    /**
     * Approve and execute payout batch disbursements.
     */
    public function approveBatch(Request $request, string $batchUlid, ProcessPayoutBatchAction $action): JsonResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        /** @var PayoutBatch $batch */
        $batch = PayoutBatch::query()->where('ulid', $batchUlid)->firstOrFail();

        $processed = $action->execute($batch, $admin);

        return response()->json([
            'data' => $processed,
            'message' => 'Payout batch processed successfully and ledger posted.',
        ]);
    }

    /**
     * Admin place hold on instructor earning (EAR-08).
     */
    public function holdEarning(Request $request, string $earningUlid): JsonResponse
    {
        /** @var InstructorEarning $earning */
        $earning = InstructorEarning::query()->where('ulid', $earningUlid)->firstOrFail();

        $earning->update(['status' => 'on_hold']);

        return response()->json([
            'data' => $earning,
            'message' => 'Earning placed on hold.',
        ]);
    }

    /**
     * Admin release hold on instructor earning.
     */
    public function releaseEarning(Request $request, string $earningUlid): JsonResponse
    {
        /** @var InstructorEarning $earning */
        $earning = InstructorEarning::query()->where('ulid', $earningUlid)->firstOrFail();

        $status = $earning->available_at->isPast() ? 'available' : 'pending_hold';
        $earning->update(['status' => $status]);

        return response()->json([
            'data' => $earning,
            'message' => 'Earning hold released.',
        ]);
    }
}
