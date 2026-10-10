<?php

use App\Domain\Admin\Models\AuditLog;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\CourseReviewSubmission;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->admin = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Platform Superadmin',
        'email' => 'superadmin@learnhub.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->admin->assignRole(UserRole::SUPER_ADMIN->value);

    $this->instructor = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Flagged Instructor',
        'email' => 'flagged@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Zero-Day Exploits and Defense',
        'slug' => 'zero-day-exploits-and-defense',
        'status' => CourseStatus::IN_REVIEW,
        'price_amount' => 9900,
        'price_currency' => 'USD',
    ]);

    $this->actingAs($this->admin);
});

test('admin can search, suspend, ban, and impersonate users with audit log', function () {
    // 1. Search users
    $searchRes = $this->getJson('/api/v1/admin/users?q=Flagged');
    $searchRes->assertStatus(200)
        ->assertJsonFragment(['email' => 'flagged@example.com']);

    // 2. Impersonate user (audited)
    $impRes = $this->postJson("/api/v1/admin/users/{$this->instructor->ulid}/impersonate");
    $impRes->assertStatus(200)
        ->assertJsonStructure([
            'data' => ['token', 'user'],
            'message',
        ]);

    $this->assertDatabaseHas('audit_logs', [
        'impersonator_id' => $this->admin->id,
        'user_id' => $this->instructor->id,
        'action' => 'user.impersonate',
    ]);

    // 3. Suspend user
    $suspRes = $this->postJson("/api/v1/admin/users/{$this->instructor->ulid}/suspend");
    $suspRes->assertStatus(200);
    $this->instructor->refresh();
    expect($this->instructor->status)->toBe(AccountStatus::SUSPENDED->value);

    // 4. Ban user
    $banRes = $this->postJson("/api/v1/admin/users/{$this->instructor->ulid}/ban");
    $banRes->assertStatus(200);
    $this->instructor->refresh();
    expect($this->instructor->status)->toBe(AccountStatus::BANNED->value);
});

test('moderator can approve course submission and publish course', function () {
    $submission = CourseReviewSubmission::create([
        'ulid' => (string) Str::ulid(),
        'course_id' => $this->course->id,
        'status' => 'submitted',
        'submitted_at' => now(),
    ]);

    $response = $this->postJson("/api/v1/admin/moderation/courses/{$submission->ulid}", [
        'decision' => 'approved',
        'feedback' => 'Meets all syllabus and audio quality criteria.',
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'status' => 'approved',
            ],
        ]);

    $this->course->refresh();
    expect($this->course->status)->toBe(CourseStatus::PUBLISHED);
    expect($this->course->published_at)->not->toBeNull();
});

test('admin can manage platform settings and feature flags', function () {
    // 1. Update setting
    $setRes = $this->postJson('/api/v1/admin/settings', [
        'key' => 'platform.commission_rate_percent',
        'value' => 30,
        'type' => 'integer',
        'is_public' => false,
    ]);
    $setRes->assertStatus(200);

    // 2. Update feature flag
    $flagRes = $this->postJson('/api/v1/admin/settings/flags/enterprise_sso', [
        'is_enabled' => true,
        'rollout_percentage' => 100,
    ]);
    $flagRes->assertStatus(200);

    // 3. Retrieve settings
    $listRes = $this->getJson('/api/v1/admin/settings');
    $listRes->assertStatus(200);
});

test('admin can ingest analytics events and view KPIs', function () {
    // 1. Ingest event
    $this->app['auth']->forgetGuards();
    $eventRes = $this->postJson('/api/v1/analytics/events', [
        'event_name' => 'course_view',
        'entity_type' => 'course',
        'entity_id' => $this->course->id,
        'consent_given' => true,
    ]);
    $eventRes->assertStatus(202);

    // 2. Admin view KPIs
    $this->actingAs($this->admin);
    $kpiRes = $this->getJson('/api/v1/admin/analytics/kpis');
    $kpiRes->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'gmv_amount',
                'platform_revenue_amount',
                'total_signups',
                'total_enrollments',
                'refunds_count',
                'currency',
            ],
        ]);

    // 3. Export CSV
    $csvRes = $this->getJson('/api/v1/admin/analytics/export/courses');
    $csvRes->assertStatus(200)
        ->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
});

test('admin can issue copyright strike and unpublish course', function () {
    $this->course->update(['status' => CourseStatus::PUBLISHED]);

    // 1. Ingest DMCA notice
    $dmcaRes = $this->postJson('/api/v1/admin/dmca', [
        'course_ulid' => $this->course->ulid,
        'claimant_name' => 'Cyber Security Publishers Inc.',
        'claimant_email' => 'legal@cspublishers.com',
        'infringing_work_url' => 'https://cspublishers.com/original-book',
        'notes' => 'Chapters 3 and 4 copied verbatim.',
    ]);
    $dmcaRes->assertStatus(201);
    $noticeUlid = $dmcaRes->json('data.ulid');

    // 2. Issue strike
    $strikeRes = $this->postJson("/api/v1/admin/dmca/{$noticeUlid}/strike");
    $strikeRes->assertStatus(200)
        ->assertJson([
            'data' => [
                'total_strikes' => 1,
                'instructor_suspended' => false,
            ],
        ]);

    $this->course->refresh();
    expect($this->course->status)->toBe(CourseStatus::UNPUBLISHED);
});
