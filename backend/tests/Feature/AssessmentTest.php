<?php

use App\Domain\Assessment\Models\Assignment;
use App\Domain\Assessment\Models\Quiz;
use App\Domain\Assessment\Models\QuizAttempt;
use App\Domain\Assessment\Models\QuizQuestion;
use App\Domain\Assessment\Models\QuizQuestionOption;
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
        'name' => 'Professor John',
        'email' => 'prof@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->learner = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Quiz Learner',
        'email' => 'quiz_learner@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->learner->assignRole(UserRole::LEARNER->value);

    $this->course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Advanced Algorithms',
        'slug' => 'advanced-algorithms',
        'status' => CourseStatus::PUBLISHED,
        'price_amount' => 5000,
        'price_currency' => 'USD',
    ]);

    $this->quiz = Quiz::create([
        'ulid' => (string) Str::ulid(),
        'course_id' => $this->course->id,
        'title' => 'Big-O Notation Exam',
        'description' => 'Test your knowledge on asymptotic analysis',
        'pass_mark_percent' => 70,
        'max_attempts' => 2,
        'time_limit_minutes' => 30,
        'is_randomized' => true,
    ]);

    $this->q1 = QuizQuestion::create([
        'ulid' => (string) Str::ulid(),
        'quiz_id' => $this->quiz->id,
        'prompt' => 'What is the average time complexity of QuickSort?',
        'points' => 5,
        'sort_order' => 1,
    ]);

    $this->opt1A = QuizQuestionOption::create([
        'question_id' => $this->q1->id,
        'option_text' => 'O(n log n)',
        'is_correct' => true,
    ]);

    $this->opt1B = QuizQuestionOption::create([
        'question_id' => $this->q1->id,
        'option_text' => 'O(n^2)',
        'is_correct' => false,
    ]);

    $this->assignment = Assignment::create([
        'ulid' => (string) Str::ulid(),
        'course_id' => $this->course->id,
        'title' => 'Binary Search Tree Implementation',
        'instructions' => 'Implement an AVL tree in PHP or Go and submit the repo URL.',
        'max_score' => 100,
    ]);

    $this->actingAs($this->learner);
});

test('learner can start a quiz attempt and receives questions without correct answers leaked', function () {
    $response = $this->postJson("/api/v1/assessment/quizzes/{$this->quiz->ulid}/start");

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'attempt_id',
                'status',
                'started_at',
                'expires_at',
                'questions' => [
                    '*' => [
                        'id',
                        'prompt',
                        'points',
                        'options' => [
                            '*' => [
                                'id',
                                'text',
                            ],
                        ],
                    ],
                ],
            ],
            'message',
        ]);

    // Ensure is_correct is NOT leaked to the client
    $response->assertJsonMissing(['is_correct' => true]);
    $response->assertJsonMissing(['is_correct' => false]);
});

test('learner can submit a quiz attempt and receives auto-graded score', function () {
    // 1. Start attempt
    $startRes = $this->postJson("/api/v1/assessment/quizzes/{$this->quiz->ulid}/start");
    $attemptId = $startRes->json('data.attempt_id');

    // 2. Submit with correct answer
    $submitRes = $this->postJson("/api/v1/assessment/quizzes/attempts/{$attemptId}/submit", [
        'answers' => [
            $this->q1->ulid => [
                'selected_option_ids' => [$this->opt1A->id],
            ],
        ],
    ]);

    $submitRes->assertStatus(200)
        ->assertJson([
            'data' => [
                'attempt_id' => $attemptId,
                'score_percent' => 100,
                'is_passed' => true,
                'status' => 'submitted',
            ],
        ]);
});

test('learner can submit an assignment', function () {
    $response = $this->postJson("/api/v1/assessment/assignments/{$this->assignment->ulid}/submit", [
        'submission_text' => 'Here is my complete AVL tree implementation: https://github.com/learner/avl-tree',
        'attachment_url' => 'https://cdn.example.com/attachments/avl.zip',
    ]);

    $response->assertStatus(201)
        ->assertJson([
            'data' => [
                'status' => 'submitted',
            ],
            'message' => 'Assignment submitted successfully for review.',
        ]);

    $this->assertDatabaseHas('assignment_submissions', [
        'assignment_id' => $this->assignment->id,
        'user_id' => $this->learner->id,
        'status' => 'submitted',
    ]);
});
