<?php

declare(strict_types=1);

namespace App\Domain\Identity\Policies;

use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;

class UserPolicy
{
    public function view(User $authenticatedUser, User $targetUser): bool
    {
        return $authenticatedUser->id === $targetUser->id
            || $authenticatedUser->hasAnyRole([UserRole::SUPER_ADMIN->value, UserRole::SUPPORT->value]);
    }

    public function update(User $authenticatedUser, User $targetUser): bool
    {
        return $authenticatedUser->id === $targetUser->id
            || $authenticatedUser->hasRole(UserRole::SUPER_ADMIN->value);
    }

    public function delete(User $authenticatedUser, User $targetUser): bool
    {
        return $authenticatedUser->id === $targetUser->id
            || $authenticatedUser->hasRole(UserRole::SUPER_ADMIN->value);
    }

    public function revokeSession(User $authenticatedUser, User $targetUser): bool
    {
        return $authenticatedUser->id === $targetUser->id
            || $authenticatedUser->hasRole(UserRole::SUPER_ADMIN->value);
    }
}
