<?php

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Enums\LectureType;
use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Catalog\Models\Section;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Models\Enrollment;
use App\Domain\Media\Models\MediaAsset;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->instructor = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Learning Instructor',
        'email' => 'lrn_instructor@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->learner = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Active Learner',
        'email' => 'active_learner@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->learner->assignRole(UserRole::LEARNER->value);

    $this->course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Concurrency & Systems',
        'slug' => 'concurrency-and-systems',
        'status' => CourseStatus::PUBLISHED,
        'price_amount' => 3000,
        'price_currency' => 'USD',
    ]);

    $this->section = Section::create([
        'ulid' => (string) Str::ulid(),
        'course_id' => $this->course->id,
        'title' => 'Section 1: Basics',
        'sort_order' => 1,
    ]);

    $this->previewLecture = Lecture::create([
        'ulid' => (string) Str::ulid(),
        'course_id' => $this->course->id,
        'section_id' => $this->section->id,
        'title' => 'Intro (Preview)',
        'lecture_type' => LectureType::VIDEO,
        'duration_seconds' => 300,
        'is_preview' => true,
        'sort_order' => 1,
    ]);

    $this->lockedLecture = Lecture::create([
        'ulid' => (string) Str::ulid(),
        'course_id' => $this->course->id,
        'section_id' => $this->section->id,
        'title' => 'Deep Dive (Locked)',
        'lecture_type' => LectureType::VIDEO,
        'duration_seconds' => 1000,
        'is_preview' => false,
        'sort_order' => 2,
    ]);

    MediaAsset::create([
        'ulid' => (string) Str::ulid(),
        'user_id' => $this->instructor->id,
        'lecture_id' => $this->lockedLecture->id,
        'filename' => 'deep_dive.mp4',
        'mime_type' => 'video/mp4',
        'size_bytes' => 10000000,
        'status' => 'ready',
        'storage_key' => 'raw/deep_dive.mp4',
        'hls_manifest_key' => 'hls/deep_dive/master.m3u8',
        'duration_seconds' => 1000,
    ]);

    $this->actingAs($this->learner);
});

test('it lists enrolled courses in My Learning', function () {
    Enrollment::create([
        'ulid' => (string) Str::ulid(),
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'progress_percent' => 25,
    ]);

    $response = $this->getJson('/api/v1/learning/enrollments');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'status', 'progress_percent', 'course'],
            ],
        ]);

    expect($response->json('data.0.progress_percent'))->toBe(25);
});

test('it permits access to free preview lecture without enrollment', function () {
    $response = $this->getJson("/api/v1/learning/courses/{$this->course->ulid}/lectures/{$this->previewLecture->ulid}");

    $response->assertStatus(200)
        ->assertJsonPath('data.lecture.id', $this->previewLecture->ulid);
});

test('it blocks non-enrolled learner from accessing locked lecture', function () {
    $response = $this->getJson("/api/v1/learning/courses/{$this->course->ulid}/lectures/{$this->lockedLecture->ulid}");

    $response->assertStatus(403);
});

test('it allows enrolled learner to stream locked lecture with signed URL', function () {
    Enrollment::create([
        'ulid' => (string) Str::ulid(),
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
        'status' => 'active',
    ]);

    $response = $this->getJson("/api/v1/learning/courses/{$this->course->ulid}/lectures/{$this->lockedLecture->ulid}");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'lecture',
                'playback' => ['hls_stream_url', 'last_position_seconds', 'is_completed'],
            ],
        ]);

    $url = $response->json('data.playback.hls_stream_url');
    expect($url)->not->toBeNull();
    expect($url)->toContain('master.m3u8');
});

test('it records playback position and evaluates 90 percent completion rule', function () {
    $enrollment = Enrollment::create([
        'ulid' => (string) Str::ulid(),
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
        'status' => 'active',
    ]);

    // 1. Send heartbeat at 50% (500s of 1000s) -> not completed
    $hb1 = $this->postJson("/api/v1/learning/courses/{$this->course->ulid}/lectures/{$this->lockedLecture->ulid}/progress", [
        'position_seconds' => 500,
    ]);
    $hb1->assertStatus(200)
        ->assertJsonPath('data.is_completed', false);

    // 2. Send heartbeat at 92% (920s of 1000s) -> completed!
    $hb2 = $this->postJson("/api/v1/learning/courses/{$this->course->ulid}/lectures/{$this->lockedLecture->ulid}/progress", [
        'position_seconds' => 920,
    ]);
    $hb2->assertStatus(200)
        ->assertJsonPath('data.is_completed', true);

    $enrollment->refresh();
    expect($enrollment->progress_percent)->toBeGreaterThan(0);
});

test('it creates and retrieves timestamped learning notes', function () {
    Enrollment::create([
        'ulid' => (string) Str::ulid(),
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
        'status' => 'active',
    ]);

    $createResponse = $this->postJson("/api/v1/learning/lectures/{$this->lockedLecture->ulid}/notes", [
        'timestamp_seconds' => 142,
        'body' => 'Remember to review mutex lock ordering here.',
    ]);
    $createResponse->assertStatus(201)
        ->assertJsonPath('data.timestamp_seconds', 142);

    $listResponse = $this->getJson("/api/v1/learning/lectures/{$this->lockedLecture->ulid}/notes");
    $listResponse->assertStatus(200);
    expect($listResponse->json('data.0.body'))->toContain('mutex lock');
});
