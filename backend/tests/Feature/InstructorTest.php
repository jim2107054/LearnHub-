<?php

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->instructor = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Prof. Alan Turing',
        'email' => 'turing@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->actingAs($this->instructor);
});

test('it creates a new course draft', function () {
    $response = $this->postJson('/api/v1/instructor/courses', [
        'title' => 'Advanced Algorithms & Computability',
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.title', 'Advanced Algorithms & Computability')
        ->assertJsonPath('data.status', 'draft');

    $this->assertDatabaseHas('courses', [
        'title' => 'Advanced Algorithms & Computability',
        'primary_instructor_id' => $this->instructor->id,
    ]);
});

test('it updates course metadata, pricing, and objectives', function () {
    $course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Draft Course',
        'slug' => 'draft-course',
        'status' => CourseStatus::DRAFT,
        'price_amount' => 0,
    ]);

    $response = $this->patchJson("/api/v1/instructor/courses/{$course->ulid}", [
        'subtitle' => 'The ultimate practical guide',
        'price_amount' => 2999, // $29.99
        'what_you_will_learn' => [
            'Master state machines',
            'Implement video pipelines',
            'Handle webhooks',
            'Secure financial ledger',
        ],
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.price_amount', 2999);

    $course->refresh();
    expect($course->price_amount)->toBe(2999);
    expect(count($course->what_you_will_learn))->toBe(4);
});

test('it adds curriculum section and lectures', function () {
    $course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Curriculum Course',
        'slug' => 'curriculum-course',
        'status' => CourseStatus::DRAFT,
    ]);

    // 1. Add Section
    $secResponse = $this->postJson("/api/v1/instructor/courses/{$course->ulid}/sections", [
        'title' => 'Module 1: Foundations',
    ]);
    $secResponse->assertStatus(201);
    $sectionUlid = $secResponse->json('data.ulid');

    // 2. Add Lecture
    $lecResponse = $this->postJson("/api/v1/instructor/courses/{$course->ulid}/sections/{$sectionUlid}/lectures", [
        'title' => 'Lecture 1.1: Architecture Overview',
        'lecture_type' => 'video',
        'duration_seconds' => 600,
        'is_preview' => true,
    ]);
    $lecResponse->assertStatus(201)
        ->assertJsonPath('data.title', 'Lecture 1.1: Architecture Overview')
        ->assertJsonPath('data.is_preview', true);
});

test('it validates pre-publish requirements and fails incomplete course', function () {
    $course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Incomplete Course',
        'slug' => 'incomplete-course',
        'status' => CourseStatus::DRAFT,
    ]);

    $response = $this->getJson("/api/v1/instructor/courses/{$course->ulid}/validate");

    $response->assertStatus(200)
        ->assertJsonPath('data.is_valid', false);

    $checklist = $response->json('data.checklist');
    expect($checklist['has_sections']['passed'])->toBeFalse();
    expect($checklist['has_minimum_lectures']['passed'])->toBeFalse();
});

test('it blocks deletion if course has enrollments (BR-09)', function () {
    $course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Enrolled Course',
        'slug' => 'enrolled-course',
        'status' => CourseStatus::PUBLISHED,
        'enrollments_count' => 15, // Has students!
    ]);

    $response = $this->deleteJson("/api/v1/instructor/courses/{$course->ulid}");
    $response->assertStatus(422);

    $this->assertDatabaseHas('courses', ['id' => $course->id]);
});

test('it creates instructor coupons', function () {
    $response = $this->postJson('/api/v1/instructor/coupons', [
        'code' => 'OCTOBER50',
        'discount_type' => 'percentage',
        'discount_value' => 50,
        'max_uses' => 100,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.code', 'OCTOBER50')
        ->assertJsonPath('data.discount_value', 50);

    $this->assertDatabaseHas('coupons', [
        'code' => 'OCTOBER50',
        'instructor_id' => $this->instructor->id,
    ]);
});
