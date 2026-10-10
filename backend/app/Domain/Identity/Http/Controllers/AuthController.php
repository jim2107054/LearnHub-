<?php

declare(strict_types=1);

namespace App\Domain\Identity\Http\Controllers;

use App\Domain\Identity\Actions\AuthenticateUserAction;
use App\Domain\Identity\Actions\RegisterUserAction;
use App\Domain\Identity\DTOs\LoginData;
use App\Domain\Identity\DTOs\RegisterData;
use App\Domain\Identity\Http\Requests\ForgotPasswordRequest;
use App\Domain\Identity\Http\Requests\LoginRequest;
use App\Domain\Identity\Http\Requests\RegisterRequest;
use App\Domain\Identity\Http\Requests\ResetPasswordRequest;
use App\Domain\Identity\Http\Resources\UserResource;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request, RegisterUserAction $action): JsonResponse
    {
        $dto = RegisterData::fromArray($request->validated());
        $user = $action->execute($dto);

        $tokenResult = $user->createToken('register-token');

        return response()->json([
            'data' => [
                'user' => new UserResource($user),
                'token' => $tokenResult->plainTextToken,
                'token_type' => 'Bearer',
            ],
            'message' => 'Registration successful.',
        ], 201);
    }

    public function login(LoginRequest $request, AuthenticateUserAction $action): JsonResponse
    {
        $dto = LoginData::fromArray(
            data: $request->validated(),
            ip: $request->ip(),
            userAgent: $request->userAgent()
        );

        $result = $action->execute($dto);

        if (isset($result['requires_mfa']) && $result['requires_mfa'] === true) {
            return response()->json([
                'requires_mfa' => true,
                'user_id' => $result['user_ulid'],
                'message' => 'Two-factor authentication code required.',
            ], 200);
        }

        return response()->json([
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'token_type' => $result['token_type'],
            ],
            'message' => 'Login successful.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var User|null $user */
        $user = $request->user();

        if ($user) {
            // Revoke current Sanctum token
            $user->currentAccessToken()?->delete();
        }

        return response()->json([
            'message' => 'Successfully logged out.',
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->validated('email');
        /** @var User|null $user */
        $user = User::query()->where('email', $email)->first();

        if ($user) {
            $token = Str::random(64);

            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // In production or dev, queued email is dispatched; here token recorded
        }

        return response()->json([
            'message' => 'If your email is registered, you will receive a password reset link.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $record = DB::table('password_reset_tokens')
            ->where('email', $request->validated('email'))
            ->first();

        if (! $record || ! Hash::check($request->validated('token'), $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['The password reset token is invalid or expired.'],
            ]);
        }

        /** @var User|null $user */
        $user = User::query()->where('email', $request->validated('email'))->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ['User not found.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($request->validated('password')),
            'remember_token' => Str::random(60),
        ])->save();

        DB::table('password_reset_tokens')->where('email', $request->validated('email'))->delete();

        // Revoke all tokens on password reset for security
        $user->tokens()->delete();

        return response()->json([
            'message' => 'Password reset successful. Please login with your new password.',
        ]);
    }
}
