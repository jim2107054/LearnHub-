<?php

declare(strict_types=1);

namespace App\Domain\Finance\Http\Controllers;

use App\Domain\Catalog\Models\Course;
use App\Domain\Finance\Models\InstructorEarning;
use App\Domain\Finance\Models\Payout;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class EarningsController extends Controller
{
    /**
     * Instructor earnings dashboard summary (EAR-03).
     */
    public function dashboard(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // 1. Overall totals
        $grossSales = (int) InstructorEarning::query()->where('instructor_id', $user->id)->sum('gross_amount');
        $platformFees = (int) InstructorEarning::query()->where('instructor_id', $user->id)->sum('platform_fee_amount');
        $netEarnings = (int) InstructorEarning::query()->where('instructor_id', $user->id)->sum('net_earnings_amount');

        // 2. Balances by status
        $pendingHoldBalance = (int) InstructorEarning::query()
            ->where('instructor_id', $user->id)
            ->where('status', 'pending_hold')
            ->sum('net_earnings_amount');

        $availableBalance = (int) InstructorEarning::query()
            ->where('instructor_id', $user->id)
            ->where('status', 'available')
            ->sum('net_earnings_amount');

        $paidTotal = (int) InstructorEarning::query()
            ->where('instructor_id', $user->id)
            ->where('status', 'paid')
            ->sum('net_earnings_amount');

        // 3. Course breakdown
        $courseBreakdown = InstructorEarning::query()
            ->where('instructor_id', $user->id)
            ->selectRaw('course_id, count(*) as sales_count, sum(gross_amount) as course_gross, sum(net_earnings_amount) as course_net')
            ->groupBy('course_id')
            ->get()
            ->map(function ($row) {
                $course = Course::query()->find($row->course_id);

                return [
                    'course_id' => $course?->ulid,
                    'course_title' => $course?->title ?? 'Unknown Course',
                    'sales_count' => (int) $row->sales_count,
                    'gross_amount' => (int) $row->course_gross,
                    'net_amount' => (int) $row->course_net,
                ];
            });

        // 4. Recent payouts
        $recentPayouts = Payout::query()
            ->where('instructor_id', $user->id)
            ->latest()
            ->limit(5)
            ->get(['ulid', 'amount', 'currency', 'status', 'paid_at']);

        return response()->json([
            'data' => [
                'summary' => [
                    'gross_sales' => $grossSales,
                    'platform_fees' => $platformFees,
                    'net_earnings' => $netEarnings,
                    'pending_hold_balance' => $pendingHoldBalance,
                    'available_balance' => $availableBalance,
                    'paid_total' => $paidTotal,
                    'currency' => 'USD',
                ],
                'course_breakdown' => $courseBreakdown,
                'recent_payouts' => $recentPayouts,
            ],
        ]);
    }

    /**
     * Itemized earnings transaction history.
     */
    public function history(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $earnings = InstructorEarning::query()
            ->where('instructor_id', $user->id)
            ->with(['course:id,ulid,title', 'order:id,ulid,order_number'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $earnings->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $earnings->currentPage(),
                    'last_page' => $earnings->lastPage(),
                    'per_page' => $earnings->perPage(),
                    'total' => $earnings->total(),
                ],
            ],
        ]);
    }
}
