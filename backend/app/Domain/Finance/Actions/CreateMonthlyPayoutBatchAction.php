<?php

declare(strict_types=1);

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Models\InstructorEarning;
use App\Domain\Finance\Models\InstructorPayoutMethod;
use App\Domain\Finance\Models\InstructorTaxProfile;
use App\Domain\Finance\Models\Payout;
use App\Domain\Finance\Models\PayoutBatch;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateMonthlyPayoutBatchAction
{
    public const MINIMUM_PAYOUT_THRESHOLD_CENTS = 5000; // $50.00 minimum payout threshold (EAR-06)

    public function execute(?Carbon $periodStart = null, ?Carbon $periodEnd = null): PayoutBatch
    {
        $start = $periodStart ?? now()->subMonth()->startOfMonth();
        $end = $periodEnd ?? now()->subMonth()->endOfMonth();

        return DB::transaction(function () use ($start, $end) {
            // 1. Find all available earnings eligible for payout (available_at <= now, status = available)
            // Group by instructor
            $eligibleTotals = InstructorEarning::query()
                ->where('status', 'available')
                ->where('available_at', '<=', now())
                ->selectRaw('instructor_id, SUM(net_earnings_amount) as total_earnings')
                ->groupBy('instructor_id')
                ->havingRaw('SUM(net_earnings_amount) >= ?', [self::MINIMUM_PAYOUT_THRESHOLD_CENTS])
                ->pluck('total_earnings', 'instructor_id')
                ->toArray();

            if (empty($eligibleTotals)) {
                throw ValidationException::withMessages([
                    'batch' => ['No instructors qualify for payout meeting the $50 minimum threshold and refund-hold period.'],
                ]);
            }

            $batchNumber = 'BAT-'.now()->format('Ym').'-'.strtoupper(Str::random(6));

            /** @var PayoutBatch $batch */
            $batch = PayoutBatch::query()->create([
                'ulid' => (string) Str::ulid(),
                'batch_number' => $batchNumber,
                'period_start' => $start->toDateString(),
                'period_end' => $end->toDateString(),
                'total_payout_amount' => 0,
                'currency' => 'USD',
                'status' => 'pending_approval',
            ]);

            $totalBatchAmount = 0;

            foreach ($eligibleTotals as $instructorId => $totalAmount) {
                // 2. Check KYC/tax form compliance (EAR-05)
                $taxProfile = InstructorTaxProfile::query()
                    ->where('instructor_id', $instructorId)
                    ->where('status', 'verified')
                    ->first();

                if (! $taxProfile) {
                    continue; // Skip payout if tax profile is not completed/verified
                }

                // 3. Check default payout method (EAR-05)
                $payoutMethod = InstructorPayoutMethod::query()
                    ->where('instructor_id', $instructorId)
                    ->where('is_default', true)
                    ->first();

                if (! $payoutMethod) {
                    continue; // Skip if no default payout method
                }

                $payoutAmount = (int) $totalAmount;
                $totalBatchAmount += $payoutAmount;

                Payout::query()->create([
                    'ulid' => (string) Str::ulid(),
                    'payout_batch_id' => $batch->id,
                    'instructor_id' => (int) $instructorId,
                    'payout_method_id' => $payoutMethod->id,
                    'amount' => $payoutAmount,
                    'currency' => 'USD',
                    'status' => 'pending',
                ]);
            }

            $batch->update(['total_payout_amount' => $totalBatchAmount]);

            return $batch->fresh(['payouts']);
        });
    }
}
