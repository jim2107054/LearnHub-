<?php

use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->user = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Security Audit User',
        'email' => 'audit_user@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->user->assignRole(UserRole::LEARNER->value);

    $this->actingAs($this->user);
});

test('it verifies deep subsystem health probe endpoint', function () {
    $response = $this->getJson('/api/v1/health/deep');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'timestamp',
            'checks' => [
                'database_pooler' => ['status', 'latency_ms'],
                'redis_cache' => ['status', 'latency_ms'],
                'storage_disk' => ['status'],
            ],
        ]);
});

test('it verifies OWASP ASVS L2 security headers are enforced across API responses', function () {
    $response = $this->getJson('/api/v1/version');

    $response->assertStatus(200);
    $response->assertHeader('X-Content-Type-Options', 'nosniff');
    $response->assertHeader('X-Frame-Options', 'SAMEORIGIN');
    $response->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
});

test('it verifies GDPR data export package contains user records and enrollments', function () {
    $response = $this->postJson('/api/v1/profile/export-data');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'profile' => ['id', 'name', 'email', 'created_at'],
                'enrollments',
                'orders',
                'certificates',
                'notes',
                'exported_at',
            ],
            'message',
        ]);
});
