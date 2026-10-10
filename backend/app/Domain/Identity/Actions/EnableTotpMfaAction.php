<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Models\User;
use App\Domain\Identity\Services\TotpService;

class EnableTotpMfaAction
{
    public function __construct(
        protected TotpService $totpService
    ) {}

    /**
     * @return array{secret: string, qr_code_url: string, recovery_codes: array<int, string>}
     */
    public function execute(User $user): array
    {
        $secret = $this->totpService->generateSecret();
        $recoveryCodes = $this->totpService->generateRecoveryCodes();

        $user->forceFill([
            'mfa_secret' => $secret,
            'mfa_recovery_codes' => $recoveryCodes,
            'mfa_enabled' => false, // Will become true after verification step
            'mfa_confirmed_at' => null,
        ])->save();

        $qrCodeUrl = $this->totpService->getQrCodeUrl(
            company: config('app.name', 'LearnHub'),
            email: $user->email,
            secret: $secret
        );

        return [
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
            'recovery_codes' => $recoveryCodes,
        ];
    }
}
