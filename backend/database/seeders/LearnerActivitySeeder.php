<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Catalog\Models\Course;
use App\Domain\Catalog\Models\Lecture;
use App\Domain\Certificate\Models\Certificate;
use App\Domain\Commerce\Enums\OrderStatus;
use App\Domain\Commerce\Models\Order;
use App\Domain\Commerce\Models\OrderItem;
use App\Domain\Community\Models\CourseReview;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Models\Enrollment;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LearnerActivitySeeder extends Seeder
{
    public function run(): void
    {
        $learner = User::query()->where('email', 'learner@learnhub.test')->first();
        if (! $learner) {
            return;
        }

        $courses = Course::query()->published()->get();
        if ($courses->isEmpty()) {
            return;
        }

        $laravelCourse = $courses->firstWhere('slug', 'full-stack-laravel-nextjs-masterclass') ?? $courses[0];
        $aiCourse = $courses->firstWhere('slug', 'ai-engineering-llm-rag-systems') ?? ($courses[1] ?? $courses[0]);

        // -------------------------------------------------------------
        // 1. Orders and Order Items for Demo Learner
        // -------------------------------------------------------------
        $order1 = Order::firstOrCreate(
            ['order_number' => 'LH-2026-918237'],
            [
                'ulid' => (string) Str::ulid(),
                'user_id' => $learner->id,
                'status' => OrderStatus::PAID,
                'subtotal_amount' => $laravelCourse->price_amount,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => $laravelCourse->price_amount,
                'currency' => 'USD',
                'payment_gateway' => 'stripe',
                'gateway_intent_id' => 'pi_seed_'.Str::random(16),
                'billing_name' => $learner->name,
                'billing_country' => 'US',
                'paid_at' => now()->subDays(5),
            ]
        );

        OrderItem::firstOrCreate(
            [
                'order_id' => $order1->id,
                'course_id' => $laravelCourse->id,
            ],
            [
                'ulid' => (string) Str::ulid(),
                'instructor_id' => $laravelCourse->primary_instructor_id,
                'unit_price_amount' => $laravelCourse->price_amount,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => $laravelCourse->price_amount,
                'platform_fee_amount' => (int) round($laravelCourse->price_amount * 0.1),
                'instructor_share_amount' => (int) round($laravelCourse->price_amount * 0.9),
            ]
        );

        $order2 = Order::firstOrCreate(
            ['order_number' => 'LH-2026-918238'],
            [
                'ulid' => (string) Str::ulid(),
                'user_id' => $learner->id,
                'status' => OrderStatus::PAID,
                'subtotal_amount' => $aiCourse->price_amount,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => $aiCourse->price_amount,
                'currency' => 'USD',
                'payment_gateway' => 'stripe',
                'gateway_intent_id' => 'pi_seed_'.Str::random(16),
                'billing_name' => $learner->name,
                'billing_country' => 'US',
                'paid_at' => now()->subDays(2),
            ]
        );

        OrderItem::firstOrCreate(
            [
                'order_id' => $order2->id,
                'course_id' => $aiCourse->id,
            ],
            [
                'ulid' => (string) Str::ulid(),
                'instructor_id' => $aiCourse->primary_instructor_id,
                'unit_price_amount' => $aiCourse->price_amount,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => $aiCourse->price_amount,
                'platform_fee_amount' => (int) round($aiCourse->price_amount * 0.1),
                'instructor_share_amount' => (int) round($aiCourse->price_amount * 0.9),
            ]
        );

        // -------------------------------------------------------------
        // 2. Enrollments for Demo Learner
        // -------------------------------------------------------------
        $firstLaravelLecture = Lecture::query()->where('course_id', $laravelCourse->id)->first();
        $firstAiLecture = Lecture::query()->where('course_id', $aiCourse->id)->first();

        Enrollment::firstOrCreate(
            [
                'user_id' => $learner->id,
                'course_id' => $laravelCourse->id,
            ],
            [
                'ulid' => (string) Str::ulid(),
                'order_id' => $order1->id,
                'status' => 'active',
                'progress_percent' => 65,
                'last_accessed_lecture_id' => $firstLaravelLecture?->id,
                'last_accessed_at' => now()->subHours(3),
            ]
        );

        Enrollment::firstOrCreate(
            [
                'user_id' => $learner->id,
                'course_id' => $aiCourse->id,
            ],
            [
                'ulid' => (string) Str::ulid(),
                'order_id' => $order2->id,
                'status' => 'active',
                'progress_percent' => 30,
                'last_accessed_lecture_id' => $firstAiLecture?->id,
                'last_accessed_at' => now()->subDays(1),
            ]
        );

        // -------------------------------------------------------------
        // 3. Certificate for Demo Learner
        // -------------------------------------------------------------
        Certificate::firstOrCreate(
            ['certificate_code' => 'LH-CERT-2026-8891'],
            [
                'ulid' => (string) Str::ulid(),
                'user_id' => $learner->id,
                'course_id' => $laravelCourse->id,
                'issued_at' => now()->subDays(3),
                'status' => 'valid',
            ]
        );

        // -------------------------------------------------------------
        // 4. Real Community Course Reviews
        // -------------------------------------------------------------
        $instructors = User::query()->where('id', '!=', $learner->id)->get();
        $sampleReviews = [
            [
                'rating' => 5,
                'comment' => 'One of the best production courses on full-stack architecture I have ever completed. The explanation of domain boundaries and modular monolith patterns is world-class.',
            ],
            [
                'rating' => 5,
                'comment' => 'Incredible depth! Clear, concise, and focused on production-ready engineering rather than trivial toy examples.',
            ],
            [
                'rating' => 4,
                'comment' => 'Very thorough curriculum. The real-world deployment tips saved our team days of debugging cloud infrastructure.',
            ],
        ];

        foreach ($courses as $cIdx => $course) {
            foreach ($sampleReviews as $rIdx => $revData) {
                $reviewer = $instructors[($cIdx + $rIdx) % $instructors->count()] ?? $learner;
                CourseReview::firstOrCreate(
                    [
                        'course_id' => $course->id,
                        'user_id' => $reviewer->id,
                    ],
                    [
                        'ulid' => (string) Str::ulid(),
                        'rating' => $revData['rating'],
                        'content' => $revData['comment'],
                    ]
                );
            }
        }
    }
}
