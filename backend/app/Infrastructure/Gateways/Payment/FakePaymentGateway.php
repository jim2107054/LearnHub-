<?php

declare(strict_types=1);

namespace App\Infrastructure\Gateways\Payment;

use App\Infrastructure\Support\ValueObjects\Money;
use Illuminate\Support\Str;

class FakePaymentGateway implements PaymentGateway
{
    /** @var array<string, array<string, mixed>> */
    public array $createdIntents = [];

    /** @var array<string, array<string, mixed>> */
    public array $refunds = [];

    public bool $signatureValid = true;

    public function createPaymentIntent(Money $amount, string $orderId, array $metadata = []): array
    {
        $id = 'pi_fake_'.Str::random(24);
        $clientSecret = $id.'_secret_'.Str::random(16);

        $intent = [
            'id' => $id,
            'client_secret' => $clientSecret,
            'status' => 'requires_payment_method',
            'amount' => $amount->amount,
            'currency' => $amount->currency,
            'order_id' => $orderId,
            'metadata' => $metadata,
        ];

        $this->createdIntents[$id] = $intent;

        return [
            'id' => $id,
            'client_secret' => $clientSecret,
            'status' => 'requires_payment_method',
        ];
    }

    public function refund(string $paymentIntentId, Money $amount, string $reason = ''): array
    {
        $refundId = 're_fake_'.Str::random(24);

        $record = [
            'id' => $refundId,
            'payment_intent_id' => $paymentIntentId,
            'amount' => $amount->amount,
            'currency' => $amount->currency,
            'status' => 'succeeded',
            'reason' => $reason,
        ];

        $this->refunds[$refundId] = $record;

        return [
            'id' => $refundId,
            'status' => 'succeeded',
            'amount' => $amount->amount,
        ];
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        return $this->signatureValid;
    }
}
