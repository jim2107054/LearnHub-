<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Actions;

use App\Domain\Catalog\Models\Course;
use App\Domain\Commerce\Enums\OrderStatus;
use App\Domain\Commerce\Events\RefundProcessed;
use App\Domain\Commerce\Models\Order;
use App\Domain\Commerce\Models\Refund;
use App\Domain\Finance\Models\LedgerEntry;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Models\Enrollment;
use App\Infrastructure\Gateways\Payment\PaymentGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProcessRefundAction
{
    public function __construct(
        protected PaymentGateway $paymentGateway
    ) {}

    public function execute(Order $order, Course $course, User $user, string $reason = ''): Refund
    {
        // 1. Verify ownership and status
        if ($order->user_id !== $user->id) {
            throw ValidationException::withMessages(['order' => ['Unauthorized order access.']]);
        }

        if ($order->status !== OrderStatus::PAID) {
            throw ValidationException::withMessages(['order' => ['Only fully paid orders are eligible for a refund.']]);
        }

        // 2. Check 30-day refund window policy
        $refundWindowDays = (int) config('learnhub.refund_window_days', 30);
        if ($order->paid_at && $order->paid_at->diffInDays(now()) > $refundWindowDays) {
            throw ValidationException::withMessages([
                'order' => [sprintf('The %d-day refund eligibility window has expired.', $refundWindowDays)],
            ]);
        }

        // 3. Check progress threshold policy (<= 10%)
        /** @var Enrollment|null $enrollment */
        $enrollment = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        $maxProgress = (int) config('learnhub.max_progress_for_refund_percent', 10);
        if ($enrollment && $enrollment->progress_percent > $maxProgress) {
            throw ValidationException::withMessages([
                'progress' => [
                    sprintf('Course progress (%d%%) exceeds the allowable refund threshold (%d%%).', $enrollment->progress_percent, $maxProgress),
                ],
            ]);
        }

        // Find line item
        $orderItem = $order->items()->where('course_id', $course->id)->first();
        $refundAmount = $orderItem ? $orderItem->total_amount : $order->total_amount;

        return DB::transaction(function () use ($order, $course, $user, $enrollment, $orderItem, $refundAmount, $reason) {
            // Process gateway refund
            $gatewayRefund = $this->paymentGateway->refund(
                paymentIntentId: (string) $order->gateway_intent_id,
                amount: $orderItem ? $orderItem->total : $order->total,
                reason: $reason
            );

            // Record Refund
            $refund = Refund::query()->create([
                'ulid' => (string) Str::ulid(),
                'order_id' => $order->id,
                'user_id' => $user->id,
                'course_id' => $course->id,
                'amount' => $refundAmount,
                'currency' => $order->currency,
                'status' => 'processed',
                'reason' => $reason,
                'gateway_refund_id' => $gatewayRefund['id'],
                'processed_at' => now(),
            ]);

            // Revoke Enrollment entitlement
            if ($enrollment) {
                $enrollment->update(['status' => 'refunded']);
                $course->decrement('enrollments_count');
            }

            // Update order status
            $order->update([
                'status' => OrderStatus::REFUNDED,
            ]);

            // Post Reversing Ledger Entries
            $txId = (string) Str::ulid();

            // Credit Cash Clearing (money sent back to customer)
            LedgerEntry::create([
                'id' => (string) Str::ulid(),
                'transaction_id' => $txId,
                'account_type' => 'cash_clearing',
                'entry_type' => 'credit',
                'amount' => $refundAmount,
                'currency' => $order->currency,
                'reference_type' => 'refund',
                'reference_id' => (string) $refund->ulid,
                'description' => 'Refund processed for Order #'.$order->order_number,
                'created_at' => now(),
            ]);

            // Debit Platform Revenue Reversal
            if ($orderItem && $orderItem->platform_fee_amount > 0) {
                LedgerEntry::create([
                    'id' => (string) Str::ulid(),
                    'transaction_id' => $txId,
                    'account_type' => 'platform_revenue',
                    'entry_type' => 'debit',
                    'amount' => $orderItem->platform_fee_amount,
                    'currency' => $order->currency,
                    'reference_type' => 'refund',
                    'reference_id' => (string) $refund->ulid,
                    'description' => 'Platform commission reversal for Refund #'.$refund->ulid,
                    'created_at' => now(),
                ]);
            }

            // Debit Instructor Earnings Liability Reversal
            if ($orderItem && $orderItem->instructor_share_amount > 0) {
                LedgerEntry::create([
                    'id' => (string) Str::ulid(),
                    'transaction_id' => $txId,
                    'account_type' => 'instructor_earnings',
                    'user_id' => $orderItem->instructor_id,
                    'entry_type' => 'debit',
                    'amount' => $orderItem->instructor_share_amount,
                    'currency' => $order->currency,
                    'reference_type' => 'refund',
                    'reference_id' => (string) $refund->ulid,
                    'description' => 'Instructor earnings clawback for Refund #'.$refund->ulid,
                    'created_at' => now(),
                ]);
            }

            event(new RefundProcessed($refund));

            return $refund;
        });
    }
}
