<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\DTOs\UpdateProfileData;
use App\Domain\Identity\Models\User;

class UpdateProfileAction
{
    public function execute(User $user, UpdateProfileData $data): User
    {
        $attributes = array_filter([
            'name' => $data->name,
            'headline' => $data->headline,
            'bio' => $data->bio,
            'avatar_url' => $data->avatarUrl,
            'locale' => $data->locale,
            'timezone' => $data->timezone,
        ], fn ($val) => $val !== null);

        if (! empty($attributes)) {
            $user->update($attributes);
        }

        return $user->fresh();
    }
}
