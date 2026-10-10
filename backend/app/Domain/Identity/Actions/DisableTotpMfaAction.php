<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Events\MfaDisabled;
use App\Domain\Identity\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class DisableTotpMfaAction
{
    public function execute(User $user, string $password): bool
    {
        // Enforce role requirement: Super Admin and Finance roles cannot disable MFA
        if ($user->hasRole(UserRole::SUPER_ADMIN->value) || $user->hasRole(UserRole::FINANCE->value)) {
            throw ValidationException::withMessages([
                'mfa' => ['Multi-factor authentication is mandatory for your administrative role and cannot be disabled.'],
            ]);
        }

        if (! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The provided password is incorrect.'],
            ]);
        }

        $user->forceFill([
            'mfa_enabled' => false,
            'mfa_secret' => null,
            'mfa_recovery_codes' => null,
            'mfa_confirmed_at' => null,
        ])->save();

        event(new MfaDisabled($user));

        return true;
    }
}
