<?php

declare(strict_types=1);

namespace App\Infrastructure\Gateways\Payment;

use App\Infrastructure\Support\ValueObjects\Money;

interface PaymentGateway
{
    /**
     * Create a payment intent or checkout session at the gateway.
     *
     * @param  array<string, mixed>  $metadata
     * @return array{id: string, client_secret: string, status: string}
     */
    public function createPaymentIntent(Money $amount, string $orderId, array $metadata = []): array;

    /**
     * Issue a full or partial refund for a processed payment.
     *
     * @return array{id: string, status: string, amount: int}
     */
    public function refund(string $paymentIntentId, Money $amount, string $reason = ''): array;

    /**
     * Verify the authenticity of an inbound webhook signature.
     */
    public function verifyWebhookSignature(string $payload, string $signature): bool;
}
