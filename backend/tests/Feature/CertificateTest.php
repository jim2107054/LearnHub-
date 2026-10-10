<?php

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Certificate\Models\Certificate;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Models\Enrollment;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->instructor = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Certificate Instructor',
        'email' => 'cert_instructor@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->learner = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Graduating Learner',
        'email' => 'grad_learner@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->learner->assignRole(UserRole::LEARNER->value);

    $this->course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Fullstack Laravel Mastery',
        'slug' => 'fullstack-laravel-mastery',
        'status' => CourseStatus::PUBLISHED,
        'price_amount' => 8000,
        'price_currency' => 'USD',
    ]);

    $this->enrollment = Enrollment::create([
        'ulid' => (string) Str::ulid(),
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'progress_percent' => 50, // not yet finished
        'enrolled_at' => now(),
    ]);

    $this->actingAs($this->learner);
});

test('cannot issue certificate if learner has not reached 100 percent completion', function () {
    $response = $this->postJson("/api/v1/certificates/courses/{$this->course->ulid}/issue");

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['course']);
});

test('issues certificate upon reaching 100 percent completion and allows public verification', function () {
    // 1. Mark enrollment complete
    $this->enrollment->update([
        'progress_percent' => 100,
        'completed_at' => now(),
    ]);

    // 2. Issue certificate
    $response = $this->postJson("/api/v1/certificates/courses/{$this->course->ulid}/issue");

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'id',
                'certificate_code',
                'course' => ['id', 'title'],
                'student_name',
                'issued_at',
                'status',
                'verification_url',
            ],
            'message',
        ]);

    $certCode = $response->json('data.certificate_code');
    $this->assertStringStartsWith('CRT-', $certCode);

    // 3. Public verification endpoint (unauthenticated)
    $this->app['auth']->forgetGuards();

    $verifyResponse = $this->getJson("/api/v1/certificates/verify/{$certCode}");
    $verifyResponse->assertStatus(200)
        ->assertJson([
            'data' => [
                'certificate_code' => $certCode,
                'student_name' => 'Graduating Learner',
                'course_title' => 'Fullstack Laravel Mastery',
                'status' => 'valid',
                'is_valid' => true,
            ],
        ]);
});

test('public certificate verification returns 404 for invalid code', function () {
    $this->app['auth']->forgetGuards();

    $response = $this->getJson('/api/v1/certificates/verify/CRT-INVALID-CODE-999');
    $response->assertStatus(404)
        ->assertJson([
            'error' => [
                'code' => 'certificate_not_found',
            ],
        ]);
});
