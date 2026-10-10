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
use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductionCoursesSeeder extends Seeder
{
    public function run(): void
    {
        // -------------------------------------------------------------
        // 1. Categories
        // -------------------------------------------------------------
        $categoriesData = [
            ['name' => 'Web Development', 'slug' => 'web-development', 'icon' => 'code'],
            ['name' => 'Cloud & DevOps', 'slug' => 'cloud-devops', 'icon' => 'cloud'],
            ['name' => 'AI & Machine Learning', 'slug' => 'ai-machine-learning', 'icon' => 'brain'],
            ['name' => 'Mobile App Development', 'slug' => 'mobile-development', 'icon' => 'smartphone'],
            ['name' => 'UI/UX & Product Design', 'slug' => 'ui-ux-design', 'icon' => 'palette'],
            ['name' => 'Cybersecurity', 'slug' => 'cybersecurity', 'icon' => 'shield'],
        ];

        $categories = [];
        foreach ($categoriesData as $idx => $cat) {
            $categories[$cat['slug']] = Category::firstOrCreate(
                ['slug' => $cat['slug']],
                [
                    'ulid' => (string) Str::ulid(),
                    'name' => $cat['name'],
                    'icon' => $cat['icon'],
                    'sort_order' => $idx + 1,
                    'is_active' => true,
                ]
            );
        }

        // -------------------------------------------------------------
        // 2. Tags
        // -------------------------------------------------------------
        $tagNames = [
            'Laravel', 'Next.js', 'React', 'TypeScript', 'Docker', 'Kubernetes',
            'AWS', 'PostgreSQL', 'Python', 'Tailwind CSS', 'Figma', 'System Design',
            'GraphQL', 'Node.js', 'Microservices', 'Clean Architecture',
        ];

        $tags = [];
        foreach ($tagNames as $name) {
            $slug = Str::slug($name);
            $tags[$slug] = Tag::firstOrCreate(['slug' => $slug], ['name' => $name]);
        }

        // -------------------------------------------------------------
        // 3. Instructors
        // -------------------------------------------------------------
        $instructorsData = [
            [
                'email' => 'sarah.jenkins@learnhub.test',
                'name' => 'Sarah Jenkins',
                'headline' => 'Principal Software Architect | Ex-Google Staff Engineer',
                'bio' => 'Over 14 years building and architecting planet-scale distributed web applications. Passionate about clean code, modular monoliths, and microservices.',
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
            ],
            [
                'email' => 'alexandre.dubois@learnhub.test',
                'name' => 'Alexandre Dubois',
                'headline' => 'Cloud Solutions Architect & Kubernetes Specialist',
                'bio' => 'AWS Certified Solutions Architect & CKA. Leading cloud transformations and enterprise DevOps pipelines for high-growth tech companies.',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            ],
            [
                'email' => 'elena.rostova@learnhub.test',
                'name' => 'Elena Rostova',
                'headline' => 'Senior Product Designer & Design Systems Lead',
                'bio' => 'Specializing in accessible, design-system-first web experiences, micro-interactions, and conversion-optimized UI/UX.',
                'avatar_url' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
            ],
            [
                'email' => 'dr.marcus.chen@learnhub.test',
                'name' => 'Dr. Marcus Chen',
                'headline' => 'Lead AI Research Scientist & Deep Learning Educator',
                'bio' => 'PhD in Computer Science. Building production LLM architectures, RAG systems, and neural network pipelines for modern enterprise software.',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            ],
        ];

        $instructors = [];
        foreach ($instructorsData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'ulid' => (string) Str::ulid(),
                    'name' => $data['name'],
                    'headline' => $data['headline'],
                    'bio' => $data['bio'],
                    'avatar_url' => $data['avatar_url'],
                    'password' => Hash::make('Instructor1234!'),
                    'email_verified_at' => now(),
                    'status' => AccountStatus::ACTIVE->value,
                    'terms_version' => 'v1.0',
                    'terms_accepted_at' => now(),
                    'locale' => 'en',
                    'timezone' => 'UTC',
                ]
            );
            $user->assignRole(UserRole::INSTRUCTOR->value);
            $instructors[$data['email']] = $user;
        }

        // -------------------------------------------------------------
        // 4. Comprehensive Course Portfolio with Real Images
        // -------------------------------------------------------------
        $coursesData = [
            [
                'slug' => 'full-stack-laravel-nextjs-masterclass',
                'instructor_email' => 'sarah.jenkins@learnhub.test',
                'category_slug' => 'web-development',
                'title' => 'Full-Stack Laravel 12 & Next.js 15: The Complete Enterprise Architecture Masterclass',
                'subtitle' => 'Build high-performance, production-ready SaaS applications with Domain-Driven Design, Sanctum Auth, and Next.js App Router.',
                'description' => '<p>Master full-stack engineering with modern Laravel 12 and Next.js 15. Learn how to architect a scalable modular monolith, implement OWASP ASVS L2 security, manage double-entry ledgers, and deploy with zero downtime.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80',
                'level' => CourseLevel::INTERMEDIATE,
                'price_amount' => 4999, // $49.99
                'rating_cache' => 4.92,
                'reviews_count' => 312,
                'enrollments_count' => 3840,
                'total_duration_seconds' => 46800, // 13 hours
                'lectures_count' => 12,
                'is_featured' => true,
                'is_trending' => true,
                'tags' => ['laravel', 'nextjs', 'typescript', 'postgresql'],
                'sections' => [
                    [
                        'title' => 'Module 1: Domain-Driven Modular Architecture',
                        'lectures' => [
                            ['title' => 'Architecture Foundations & Modular Monolith Pattern', 'type' => LectureType::VIDEO, 'duration' => 900, 'preview' => true],
                            ['title' => 'Designing Database Schemas & PostgreSQL Constraints', 'type' => LectureType::VIDEO, 'duration' => 1200, 'preview' => false],
                            ['title' => 'Service Contracts and Repository Patterns', 'type' => LectureType::VIDEO, 'duration' => 1500, 'preview' => true],
                        ],
                    ],
                    [
                        'title' => 'Module 2: Sanctum Cookie Authentication & MFA TOTP',
                        'lectures' => [
                            ['title' => 'Configuring Sanctum SPA Cookies & CORS Headers', 'type' => LectureType::VIDEO, 'duration' => 1100, 'preview' => false],
                            ['title' => 'Two-Factor Authentication (TOTP) Setup & Recovery Codes', 'type' => LectureType::VIDEO, 'duration' => 1400, 'preview' => false],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'docker-kubernetes-devops-cloud-bootcamp',
                'instructor_email' => 'alexandre.dubois@learnhub.test',
                'category_slug' => 'cloud-devops',
                'title' => 'Docker & Kubernetes Bootcamp: From Local Development to Production AWS Clusters',
                'subtitle' => 'Master containerization, Helm charts, CI/CD with GitHub Actions, GitOps with ArgoCD, and auto-scaling production Kubernetes.',
                'description' => '<p>Become a cloud DevOps expert. Learn container virtualization, multi-stage production Dockerfiles, ingress routing, SSL automated certificate managers, and multi-region AWS cloud deployments.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=900&auto=format&fit=crop&q=80',
                'level' => CourseLevel::ALL_LEVELS,
                'price_amount' => 7999, // $79.99
                'rating_cache' => 4.88,
                'reviews_count' => 245,
                'enrollments_count' => 2910,
                'total_duration_seconds' => 54000,
                'lectures_count' => 10,
                'is_featured' => true,
                'is_trending' => true,
                'tags' => ['docker', 'kubernetes', 'aws', 'system-design'],
                'sections' => [
                    [
                        'title' => 'Module 1: Production Containerization with Docker',
                        'lectures' => [
                            ['title' => 'Docker Architecture & Modern Container Runtime Deep Dive', 'type' => LectureType::VIDEO, 'duration' => 1200, 'preview' => true],
                            ['title' => 'Optimizing Multi-Stage Docker Builds for Minimal Images', 'type' => LectureType::VIDEO, 'duration' => 1500, 'preview' => false],
                        ],
                    ],
                    [
                        'title' => 'Module 2: Kubernetes Cluster Orchestration & Pod Networking',
                        'lectures' => [
                            ['title' => 'Deploying Pods, ReplicaSets, and Deployments', 'type' => LectureType::VIDEO, 'duration' => 1800, 'preview' => true],
                            ['title' => 'Ingress Controllers, ClusterIP, and TLS Termination', 'type' => LectureType::VIDEO, 'duration' => 2100, 'preview' => false],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'ai-engineering-llm-rag-systems',
                'instructor_email' => 'dr.marcus.chen@learnhub.test',
                'category_slug' => 'ai-machine-learning',
                'title' => 'Practical AI Engineering: Building Production RAG Systems & Autonomous Agents',
                'subtitle' => 'Harness LLMs, vector embeddings, LangChain, semantic search, and autonomous multi-agent systems for enterprise AI software.',
                'description' => '<p>Step into the cutting-edge world of AI application development. This course takes you through chunking strategies, pgvector databases, prompt engineering, agentic reasoning loops, and evaluating accuracy.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=900&auto=format&fit=crop&q=80',
                'level' => CourseLevel::ADVANCED,
                'price_amount' => 8999, // $89.99
                'rating_cache' => 4.96,
                'reviews_count' => 418,
                'enrollments_count' => 5120,
                'total_duration_seconds' => 39600,
                'lectures_count' => 8,
                'is_featured' => true,
                'is_trending' => true,
                'tags' => ['python', 'postgresql', 'system-design'],
                'sections' => [
                    [
                        'title' => 'Module 1: Retrieval Augmented Generation (RAG) Fundamentals',
                        'lectures' => [
                            ['title' => 'Embeddings & Vector Spaces Explained Visually', 'type' => LectureType::VIDEO, 'duration' => 1100, 'preview' => true],
                            ['title' => 'Setting Up PostgreSQL pgvector for Hybrid Search', 'type' => LectureType::VIDEO, 'duration' => 1600, 'preview' => false],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'design-systems-figma-to-code',
                'instructor_email' => 'elena.rostova@learnhub.test',
                'category_slug' => 'ui-ux-design',
                'title' => 'Design Systems & Modern UI/UX: From Figma Tokens to Tailwind & Radix UI',
                'subtitle' => 'Bridge the gap between design and engineering. Build world-class accessible design systems with Figma variables and Tailwind CSS.',
                'description' => '<p>Learn how top product companies create maintainable design systems. Craft scalable color palettes, typography scales, spacing grids, and component states in Figma, then export into code with Tailwind and Radix UI.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=900&auto=format&fit=crop&q=80',
                'level' => CourseLevel::BEGINNER,
                'price_amount' => 3999, // $39.99
                'rating_cache' => 4.91,
                'reviews_count' => 189,
                'enrollments_count' => 2100,
                'total_duration_seconds' => 32400,
                'lectures_count' => 9,
                'is_featured' => false,
                'is_trending' => true,
                'tags' => ['figma', 'tailwind-css', 'react'],
                'sections' => [
                    [
                        'title' => 'Module 1: Token Architecture & Variables in Figma',
                        'lectures' => [
                            ['title' => 'Design Tokens: Color, Spacing, and Elevation Systems', 'type' => LectureType::VIDEO, 'duration' => 950, 'preview' => true],
                            ['title' => 'Building Accessible Component Variants in Figma', 'type' => LectureType::VIDEO, 'duration' => 1350, 'preview' => false],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'react-19-nextjs-microfrontends',
                'instructor_email' => 'sarah.jenkins@learnhub.test',
                'category_slug' => 'web-development',
                'title' => 'React 19 & Next.js App Router: Performance Optimization & Server Components',
                'subtitle' => 'Deep dive into React Server Components (RSC), Actions, streaming SSR, Suspense boundaries, and Web Vitals optimization.',
                'description' => '<p>Unlock next-level web speed. Explore the inner mechanics of React 19 Server Actions, optimistic UI updates, partial pre-rendering (PPR), and sub-millisecond route transitions.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900&auto=format&fit=crop&q=80',
                'level' => CourseLevel::ADVANCED,
                'price_amount' => 5999, // $59.99
                'rating_cache' => 4.85,
                'reviews_count' => 156,
                'enrollments_count' => 1780,
                'total_duration_seconds' => 28800,
                'lectures_count' => 7,
                'is_featured' => false,
                'is_trending' => false,
                'tags' => ['react', 'nextjs', 'typescript', 'tailwind-css'],
                'sections' => [
                    [
                        'title' => 'Module 1: Server Components Architecture',
                        'lectures' => [
                            ['title' => 'Mental Model: Server Components vs Client Components', 'type' => LectureType::VIDEO, 'duration' => 1050, 'preview' => true],
                            ['title' => 'Streaming SSR & Instant Loading Skeletons', 'type' => LectureType::VIDEO, 'duration' => 1450, 'preview' => false],
                        ],
                    ],
                ],
            ],
        ];

        // -------------------------------------------------------------
        // 5. Seed Each Course and Curriculum
        // -------------------------------------------------------------
        foreach ($coursesData as $cData) {
            $instructor = $instructors[$cData['instructor_email']];
            $category = $categories[$cData['category_slug']];

            $course = Course::firstOrCreate(
                ['slug' => $cData['slug']],
                [
                    'ulid' => (string) Str::ulid(),
                    'category_id' => $category->id,
                    'primary_instructor_id' => $instructor->id,
                    'title' => $cData['title'],
                    'subtitle' => $cData['subtitle'],
                    'description' => $cData['description'],
                    'thumbnail_url' => $cData['thumbnail_url'],
                    'level' => $cData['level'],
                    'language' => 'en',
                    'price_amount' => $cData['price_amount'],
                    'price_currency' => 'USD',
                    'rating_cache' => $cData['rating_cache'],
                    'reviews_count' => $cData['reviews_count'],
                    'enrollments_count' => $cData['enrollments_count'],
                    'total_duration_seconds' => $cData['total_duration_seconds'],
                    'lectures_count' => $cData['lectures_count'],
                    'status' => CourseStatus::PUBLISHED,
                    'is_featured' => $cData['is_featured'],
                    'is_trending' => $cData['is_trending'],
                    'published_at' => now()->subDays(rand(5, 60)),
                    'requirements' => [
                        'Basic programming knowledge in modern languages',
                        'A computer with macOS, Linux, or Windows with internet access',
                    ],
                    'what_you_will_learn' => [
                        'Master real-world enterprise design patterns and industry workflows',
                        'Build secure, tested, and high-performance software systems',
                        'Confidently take applications from concept to production deployment',
                    ],
                ]
            );

            // Sync tags
            $tagIds = [];
            foreach ($cData['tags'] as $tagSlug) {
                if (isset($tags[$tagSlug])) {
                    $tagIds[] = $tags[$tagSlug]->id;
                }
            }
            $course->tags()->syncWithoutDetaching($tagIds);

            // Seed sections and lectures
            foreach ($cData['sections'] as $secIdx => $sData) {
                $section = Section::firstOrCreate(
                    [
                        'course_id' => $course->id,
                        'title' => $sData['title'],
                    ],
                    [
                        'ulid' => (string) Str::ulid(),
                        'sort_order' => $secIdx + 1,
                    ]
                );

                foreach ($sData['lectures'] as $lecIdx => $lData) {
                    Lecture::firstOrCreate(
                        [
                            'section_id' => $section->id,
                            'title' => $lData['title'],
                        ],
                        [
                            'ulid' => (string) Str::ulid(),
                            'course_id' => $course->id,
                            'lecture_type' => $lData['type'],
                            'duration_seconds' => $lData['duration'],
                            'is_preview' => $lData['preview'],
                            'sort_order' => $lecIdx + 1,
                            'content_payload' => ['summary' => 'Comprehensive lecture covering ' . $lData['title']],
                        ]
                    );
                }
            }
        }
    }
}
