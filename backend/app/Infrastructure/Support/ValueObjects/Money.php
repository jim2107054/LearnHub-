<?php

declare(strict_types=1);

namespace App\Infrastructure\Support\ValueObjects;

use InvalidArgumentException;
use JsonSerializable;
use Stringable;

final readonly class Money implements JsonSerializable, Stringable
{
    public function __construct(
        public int $amount,
        public string $currency = 'USD'
    ) {
        if (trim($currency) === '') {
            throw new InvalidArgumentException('Currency code must not be empty.');
        }
    }

    public static function fromCents(int $amount, string $currency = 'USD'): self
    {
        return new self($amount, strtoupper(trim($currency)));
    }

    public static function zero(string $currency = 'USD'): self
    {
        return new self(0, strtoupper(trim($currency)));
    }

    public function add(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amount + $other->amount, $this->currency);
    }

    public function subtract(self $other): self
    {
        $this->ensureSameCurrency($other);

        return new self($this->amount - $other->amount, $this->currency);
    }

    public function multiply(float|int $multiplier): self
    {
        $newAmount = (int) round($this->amount * $multiplier);

        return new self($newAmount, $this->currency);
    }

    public function percentage(float|int $percent): self
    {
        $newAmount = (int) round(($this->amount * $percent) / 100);

        return new self($newAmount, $this->currency);
    }

    public function equals(self $other): bool
    {
        return $this->amount === $other->amount && $this->currency === $other->currency;
    }

    public function isGreaterThan(self $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amount > $other->amount;
    }

    public function isLessThan(self $other): bool
    {
        $this->ensureSameCurrency($other);

        return $this->amount < $other->amount;
    }

    public function isZero(): bool
    {
        return $this->amount === 0;
    }

    public function isPositive(): bool
    {
        return $this->amount > 0;
    }

    public function isNegative(): bool
    {
        return $this->amount < 0;
    }

    public function toMajorUnits(): float
    {
        return $this->amount / 100;
    }

    public function format(): string
    {
        return (string) $this;
    }

    private function ensureSameCurrency(self $other): void
    {
        if ($this->currency !== $other->currency) {
            throw new InvalidArgumentException(
                sprintf('Currency mismatch: cannot operate between %s and %s.', $this->currency, $other->currency)
            );
        }
    }

    /**
     * @return array{amount: int, currency: string, formatted: string}
     */
    public function toArray(): array
    {
        return [
            'amount' => $this->amount,
            'currency' => $this->currency,
            'formatted' => (string) $this,
        ];
    }

    /**
     * @return array{amount: int, currency: string}
     */
    public function jsonSerialize(): array
    {
        return [
            'amount' => $this->amount,
            'currency' => $this->currency,
        ];
    }

    public function __toString(): string
    {
        return sprintf('%s %0.2f', $this->currency, $this->toMajorUnits());
    }
}
