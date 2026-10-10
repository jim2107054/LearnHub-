<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Events\AccountDeletionRequested;
use App\Domain\Identity\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RequestAccountDeletionAction
{
    public function execute(User $user, string $password): bool
    {
        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        $user->update([
            'status' => AccountStatus::DELETION_PENDING->value,
            'deletion_requested_at' => now(),
        ]);

        // Revoke all tokens
        $user->tokens()->delete();

        event(new AccountDeletionRequested($user));

        return true;
    }
}
