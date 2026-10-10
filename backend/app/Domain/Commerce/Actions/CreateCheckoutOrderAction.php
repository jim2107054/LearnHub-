<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Actions;

use App\Domain\Commerce\Enums\OrderStatus;
use App\Domain\Commerce\Models\Order;
use App\Domain\Commerce\Models\OrderItem;
use App\Domain\Commerce\Services\CartService;
use App\Domain\Identity\Models\User;
use App\Infrastructure\Gateways\Payment\PaymentGateway;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CreateCheckoutOrderAction
{
    public function __construct(
        protected CartService $cartService,
        protected PaymentGateway $paymentGateway,
        protected ProcessPaymentSuccessAction $successAction
    ) {}

    /**
     * @return array{order: Order, client_secret: string|null, is_free: bool}
     */
    public function execute(User $user, string $countryCode = 'US', ?string $billingName = null): array
    {
        $cartSummary = $this->cartService->getSummary($user, $countryCode);

        if ($cartSummary['items']->isEmpty()) {
            throw ValidationException::withMessages([
                'cart' => ['Your shopping cart is empty.'],
            ]);
        }

        return DB::transaction(function () use ($user, $cartSummary, $countryCode, $billingName) {
            $orderNumber = 'ORD-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));

            $order = Order::query()->create([
                'ulid' => (string) Str::ulid(),
                'user_id' => $user->id,
                'order_number' => $orderNumber,
                'status' => OrderStatus::PENDING,
                'subtotal_amount' => $cartSummary['subtotal']->amount,
                'discount_amount' => $cartSummary['discount']->amount,
                'tax_amount' => $cartSummary['tax']->amount,
                'total_amount' => $cartSummary['total']->amount,
                'currency' => $cartSummary['currency'],
                'billing_country' => $countryCode,
                'billing_name' => $billingName ?? $user->name,
            ]);

            $platformFeePercent = (int) config('learnhub.platform_fee_percent', 20);

            foreach ($cartSummary['items'] as $item) {
                $course = $item->course;
                $priceCents = $course->price_amount;
                $discountCents = 0;

                if ($item->coupon && $item->coupon->isValid()) {
                    if ($item->coupon->discount_type === 'percentage') {
                        $discountCents = (int) round(($priceCents * $item->coupon->discount_value) / 100);
                    } else {
                        $discountCents = min($priceCents, $item->coupon->discount_value);
                    }
                }

                $itemTotalCents = max(0, $priceCents - $discountCents);
                $platformFeeCents = (int) round(($itemTotalCents * $platformFeePercent) / 100);
                $instructorShareCents = $itemTotalCents - $platformFeeCents;

                OrderItem::query()->create([
                    'ulid' => (string) Str::ulid(),
                    'order_id' => $order->id,
                    'course_id' => $course->id,
                    'instructor_id' => $course->primary_instructor_id,
                    'coupon_id' => $item->coupon_id,
                    'unit_price_amount' => $priceCents,
                    'discount_amount' => $discountCents,
                    'tax_amount' => 0,
                    'total_amount' => $itemTotalCents,
                    'platform_fee_amount' => $platformFeeCents,
                    'instructor_share_amount' => $instructorShareCents,
                ]);
            }

            // Free orders (100% discount or 0 price) are fulfilled instantly without payment gateway
            if ($order->total_amount === 0) {
                $this->successAction->execute($order);

                return [
                    'order' => $order->fresh(),
                    'client_secret' => null,
                    'is_free' => true,
                ];
            }

            // Create gateway PaymentIntent
            $intent = $this->paymentGateway->createPaymentIntent(
                amount: $order->total,
                orderId: $order->ulid,
                metadata: [
                    'order_number' => $order->order_number,
                    'user_id' => (string) $user->ulid,
                ]
            );

            $order->update([
                'gateway_intent_id' => $intent['id'],
            ]);

            return [
                'order' => $order->fresh(),
                'client_secret' => $intent['client_secret'],
                'is_free' => false,
            ];
        });
    }
}
