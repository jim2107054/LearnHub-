<?php

declare(strict_types=1);

namespace App\Infrastructure\Gateways\Payment;

use App\Infrastructure\Support\ValueObjects\Money;
use Stripe\Exception\SignatureVerificationException;
use Stripe\PaymentIntent;
use Stripe\Refund;
use Stripe\Stripe;
use Stripe\Webhook;

class StripePaymentGateway implements PaymentGateway
{
    public function __construct(
        protected string $secretKey,
        protected string $webhookSecret
    ) {
        if ($this->secretKey !== '') {
            Stripe::setApiKey($this->secretKey);
        }
    }

    public function createPaymentIntent(Money $amount, string $orderId, array $metadata = []): array
    {
        $intent = PaymentIntent::create([
            'amount' => $amount->amount,
            'currency' => strtolower($amount->currency),
            'metadata' => array_merge($metadata, ['order_id' => $orderId]),
            'automatic_payment_methods' => ['enabled' => true],
        ]);

        return [
            'id' => (string) $intent->id,
            'client_secret' => (string) $intent->client_secret,
            'status' => (string) $intent->status,
        ];
    }

    public function refund(string $paymentIntentId, Money $amount, string $reason = ''): array
    {
        $refund = Refund::create([
            'payment_intent' => $paymentIntentId,
            'amount' => $amount->amount,
            'reason' => $reason !== '' ? $reason : 'requested_by_customer',
        ]);

        return [
            'id' => (string) $refund->id,
            'status' => (string) $refund->status,
            'amount' => (int) $refund->amount,
        ];
    }

    public function verifyWebhookSignature(string $payload, string $signature): bool
    {
        try {
            Webhook::constructEvent($payload, $signature, $this->webhookSecret);
            return true;
        } catch (SignatureVerificationException) {
            return false;
        }
    }
}
