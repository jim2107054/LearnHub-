<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\DTOs\LoginData;
use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Events\UserLoggedIn;
use App\Domain\Identity\Events\UserLockedOut;
use App\Domain\Identity\Models\User;
use App\Domain\Identity\Models\UserDeviceSession;
use App\Domain\Identity\Services\TotpService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;

class AuthenticateUserAction
{
    public function __construct(
        protected TotpService $totpService
    ) {}

    /**
     * @return array{user: User, token: string, token_type: string}|array{requires_mfa: bool, user_ulid: string}
     */
    public function execute(LoginData $data): array
    {
        /** @var User|null $user */
        $user = User::query()->where('email', $data->email)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Check if account is temporarily locked
        if ($user->isLocked()) {
            $remainingMinutes = (int) now()->diffInMinutes($user->locked_until, false);
            throw new HttpException(
                423,
                sprintf('Your account is locked due to too many failed attempts. Try again in %d minutes.', max(1, $remainingMinutes))
            );
        }

        // Verify password
        if (! Hash::check($data->password, $user->password)) {
            $user->increment('failed_login_attempts');

            if ($user->failed_login_attempts >= 5) {
                $user->update([
                    'locked_until' => now()->addMinutes(15),
                ]);

                event(new UserLockedOut($user, $data->ipAddress ?? 'unknown', 15));
            }

            throw ValidationException::withMessages([
                'email' => ['The provided credentials do not match our records.'],
            ]);
        }

        // Check account status
        if ($user->status !== AccountStatus::ACTIVE->value) {
            throw ValidationException::withMessages([
                'email' => ['This account is not active. Please contact support.'],
            ]);
        }

        // Check MFA requirement
        $requiresMfa = $user->mfa_enabled
            || $user->hasRole(UserRole::SUPER_ADMIN->value)
            || $user->hasRole(UserRole::FINANCE->value);

        if ($requiresMfa) {
            if ($data->totpCode === null || trim($data->totpCode) === '') {
                return [
                    'requires_mfa' => true,
                    'user_ulid' => $user->ulid,
                ];
            }

            $mfaValid = false;
            $recoveryCodes = (array) ($user->mfa_recovery_codes ?? []);

            if (in_array(strtoupper(trim($data->totpCode)), $recoveryCodes, true)) {
                $mfaValid = true;
                // Remove used recovery code
                $user->mfa_recovery_codes = array_values(array_diff($recoveryCodes, [strtoupper(trim($data->totpCode))]));
                $user->save();
            } elseif ($user->mfa_secret && $this->totpService->verifyCode($user->mfa_secret, $data->totpCode)) {
                $mfaValid = true;
            }

            if (! $mfaValid) {
                throw ValidationException::withMessages([
                    'totp_code' => ['The provided two-factor authentication code is invalid.'],
                ]);
            }
        }

        // Reset lockout counters upon successful authentication
        $user->update([
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ]);

        // Generate Sanctum token
        $tokenResult = $user->createToken($data->deviceName ?? 'api-token');

        // Track active device session
        UserDeviceSession::query()->create([
            'user_id' => $user->id,
            'ip_address' => $data->ipAddress,
            'user_agent' => $data->userAgent,
            'last_active_at' => now(),
            'is_revoked' => false,
        ]);

        event(new UserLoggedIn($user, $data->ipAddress, $data->userAgent));

        return [
            'user' => $user,
            'token' => $tokenResult->plainTextToken,
            'token_type' => 'Bearer',
        ];
    }
}
