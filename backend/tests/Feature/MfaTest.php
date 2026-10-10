<?php

use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use App\Domain\Identity\Services\TotpService;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('it enables, confirms and verifies totp mfa lifecycle', function () {
    $user = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'MFA User',
        'email' => 'mfa@example.com',
        'password' => Hash::make('Password123!'),
        'status' => AccountStatus::ACTIVE->value,
    ]);
    $user->assignRole(UserRole::LEARNER->value);

    $this->actingAs($user);

    // 1. Enable MFA endpoint
    $enableResponse = $this->postJson('/api/v1/auth/mfa/enable');
    $enableResponse->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['secret', 'qr_code_url', 'recovery_codes'],
        ]);

    $secret = $enableResponse->json('data.secret');
    $user->refresh();
    expect($user->mfa_enabled)->toBeFalse();

    // 2. Generate valid TOTP code using service
    $totpService = app(TotpService::class);
    $timeSlice = (int) floor(time() / 30);
    $reflection = new ReflectionClass($totpService);
    $method = $reflection->getMethod('calculateCode');
    $method->setAccessible(true);
    $validCode = $method->invoke($totpService, $secret, $timeSlice);

    // 3. Confirm MFA with valid code
    $confirmResponse = $this->postJson('/api/v1/auth/mfa/confirm', [
        'code' => $validCode,
    ]);
    $confirmResponse->assertStatus(200);

    $user->refresh();
    expect($user->mfa_enabled)->toBeTrue();
    expect($user->mfa_confirmed_at)->not->toBeNull();

    // 4. Login now requires MFA code
    $loginAttempt = $this->postJson('/api/v1/auth/login', [
        'email' => 'mfa@example.com',
        'password' => 'Password123!',
    ]);
    $loginAttempt->assertStatus(200)
        ->assertJson([
            'requires_mfa' => true,
        ]);

    // 5. Login with recovery code succeeds
    $recoveryCode = $user->mfa_recovery_codes[0];
    $mfaLogin = $this->postJson('/api/v1/auth/login', [
        'email' => 'mfa@example.com',
        'password' => 'Password123!',
        'totp_code' => $recoveryCode,
    ]);
    $mfaLogin->assertStatus(200)
        ->assertJsonStructure(['data' => ['token', 'user']]);

    // Recovery code should be consumed
    $user->refresh();
    expect($user->mfa_recovery_codes)->not->toContain($recoveryCode);
});
