<?php

declare(strict_types=1);

namespace App\Domain\Identity\Http\Controllers;

use App\Domain\Identity\Actions\HandleSocialAuthAction;
use App\Domain\Identity\DTOs\SocialAuthData;
use App\Domain\Identity\Http\Requests\SocialLoginRequest;
use App\Domain\Identity\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthController extends Controller
{
    public function redirect(string $provider): JsonResponse
    {
        if (! in_array($provider, ['google', 'apple', 'facebook'], true)) {
            return response()->json([
                'error' => [
                    'code' => 'unsupported_provider',
                    'message' => 'The requested social provider is not supported.',
                    'details' => [],
                    'correlation_id' => request()->header('X-Correlation-ID'),
                ],
            ], 400);
        }

        $targetUrl = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();

        return response()->json([
            'data' => [
                'provider' => $provider,
                'redirect_url' => $targetUrl,
            ],
        ]);
    }

    public function callback(SocialLoginRequest $request, string $provider, HandleSocialAuthAction $action): JsonResponse
    {
        $accessToken = $request->validated('access_token');

        /** @var \Laravel\Socialite\Contracts\User $socialUser */
        $socialUser = Socialite::driver($provider)->userFromToken($accessToken);

        $dto = new SocialAuthData(
            provider: $provider,
            providerUserId: (string) $socialUser->getId(),
            email: (string) $socialUser->getEmail(),
            name: (string) $socialUser->getName(),
            avatar: $socialUser->getAvatar(),
            token: $accessToken
        );

        $result = $action->execute(
            data: $dto,
            ip: $request->ip(),
            userAgent: $request->userAgent()
        );

        return response()->json([
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => $result['token_type'],
            ],
            'message' => 'Social login successful.',
        ]);
    }
}
