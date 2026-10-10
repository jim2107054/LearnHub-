<?php

declare(strict_types=1);

namespace App\Domain\Identity\DTOs;

final readonly class LoginData
{
    public function __construct(
        public string $email,
        public string $password,
        public ?string $totpCode = null,
        public ?string $deviceName = 'web',
        public ?string $ipAddress = null,
        public ?string $userAgent = null,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data, ?string $ip = null, ?string $userAgent = null): self
    {
        return new self(
            email: strtolower(trim((string) $data['email'])),
            password: (string) $data['password'],
            totpCode: isset($data['totp_code']) ? (string) $data['totp_code'] : null,
            deviceName: isset($data['device_name']) ? (string) $data['device_name'] : 'web',
            ipAddress: $ip,
            userAgent: $userAgent,
        );
    }
}
