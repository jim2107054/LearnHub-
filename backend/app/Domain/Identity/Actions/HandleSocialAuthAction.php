<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\DTOs\SocialAuthData;
use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Events\UserLoggedIn;
use App\Domain\Identity\Events\UserRegistered;
use App\Domain\Identity\Models\User;
use App\Domain\Identity\Models\UserDeviceSession;
use App\Domain\Identity\Models\UserSocialAccount;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class HandleSocialAuthAction
{
    /**
     * @return array{user: User, token: string, token_type: string}
     */
    public function execute(SocialAuthData $data, ?string $ip = null, ?string $userAgent = null): array
    {
        /** @var UserSocialAccount|null $socialAccount */
        $socialAccount = UserSocialAccount::query()
            ->where('provider', $data->provider)
            ->where('provider_user_id', $data->providerUserId)
            ->first();

        if ($socialAccount) {
            $user = $socialAccount->user;
            $socialAccount->update([
                'token' => $data->token,
                'refresh_token' => $data->refreshToken,
                'avatar' => $data->avatar,
            ]);
        } else {
            /** @var User|null $user */
            $user = User::query()->where('email', $data->email)->first();

            if (! $user) {
                $user = User::query()->create([
                    'ulid' => (string) Str::ulid(),
                    'name' => $data->name,
                    'email' => $data->email,
                    'password' => Hash::make(Str::random(32)),
                    'avatar_url' => $data->avatar,
                    'email_verified_at' => now(),
                    'status' => AccountStatus::ACTIVE->value,
                    'terms_version' => 'v1.0',
                    'terms_accepted_at' => now(),
                ]);

                $user->assignRole(UserRole::LEARNER->value);

                event(new UserRegistered($user));
            }

            UserSocialAccount::query()->create([
                'user_id' => $user->id,
                'provider' => $data->provider,
                'provider_user_id' => $data->providerUserId,
                'token' => $data->token,
                'refresh_token' => $data->refreshToken,
                'avatar' => $data->avatar,
            ]);
        }

        $tokenResult = $user->createToken('social-auth-token');

        UserDeviceSession::query()->create([
            'user_id' => $user->id,
            'ip_address' => $ip,
            'user_agent' => $userAgent,
            'last_active_at' => now(),
            'is_revoked' => false,
        ]);

        event(new UserLoggedIn($user, $ip, $userAgent));

        return [
            'user' => $user,
            'token' => $tokenResult->plainTextToken,
            'token_type' => 'Bearer',
        ];
    }
}
