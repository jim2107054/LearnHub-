<?php

declare(strict_types=1);

namespace App\Domain\Identity\DTOs;

final readonly class UpdateProfileData
{
    public function __construct(
        public ?string $name = null,
        public ?string $headline = null,
        public ?string $bio = null,
        public ?string $avatarUrl = null,
        public ?string $locale = null,
        public ?string $timezone = null,
    ) {}

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            name: isset($data['name']) ? (string) $data['name'] : null,
            headline: isset($data['headline']) ? (string) $data['headline'] : null,
            bio: isset($data['bio']) ? (string) $data['bio'] : null,
            avatarUrl: isset($data['avatar_url']) ? (string) $data['avatar_url'] : null,
            locale: isset($data['locale']) ? (string) $data['locale'] : null,
            timezone: isset($data['timezone']) ? (string) $data['timezone'] : null,
        );
    }
}
