<?php

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use Database\Seeders\CatalogSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    // Create an instructor
    $instructor = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Demo Instructor',
        'email' => 'instructor@learnhub.test',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->seed(CatalogSeeder::class);
});

test('it retrieves home page course rails', function () {
    $response = $this->getJson('/api/v1/catalog/home');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'featured',
                'trending',
                'newest',
            ],
        ]);

    $featured = $response->json('data.featured');
    expect(count($featured))->toBeGreaterThan(0);
    expect($featured[0]['title'])->toContain('Laravel');
});

test('it filters courses list by level and category', function () {
    $response = $this->getJson('/api/v1/catalog/courses?filter[level]=intermediate');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data',
            'meta' => ['current_page', 'total', 'per_page'],
        ]);

    $data = $response->json('data');
    expect(count($data))->toBeGreaterThan(0);
    expect($data[0]['level'])->toBe('intermediate');
});

test('it retrieves full course detail outline and SEO metadata', function () {
    $response = $this->getJson('/api/v1/catalog/courses/full-stack-laravel-nextjs-masterclass');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                'id',
                'title',
                'slug',
                'price' => ['amount', 'currency', 'formatted'],
                'sections' => [
                    '*' => [
                        'id',
                        'title',
                        'lectures' => [
                            '*' => ['id', 'title', 'lecture_type', 'is_preview'],
                        ],
                    ],
                ],
                'seo' => ['meta_title', 'meta_description', 'json_ld'],
            ],
        ]);

    $seo = $response->json('data.seo');
    expect($seo['json_ld']['@type'])->toBe('Course');
    expect($seo['json_ld']['name'])->toContain('Full-Stack Laravel');
});

test('it returns 404 for draft or unpublished courses', function () {
    Course::where('slug', 'full-stack-laravel-nextjs-masterclass')->update([
        'status' => CourseStatus::DRAFT->value,
    ]);

    $response = $this->getJson('/api/v1/catalog/courses/full-stack-laravel-nextjs-masterclass');
    $response->assertStatus(404);
});

test('it provides autocomplete suggestions for search query', function () {
    $response = $this->getJson('/api/v1/catalog/search/autocomplete?q=Laravel');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => ['id', 'title', 'slug'],
            ],
        ]);

    $results = $response->json('data');
    expect(count($results))->toBeGreaterThan(0);
});

test('it allows learner to add and remove courses from wishlist', function () {
    $learner = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Wishlist Learner',
        'email' => 'learner_wishlist@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $learner->assignRole(UserRole::LEARNER->value);

    $course = Course::where('slug', 'full-stack-laravel-nextjs-masterclass')->first();

    $this->actingAs($learner);

    // 1. Add to wishlist
    $addResponse = $this->postJson("/api/v1/wishlist/{$course->ulid}");
    $addResponse->assertStatus(201);

    // 2. View wishlist
    $listResponse = $this->getJson('/api/v1/wishlist');
    $listResponse->assertStatus(200);
    expect($listResponse->json('data.0.id'))->toBe($course->ulid);

    // 3. Remove from wishlist
    $removeResponse = $this->deleteJson("/api/v1/wishlist/{$course->ulid}");
    $removeResponse->assertStatus(200);

    // 4. Wishlist now empty
    $emptyResponse = $this->getJson('/api/v1/wishlist');
    $emptyResponse->assertStatus(200);
    expect(count($emptyResponse->json('data')))->toBe(0);
});
