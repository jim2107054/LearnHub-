<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Events\MfaEnabled;
use App\Domain\Identity\Models\User;
use App\Domain\Identity\Services\TotpService;
use Illuminate\Validation\ValidationException;

class ConfirmTotpMfaAction
{
    public function __construct(
        protected TotpService $totpService
    ) {}

    public function execute(User $user, string $code): bool
    {
        if (! $user->mfa_secret) {
            throw ValidationException::withMessages([
                'code' => ['Two-factor authentication has not been initiated.'],
            ]);
        }

        if (! $this->totpService->verifyCode($user->mfa_secret, $code)) {
            throw ValidationException::withMessages([
                'code' => ['The provided two-factor authentication code is invalid.'],
            ]);
        }

        $user->forceFill([
            'mfa_enabled' => true,
            'mfa_confirmed_at' => now(),
        ])->save();

        event(new MfaEnabled($user));

        return true;
    }
}
