<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Catalog\Enums\CourseLevel;
use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Enums\LectureType;
use App\Domain\Catalog\Models\Category;
use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Catalog\Models\Section;
use App\Domain\Catalog\Models\Tag;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Categories hierarchy
        $dev = Category::firstOrCreate(['slug' => 'development'], [
            'ulid' => (string) Str::ulid(),
            'name' => 'Development',
            'icon' => 'code',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $webDev = Category::firstOrCreate(['slug' => 'web-development'], [
            'ulid' => (string) Str::ulid(),
            'parent_id' => $dev->id,
            'name' => 'Web Development',
            'sort_order' => 1,
            'is_active' => true,
        ]);

        $design = Category::firstOrCreate(['slug' => 'design'], [
            'ulid' => (string) Str::ulid(),
            'name' => 'Design',
            'icon' => 'palette',
            'sort_order' => 2,
            'is_active' => true,
        ]);

        // 2. Seed Tags
        $tagLaravel = Tag::firstOrCreate(['slug' => 'laravel'], ['name' => 'Laravel']);
        $tagNextJs = Tag::firstOrCreate(['slug' => 'nextjs'], ['name' => 'Next.js']);
        $tagPostgres = Tag::firstOrCreate(['slug' => 'postgresql'], ['name' => 'PostgreSQL']);

        // 3. Find instructor
        /** @var User|null $instructor */
        $instructor = User::query()->where('email', 'instructor@learnhub.test')->first();
        if (! $instructor) {
            $instructor = User::first();
        }

        // 4. Seed sample published course with full curriculum outline
        $course = Course::firstOrCreate(['slug' => 'full-stack-laravel-nextjs-masterclass'], [
            'ulid' => (string) Str::ulid(),
            'category_id' => $webDev->id,
            'primary_instructor_id' => $instructor->id,
            'title' => 'Full-Stack Laravel & Next.js Masterclass: Architecture & Best Practices',
            'subtitle' => 'Build high-performance, production-grade web applications with modern Laravel 12 and Next.js 15.',
            'description' => '<p>Learn how to architect, develop, and scale modern web applications from scratch. We cover Domain-Driven Modular Monoliths, clean APIs, Sanctum authentication, Stripe payments, and Next.js App Router.</p>',
            'level' => CourseLevel::INTERMEDIATE,
            'language' => 'en',
            'price_amount' => 4999, // $49.99 in minor units
            'price_currency' => 'USD',
            'thumbnail_url' => 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800',
            'status' => CourseStatus::PUBLISHED,
            'requirements' => [
                'Basic understanding of PHP and JavaScript',
                'Familiarity with relational databases (PostgreSQL or MySQL)',
            ],
            'what_you_will_learn' => [
                'Design clean modular architectures with Domain-Driven Design',
                'Build robust REST APIs with Sanctum, Horizon, and Meilisearch',
                'Integrate Next.js 15 App Router with TanStack Query and shadcn/ui',
                'Master double-entry financial ledger and Stripe payment gateways',
            ],
            'rating_cache' => 4.90,
            'reviews_count' => 128,
            'enrollments_count' => 1450,
            'total_duration_seconds' => 36000,
            'lectures_count' => 4,
            'is_featured' => true,
            'is_trending' => true,
            'published_at' => now()->subDays(10),
        ]);

        $course->tags()->syncWithoutDetaching([$tagLaravel->id, $tagNextJs->id, $tagPostgres->id]);

        // 5. Seed Sections and Lectures
        $sec1 = Section::firstOrCreate(['course_id' => $course->id, 'title' => 'Section 1: Architecture Foundations'], [
            'ulid' => (string) Str::ulid(),
            'sort_order' => 1,
        ]);

        Lecture::firstOrCreate(['section_id' => $sec1->id, 'title' => '1. Course Introduction & Monolith Blueprint'], [
            'ulid' => (string) Str::ulid(),
            'course_id' => $course->id,
            'lecture_type' => LectureType::VIDEO,
            'duration_seconds' => 600,
            'is_preview' => true, // Free preview!
            'sort_order' => 1,
            'content_payload' => ['summary' => 'Overview of the course and tech stack.'],
        ]);

        Lecture::firstOrCreate(['section_id' => $sec1->id, 'title' => '2. Setting Up Docker and Database Schemas'], [
            'ulid' => (string) Str::ulid(),
            'course_id' => $course->id,
            'lecture_type' => LectureType::VIDEO,
            'duration_seconds' => 1200,
            'is_preview' => false,
            'sort_order' => 2,
        ]);

        $sec2 = Section::firstOrCreate(['course_id' => $course->id, 'title' => 'Section 2: Security & Authentication'], [
            'ulid' => (string) Str::ulid(),
            'sort_order' => 2,
        ]);

        Lecture::firstOrCreate(['section_id' => $sec2->id, 'title' => '3. Laravel Sanctum SPA Cookie Auth & MFA'], [
            'ulid' => (string) Str::ulid(),
            'course_id' => $course->id,
            'lecture_type' => LectureType::VIDEO,
            'duration_seconds' => 1800,
            'is_preview' => true, // Free preview!
            'sort_order' => 1,
        ]);

        Lecture::firstOrCreate(['section_id' => $sec2->id, 'title' => '4. OWASP ASVS Defense Checklist'], [
            'ulid' => (string) Str::ulid(),
            'course_id' => $course->id,
            'lecture_type' => LectureType::ARTICLE,
            'duration_seconds' => 900,
            'is_preview' => false,
            'sort_order' => 2,
            'content_payload' => ['text' => 'Article covering rate limiting, lockout, and CSRF protection.'],
        ]);
    }
}
