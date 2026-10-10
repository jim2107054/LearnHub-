<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Http\Controllers;

use App\Domain\Commerce\Actions\ProcessPaymentSuccessAction;
use App\Domain\Commerce\Models\Order;
use App\Infrastructure\Gateways\Payment\PaymentGateway;
use App\Infrastructure\Models\WebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    public function handleStripe(
        Request $request,
        PaymentGateway $paymentGateway,
        ProcessPaymentSuccessAction $successAction
    ): JsonResponse {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature', '');

        // Verify webhook signature
        if (! $paymentGateway->verifyWebhookSignature($payload, $sigHeader)) {
            return response()->json(['error' => 'Invalid webhook signature.'], 400);
        }

        $data = json_decode($payload, true);
        $eventId = (string) ($data['id'] ?? Str::uuid());
        $eventType = (string) ($data['type'] ?? 'unknown');

        // Deduplication check via webhook_events unique constraint
        $existing = WebhookEvent::query()
            ->where('gateway', 'stripe')
            ->where('gateway_event_id', $eventId)
            ->first();

        if ($existing && $existing->status === 'processed') {
            return response()->json(['received' => true, 'duplicate' => true]);
        }

        /** @var WebhookEvent $eventRecord */
        $eventRecord = WebhookEvent::firstOrCreate(
            ['gateway' => 'stripe', 'gateway_event_id' => $eventId],
            [
                'id' => (string) Str::ulid(),
                'event_type' => $eventType,
                'payload' => $data,
                'status' => 'pending',
            ]
        );

        // Process economic events
        if ($eventType === 'payment_intent.succeeded') {
            $intentObject = $data['data']['object'] ?? [];
            $intentId = (string) ($intentObject['id'] ?? '');

            /** @var Order|null $order */
            $order = Order::query()->where('gateway_intent_id', $intentId)->first();

            if (! $order && isset($intentObject['metadata']['order_id'])) {
                $order = Order::query()->where('ulid', $intentObject['metadata']['order_id'])->first();
            }

            if ($order) {
                $successAction->execute($order);
            }
        }

        $eventRecord->update([
            'status' => 'processed',
            'processed_at' => now(),
        ]);

        return response()->json(['received' => true]);
    }
}
