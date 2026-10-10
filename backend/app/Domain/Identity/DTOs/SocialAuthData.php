<?php

declare(strict_types=1);

namespace App\Domain\Identity\DTOs;

final readonly class SocialAuthData
{
    public function __construct(
        public string $provider,
        public string $providerUserId,
        public string $email,
        public string $name,
        public ?string $avatar = null,
        public ?string $token = null,
        public ?string $refreshToken = null,
    ) {}
}
