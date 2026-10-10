<?php

declare(strict_types=1);

namespace App\Domain\Identity\DTOs;

final readonly class RegisterData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $termsVersion,
        public ?string $locale = 'en',
        public ?string $timezone = 'UTC',
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: (string) $data['name'],
            email: strtolower(trim((string) $data['email'])),
            password: (string) $data['password'],
            termsVersion: (string) ($data['terms_version'] ?? 'v1.0'),
            locale: isset($data['locale']) ? (string) $data['locale'] : 'en',
            timezone: isset($data['timezone']) ? (string) $data['timezone'] : 'UTC',
        );
    }
}
