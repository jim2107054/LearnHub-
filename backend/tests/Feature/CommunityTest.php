<?php

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Community\Models\CourseReview;
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
        'name' => 'Community Instructor',
        'email' => 'com_instructor@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->learner = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Community Learner',
        'email' => 'com_learner@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->learner->assignRole(UserRole::LEARNER->value);

    $this->course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Kubernetes in Production',
        'slug' => 'kubernetes-in-production',
        'status' => CourseStatus::PUBLISHED,
        'price_amount' => 4500,
        'price_currency' => 'USD',
    ]);

    $this->enrollment = Enrollment::create([
        'ulid' => (string) Str::ulid(),
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
        'status' => 'active',
        'progress_percent' => 5, // less than 10% initially
        'enrolled_at' => now(),
    ]);

    $this->actingAs($this->learner);
});

test('learner with under 10 percent progress cannot leave a review', function () {
    $response = $this->postJson("/api/v1/courses/{$this->course->slug}/reviews", [
        'rating' => 5,
        'content' => 'Great course!',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['progress']);
});

test('learner with at least 10 percent progress can leave a review and it recalculates course rating', function () {
    // Update progress >= 10%
    $this->enrollment->update(['progress_percent' => 25]);

    $response = $this->postJson("/api/v1/courses/{$this->course->slug}/reviews", [
        'rating' => 5,
        'content' => 'Exceptional production setup tips!',
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'data' => [
                'rating' => 5,
                'content' => 'Exceptional production setup tips!',
            ],
        ]);

    $this->course->refresh();
    expect($this->course->reviews_count)->toBe(1);
    expect($this->course->rating_cache)->toBe(5.0);

    // Public review listing and rating distribution
    $this->app['auth']->forgetGuards();
    $listResponse = $this->getJson("/api/v1/courses/{$this->course->slug}/reviews");

    $listResponse->assertStatus(200)
        ->assertJsonStructure([
            'data',
            'meta' => [
                'rating',
                'total_reviews',
                'distribution' => [
                    '5' => ['count', 'percentage'],
                    '4' => ['count', 'percentage'],
                    '3' => ['count', 'percentage'],
                    '2' => ['count', 'percentage'],
                    '1' => ['count', 'percentage'],
                ],
            ],
        ]);
});

test('instructor can post a single reply to a review', function () {
    $this->enrollment->update(['progress_percent' => 50]);

    $review = CourseReview::create([
        'ulid' => (string) Str::ulid(),
        'course_id' => $this->course->id,
        'user_id' => $this->learner->id,
        'rating' => 5,
        'content' => 'Clear and concise.',
    ]);

    // Instructor logs in
    $this->actingAs($this->instructor);

    $replyResponse = $this->postJson("/api/v1/reviews/{$review->ulid}/reply", [
        'reply' => 'Thanks for the great feedback!',
    ]);

    $replyResponse->assertStatus(200)
        ->assertJson([
            'data' => [
                'instructor_reply' => 'Thanks for the great feedback!',
            ],
        ]);

    // Second reply attempt is rejected
    $duplicateResponse = $this->postJson("/api/v1/reviews/{$review->ulid}/reply", [
        'reply' => 'Posting another reply...',
    ]);
    $duplicateResponse->assertStatus(422);
});

test('learners can engage in QA forum with upvoting and best answers', function () {
    // 1. Ask question
    $qResponse = $this->postJson("/api/v1/qa/courses/{$this->course->slug}/questions", [
        'title' => 'How to configure ingress with cert-manager?',
        'body' => 'I am running into ACME DNS challenge timeouts.',
    ]);
    $qResponse->assertStatus(201);
    $questionUlid = $qResponse->json('data.ulid');

    // 2. Answer question as instructor
    $this->actingAs($this->instructor);
    $aResponse = $this->postJson("/api/v1/qa/questions/{$questionUlid}/answers", [
        'body' => 'Check your Cloudflare API token permissions in the Secret.',
    ]);
    $aResponse->assertStatus(201)
        ->assertJson([
            'data' => [
                'is_instructor_reply' => true,
            ],
        ]);
    $answerUlid = $aResponse->json('data.ulid');

    // 3. Upvote answer as learner
    $this->actingAs($this->learner);
    $upvoteResponse = $this->postJson("/api/v1/qa/answers/{$answerUlid}/upvote");
    $upvoteResponse->assertStatus(200)
        ->assertJson([
            'data' => [
                'voted' => true,
                'count' => 1,
            ],
        ]);

    // 4. Mark best answer
    $bestResponse = $this->postJson("/api/v1/qa/answers/{$answerUlid}/best-answer");
    $bestResponse->assertStatus(200)
        ->assertJson([
            'data' => [
                'is_best_answer' => true,
            ],
        ]);
});

test('users can exchange direct messages and manage notification preferences', function () {
    // Send direct message
    $msgResponse = $this->postJson("/api/v1/messages/{$this->instructor->ulid}", [
        'message' => 'Hello professor, do you have office hours tomorrow?',
    ]);
    $msgResponse->assertStatus(201)
        ->assertJson([
            'data' => [
                'message' => 'Hello professor, do you have office hours tomorrow?',
            ],
        ]);

    // Update notification preference
    $prefResponse = $this->putJson('/api/v1/notifications/preferences', [
        'category' => 'learning',
        'channel' => 'email',
        'is_enabled' => false,
    ]);
    $prefResponse->assertStatus(200)
        ->assertJson([
            'data' => [
                'category' => 'learning',
                'channel' => 'email',
                'is_enabled' => false,
            ],
        ]);
});
