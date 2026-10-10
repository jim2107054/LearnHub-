<?php

declare(strict_types=1);

namespace App\Domain\Finance\Actions;

use App\Domain\Finance\Models\InstructorEarning;
use App\Domain\Finance\Models\LedgerEntry;
use App\Domain\Finance\Models\Payout;
use App\Domain\Finance\Models\PayoutBatch;
use App\Domain\Identity\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessPayoutBatchAction
{
    public function execute(PayoutBatch $batch, User $financeAdmin): PayoutBatch
    {
        return DB::transaction(function () use ($batch, $financeAdmin) {
            $batch->loadMissing(['payouts']);

            $transactionUlid = (string) Str::ulid();

            foreach ($batch->payouts as $payout) {
                if ($payout->status !== 'pending') {
                    continue;
                }

                // 1. Simulate gateway disbursement execution (e.g. PayPal Payouts / Stripe Transfer)
                $gatewayPayoutId = 'gw_po_'.Str::random(16);

                $payout->update([
                    'status' => 'paid',
                    'gateway_payout_id' => $gatewayPayoutId,
                    'paid_at' => now(),
                ]);

                // 2. Mark instructor's available earnings as paid
                InstructorEarning::query()
                    ->where('instructor_id', $payout->instructor_id)
                    ->where('status', 'available')
                    ->where('available_at', '<=', now())
                    ->update([
                        'status' => 'paid',
                        'payout_id' => $payout->id,
                        'paid_at' => now(),
                    ]);

                // 3. Post balanced double-entry ledger records
                // Debit: instructor_earnings (clearing accrued instructor payable)
                LedgerEntry::query()->create([
                    'id' => (string) Str::ulid(),
                    'transaction_id' => $transactionUlid,
                    'account_type' => 'instructor_earnings',
                    'user_id' => $payout->instructor_id,
                    'entry_type' => 'debit',
                    'amount' => $payout->amount,
                    'currency' => $payout->currency,
                    'reference_type' => 'payout',
                    'reference_id' => $payout->ulid,
                    'description' => sprintf('Instructor monthly payout #%s', $payout->ulid),
                    'created_at' => now(),
                ]);

                // Credit: cash_clearing (bank disbursement reduction)
                LedgerEntry::query()->create([
                    'id' => (string) Str::ulid(),
                    'transaction_id' => $transactionUlid,
                    'account_type' => 'cash_clearing',
                    'user_id' => $payout->instructor_id,
                    'entry_type' => 'credit',
                    'amount' => $payout->amount,
                    'currency' => $payout->currency,
                    'reference_type' => 'payout',
                    'reference_id' => $payout->ulid,
                    'description' => sprintf('Cash outflow for payout #%s', $payout->ulid),
                    'created_at' => now(),
                ]);
            }

            $batch->update([
                'status' => 'completed',
                'approved_by' => $financeAdmin->id,
                'processed_at' => now(),
            ]);

            return $batch->fresh(['payouts']);
        });
    }
}
