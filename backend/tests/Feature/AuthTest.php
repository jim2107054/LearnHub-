<?php

use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
});

test('it registers a new user with learner role', function () {
    $payload = [
        'name' => 'Alice Doe',
        'email' => 'alice@example.com',
        'password' => 'SecurePass123!',
        'terms_accepted' => true,
        'terms_version' => 'v1.0',
    ];

    $response = $this->postJson('/api/v1/auth/register', $payload);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'user' => ['id', 'name', 'email', 'roles', 'status'],
                'token',
                'token_type',
            ],
            'message',
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'alice@example.com',
        'name' => 'Alice Doe',
        'status' => AccountStatus::ACTIVE->value,
    ]);

    $user = User::where('email', 'alice@example.com')->first();
    expect($user->hasRole(UserRole::LEARNER->value))->toBeTrue();
});

test('it prevents registration with duplicate email', function () {
    User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Existing User',
        'email' => 'duplicate@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);

    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Another User',
        'email' => 'duplicate@example.com',
        'password' => 'AnotherSecret123!',
        'terms_accepted' => true,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('it authenticates a user with correct credentials', function () {
    $user = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Bob Test',
        'email' => 'bob@example.com',
        'password' => Hash::make('ValidPassword123!'),
        'status' => AccountStatus::ACTIVE->value,
    ]);
    $user->assignRole(UserRole::LEARNER->value);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'bob@example.com',
        'password' => 'ValidPassword123!',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'user' => ['id', 'email'],
                'token',
            ],
        ]);
});

test('it locks out user after 5 failed login attempts', function () {
    $user = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Victim User',
        'email' => 'victim@example.com',
        'password' => Hash::make('CorrectPassword123!'),
        'status' => AccountStatus::ACTIVE->value,
    ]);
    $user->assignRole(UserRole::LEARNER->value);

    for ($i = 0; $i < 5; $i++) {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'victim@example.com',
            'password' => 'WrongPassword',
        ]);
        $response->assertStatus(422);
    }

    $user->refresh();
    expect($user->isLocked())->toBeTrue();
    expect($user->failed_login_attempts)->toBe(5);

    // 6th attempt should return 423 Locked
    $lockedResponse = $this->postJson('/api/v1/auth/login', [
        'email' => 'victim@example.com',
        'password' => 'CorrectPassword123!',
    ]);

    $lockedResponse->assertStatus(423);
});

test('it fetches authenticated user profile and allows updating', function () {
    $user = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Profile User',
        'email' => 'profile@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => AccountStatus::ACTIVE->value,
    ]);
    $user->assignRole(UserRole::LEARNER->value);

    $this->actingAs($user);

    $getResponse = $this->getJson('/api/v1/me');
    $getResponse->assertStatus(200)
        ->assertJsonPath('data.email', 'profile@example.com');

    $patchResponse = $this->patchJson('/api/v1/profile', [
        'headline' => 'Budding Software Engineer',
        'bio' => 'Passionate about distributed systems.',
    ]);

    $patchResponse->assertStatus(200)
        ->assertJsonPath('data.headline', 'Budding Software Engineer');

    $this->assertDatabaseHas('users', [
        'email' => 'profile@example.com',
        'headline' => 'Budding Software Engineer',
    ]);
});
