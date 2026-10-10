<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Actions;

use App\Domain\Commerce\Enums\OrderStatus;
use App\Domain\Commerce\Events\OrderPaid;
use App\Domain\Commerce\Models\CartItem;
use App\Domain\Commerce\Models\Order;
use App\Domain\Finance\Models\LedgerEntry;
use App\Domain\Learning\Models\Enrollment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessPaymentSuccessAction
{
    public function execute(Order $order): void
    {
        // Idempotency check: if already paid, do nothing
        if ($order->status === OrderStatus::PAID) {
            return;
        }

        DB::transaction(function () use ($order) {
            $order->loadMissing(['items']);

            $order->update([
                'status' => OrderStatus::PAID,
                'paid_at' => now(),
            ]);

            // 1. Provision Course Enrollments
            foreach ($order->items as $item) {
                Enrollment::firstOrCreate(
                    [
                        'user_id' => $order->user_id,
                        'course_id' => $item->course_id,
                    ],
                    [
                        'ulid' => (string) Str::ulid(),
                        'order_id' => $order->id,
                        'status' => 'active',
                        'progress_percent' => 0,
                    ]
                );

                // Increment enrollment counter on course
                $item->course->increment('enrollments_count');

                // Increment coupon usage counter if coupon used
                if ($item->coupon_id) {
                    $item->coupon?->increment('uses_count');
                }
            }

            // 2. Post Double-Entry Ledger Entries (ADR 003)
            $txId = (string) Str::ulid();

            // Debit Cash/Gateway Clearing
            LedgerEntry::create([
                'id' => (string) Str::ulid(),
                'transaction_id' => $txId,
                'account_type' => 'cash_clearing',
                'entry_type' => 'debit',
                'amount' => $order->total_amount,
                'currency' => $order->currency,
                'reference_type' => 'order',
                'reference_id' => (string) $order->ulid,
                'description' => 'Payment received for Order #'.$order->order_number,
                'created_at' => now(),
            ]);

            // Credit Platform Revenue
            $totalPlatformFee = (int) $order->items->sum('platform_fee_amount');
            if ($totalPlatformFee > 0) {
                LedgerEntry::create([
                    'id' => (string) Str::ulid(),
                    'transaction_id' => $txId,
                    'account_type' => 'platform_revenue',
                    'entry_type' => 'credit',
                    'amount' => $totalPlatformFee,
                    'currency' => $order->currency,
                    'reference_type' => 'order',
                    'reference_id' => (string) $order->ulid,
                    'description' => 'Platform commission for Order #'.$order->order_number,
                    'created_at' => now(),
                ]);
            }

            // Credit Instructor Earnings Liability
            foreach ($order->items as $item) {
                if ($item->instructor_share_amount > 0) {
                    LedgerEntry::create([
                        'id' => (string) Str::ulid(),
                        'transaction_id' => $txId,
                        'account_type' => 'instructor_earnings',
                        'user_id' => $item->instructor_id,
                        'entry_type' => 'credit',
                        'amount' => $item->instructor_share_amount,
                        'currency' => $order->currency,
                        'reference_type' => 'order',
                        'reference_id' => (string) $order->ulid,
                        'description' => 'Instructor earnings for course #'.$item->course_id.' on Order #'.$order->order_number,
                        'created_at' => now(),
                    ]);

                    \App\Domain\Finance\Models\InstructorEarning::create([
                        'ulid' => (string) Str::ulid(),
                        'instructor_id' => $item->instructor_id,
                        'order_id' => $order->id,
                        'order_item_id' => $item->id,
                        'course_id' => $item->course_id,
                        'gross_amount' => $item->price_amount,
                        'platform_fee_amount' => $item->platform_fee_amount,
                        'tax_withheld_amount' => 0,
                        'net_earnings_amount' => $item->instructor_share_amount,
                        'currency' => $order->currency,
                        'revenue_share_percent' => $item->coupon_id ? 97 : 37,
                        'source_type' => $item->coupon_id ? 'instructor_coupon' : 'platform_organic',
                        'status' => 'pending_hold',
                        'available_at' => now()->addDays(30),
                    ]);
                }
            }

            // Credit Tax Payable
            if ($order->tax_amount > 0) {
                LedgerEntry::create([
                    'id' => (string) Str::ulid(),
                    'transaction_id' => $txId,
                    'account_type' => 'tax_payable',
                    'entry_type' => 'credit',
                    'amount' => $order->tax_amount,
                    'currency' => $order->currency,
                    'reference_type' => 'order',
                    'reference_id' => (string) $order->ulid,
                    'description' => 'Collected sales tax/VAT for Order #'.$order->order_number,
                    'created_at' => now(),
                ]);
            }

            // 3. Clear Cart for User
            CartItem::where('user_id', $order->user_id)->delete();

            // 4. Emit OrderPaid event
            event(new OrderPaid($order));
        });
    }
}
