<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\DTOs\RegisterData;
use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Events\UserRegistered;
use App\Domain\Identity\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class RegisterUserAction
{
    public function execute(RegisterData $data): User
    {
        $user = User::query()->create([
            'ulid' => (string) Str::ulid(),
            'name' => $data->name,
            'email' => $data->email,
            'password' => Hash::make($data->password),
            'terms_version' => $data->termsVersion,
            'terms_accepted_at' => now(),
            'locale' => $data->locale ?? 'en',
            'timezone' => $data->timezone ?? 'UTC',
            'status' => AccountStatus::ACTIVE->value,
        ]);

        // Assign default learner role
        $user->assignRole(UserRole::LEARNER->value);

        event(new UserRegistered($user));

        return $user;
    }
}
