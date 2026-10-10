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
use App\Domain\Media\Models\MediaAsset;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FreeCoursesAndVideosSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Categories Exist
        $categoriesData = [
            'web-development' => ['name' => 'Web Development', 'icon' => 'code'],
            'cloud-devops' => ['name' => 'Cloud & DevOps', 'icon' => 'cloud'],
            'ai-machine-learning' => ['name' => 'AI & Machine Learning', 'icon' => 'brain'],
            'mobile-development' => ['name' => 'Mobile App Development', 'icon' => 'smartphone'],
            'ui-ux-design' => ['name' => 'UI/UX & Product Design', 'icon' => 'palette'],
            'cybersecurity' => ['name' => 'Cybersecurity', 'icon' => 'shield'],
        ];

        $categories = [];
        $order = 1;
        foreach ($categoriesData as $slug => $c) {
            $categories[$slug] = Category::firstOrCreate(
                ['slug' => $slug],
                [
                    'ulid' => (string) Str::ulid(),
                    'name' => $c['name'],
                    'icon' => $c['icon'],
                    'sort_order' => $order++,
                    'is_active' => true,
                ]
            );
        }

        // 2. Ensure Instructors Exist
        $instructorsData = [
            'sarah.jenkins@learnhub.test' => [
                'name' => 'Sarah Jenkins',
                'headline' => 'Principal Software Architect | Ex-Google Staff Engineer',
                'bio' => 'Over 14 years building and architecting planet-scale distributed web applications.',
                'avatar_url' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
            ],
            'alexandre.dubois@learnhub.test' => [
                'name' => 'Alexandre Dubois',
                'headline' => 'Cloud Solutions Architect & Kubernetes Specialist',
                'bio' => 'AWS Certified Solutions Architect & CKA leading enterprise DevOps pipelines.',
                'avatar_url' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            ],
            'elena.rostova@learnhub.test' => [
                'name' => 'Elena Rostova',
                'headline' => 'Senior Product Designer & Design Systems Lead',
                'bio' => 'Specializing in accessible design systems and micro-interactions.',
                'avatar_url' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
            ],
            'dr.marcus.chen@learnhub.test' => [
                'name' => 'Dr. Marcus Chen',
                'headline' => 'Lead AI Research Scientist & Deep Learning Educator',
                'bio' => 'PhD in Computer Science. Building production LLM architectures and neural network pipelines.',
                'avatar_url' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            ],
        ];

        $instructors = [];
        foreach ($instructorsData as $email => $data) {
            $user = User::firstOrCreate(
                ['email' => $email],
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
            $instructors[$email] = $user;
        }

        // 3. Reliable Public Video Streams for Testing
        $videoLibrary = [
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
        ];

        // 4. Free Courses Portfolio
        $freeCourses = [
            [
                'slug' => 'javascript-typescript-modern-starter',
                'instructor_email' => 'sarah.jenkins@learnhub.test',
                'category_slug' => 'web-development',
                'title' => 'Modern JavaScript & TypeScript Fundamentals: The Zero-to-Hero Guide',
                'subtitle' => 'Master modern ES2024+ syntax, closures, async/await, DOM APIs, and strict TypeScript types with hands-on exercises.',
                'description' => '<p>Kickstart your software engineering journey with the most complete free JavaScript & TypeScript course. Learn asynchronous programming, type safety, generics, and modern web application patterns with real video demonstrations.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=900&auto=format&fit=crop&q=80',
                'promo_video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                'level' => CourseLevel::BEGINNER,
                'price_amount' => 0,
                'rating_cache' => 4.89,
                'reviews_count' => 1840,
                'enrollments_count' => 14200,
                'total_duration_seconds' => 14400,
                'lectures_count' => 6,
                'is_featured' => true,
                'is_trending' => true,
                'sections' => [
                    [
                        'title' => 'Getting Started with Modern JavaScript',
                        'lectures' => [
                            ['title' => 'Introduction to JS Engine & Runtime Environment', 'duration' => 600, 'preview' => true, 'video_idx' => 0],
                            ['title' => 'Variables, Scope & Memory Allocation', 'duration' => 900, 'preview' => true, 'video_idx' => 1],
                            ['title' => 'Asynchronous JavaScript: Promises & Async/Await', 'duration' => 1200, 'preview' => false, 'video_idx' => 2],
                        ],
                    ],
                    [
                        'title' => 'Type Safety with TypeScript',
                        'lectures' => [
                            ['title' => 'TypeScript Setup & Basic Type Annotations', 'duration' => 800, 'preview' => true, 'video_idx' => 3],
                            ['title' => 'Interfaces, Type Aliases & Union Types', 'duration' => 1100, 'preview' => false, 'video_idx' => 4],
                            ['title' => 'Generics & Utility Types in Practice', 'duration' => 1400, 'preview' => false, 'video_idx' => 5],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'python-crash-course-for-beginners',
                'instructor_email' => 'dr.marcus.chen@learnhub.test',
                'category_slug' => 'ai-machine-learning',
                'title' => 'Python 3 for Beginners: Practical Coding & Data Automation',
                'subtitle' => 'Learn Python programming from scratch. Build automation scripts, work with data structures, and prepare for AI & Data Science.',
                'description' => '<p>Designed for absolute beginners. We demystify Python syntax, list comprehensions, object-oriented concepts, and virtual environments while creating working automation projects.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=900&auto=format&fit=crop&q=80',
                'promo_video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                'level' => CourseLevel::BEGINNER,
                'price_amount' => 0,
                'rating_cache' => 4.93,
                'reviews_count' => 2950,
                'enrollments_count' => 22100,
                'total_duration_seconds' => 18000,
                'lectures_count' => 5,
                'is_featured' => true,
                'is_trending' => true,
                'sections' => [
                    [
                        'title' => 'Core Python Foundations',
                        'lectures' => [
                            ['title' => 'Installing Python 3 & Running Your First Script', 'duration' => 700, 'preview' => true, 'video_idx' => 1],
                            ['title' => 'Data Structures: Lists, Dictionaries & Tuples', 'duration' => 1050, 'preview' => true, 'video_idx' => 2],
                            ['title' => 'Functions, Parameters & Return Values', 'duration' => 900, 'preview' => false, 'video_idx' => 3],
                        ],
                    ],
                    [
                        'title' => 'Practical Automation Scripts',
                        'lectures' => [
                            ['title' => 'Reading & Writing Files (CSV, JSON)', 'duration' => 1200, 'preview' => true, 'video_idx' => 4],
                            ['title' => 'Building a Command-Line Web Scraper', 'duration' => 1500, 'preview' => false, 'video_idx' => 5],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'git-github-version-control-bootcamp',
                'instructor_email' => 'alexandre.dubois@learnhub.test',
                'category_slug' => 'cloud-devops',
                'title' => 'Git & GitHub Bootcamp: Complete Team Collaboration Workflow',
                'subtitle' => 'Master branching, merging, pull requests, resolving merge conflicts, and GitHub Actions CI/CD pipelines.',
                'description' => '<p>Never fear merge conflicts again. Learn industry-standard Git workflow including rebase, cherry-pick, stash, tag releases, and collaborative pull request reviews on GitHub.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1618401471353-b98aedd04e11?w=900&auto=format&fit=crop&q=80',
                'promo_video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                'level' => CourseLevel::ALL_LEVELS,
                'price_amount' => 0,
                'rating_cache' => 4.87,
                'reviews_count' => 1420,
                'enrollments_count' => 16500,
                'total_duration_seconds' => 10800,
                'lectures_count' => 5,
                'is_featured' => false,
                'is_trending' => true,
                'sections' => [
                    [
                        'title' => 'Local Git Fundamentals',
                        'lectures' => [
                            ['title' => 'Git Architecture: Working Directory, Staging & Commits', 'duration' => 850, 'preview' => true, 'video_idx' => 6],
                            ['title' => 'Branching Strategies & Fast-Forward Merges', 'duration' => 1100, 'preview' => true, 'video_idx' => 7],
                            ['title' => 'Resolving Merge Conflicts Confidently', 'duration' => 1300, 'preview' => false, 'video_idx' => 0],
                        ],
                    ],
                    [
                        'title' => 'Remote Collaboration on GitHub',
                        'lectures' => [
                            ['title' => 'Forks, Pull Requests & Code Review Protocols', 'duration' => 950, 'preview' => true, 'video_idx' => 1],
                            ['title' => 'Automated CI Checks with GitHub Actions', 'duration' => 1400, 'preview' => false, 'video_idx' => 2],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'figma-uiux-quickstart-guide',
                'instructor_email' => 'elena.rostova@learnhub.test',
                'category_slug' => 'ui-ux-design',
                'title' => 'Figma UI/UX Quickstart: Design Your First Mobile & Web App',
                'subtitle' => 'Learn Auto Layout, design components, responsive constraints, and interactive prototyping in Figma.',
                'description' => '<p>Turn your product ideas into interactive wireframes and polished UI mockups. Learn how to use Figma Auto Layout, component variants, and interactive prototyping links.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900&auto=format&fit=crop&q=80',
                'promo_video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
                'level' => CourseLevel::BEGINNER,
                'price_amount' => 0,
                'rating_cache' => 4.84,
                'reviews_count' => 1120,
                'enrollments_count' => 8900,
                'total_duration_seconds' => 9600,
                'lectures_count' => 4,
                'is_featured' => false,
                'is_trending' => false,
                'sections' => [
                    [
                        'title' => 'Figma Essentials & Auto Layout',
                        'lectures' => [
                            ['title' => 'Figma Interface Tour & Frame Constraints', 'duration' => 650, 'preview' => true, 'video_idx' => 3],
                            ['title' => 'Mastering Auto Layout (Padding, Alignment & Hugging)', 'duration' => 1250, 'preview' => true, 'video_idx' => 4],
                        ],
                    ],
                    [
                        'title' => 'Components & Prototyping',
                        'lectures' => [
                            ['title' => 'Creating Reusable Button & Card Components', 'duration' => 1150, 'preview' => true, 'video_idx' => 5],
                            ['title' => 'Wiring Interactive Click-Through Prototypes', 'duration' => 950, 'preview' => false, 'video_idx' => 6],
                        ],
                    ],
                ],
            ],
            [
                'slug' => 'cybersecurity-fundamentals-threat-defense',
                'instructor_email' => 'alexandre.dubois@learnhub.test',
                'category_slug' => 'cybersecurity',
                'title' => 'Cybersecurity Fundamentals: Network Security & Ethical Defense',
                'subtitle' => 'Understand common attack vectors, HTTPS/TLS encryption, firewall rules, and zero-trust authentication.',
                'description' => '<p>Explore how cybercriminals breach systems and how defensive engineers stop them. Understand SQL injection, cross-site scripting (XSS), phishing, and public-key cryptography.</p>',
                'thumbnail_url' => 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=900&auto=format&fit=crop&q=80',
                'promo_video_url' => 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                'level' => CourseLevel::BEGINNER,
                'price_amount' => 0,
                'rating_cache' => 4.92,
                'reviews_count' => 2100,
                'enrollments_count' => 17400,
                'total_duration_seconds' => 12600,
                'lectures_count' => 4,
                'is_featured' => true,
                'is_trending' => true,
                'sections' => [
                    [
                        'title' => 'Security Foundations',
                        'lectures' => [
                            ['title' => 'The CIA Triad & Threat Modeling Essentials', 'duration' => 750, 'preview' => true, 'video_idx' => 7],
                            ['title' => 'HTTPS, Certificates & Public Key Cryptography', 'duration' => 1150, 'preview' => true, 'video_idx' => 0],
                        ],
                    ],
                    [
                        'title' => 'Web App Security',
                        'lectures' => [
                            ['title' => 'Understanding OWASP Top 10 Vulnerabilities', 'duration' => 1350, 'preview' => true, 'video_idx' => 1],
                            ['title' => 'Hardening Servers & Implementing Least Privilege', 'duration' => 1050, 'preview' => false, 'video_idx' => 2],
                        ],
                    ],
                ],
            ],
        ];

        // 5. Seed Each Free Course, Sections, Lectures, and MediaAssets
        foreach ($freeCourses as $cData) {
            $instructor = $instructors[$cData['instructor_email']];
            $category = $categories[$cData['category_slug']];

            /** @var Course $course */
            $course = Course::updateOrCreate(
                ['slug' => $cData['slug']],
                [
                    'ulid' => (string) Str::ulid(),
                    'category_id' => $category->id,
                    'primary_instructor_id' => $instructor->id,
                    'title' => $cData['title'],
                    'subtitle' => $cData['subtitle'],
                    'description' => $cData['description'],
                    'thumbnail_url' => $cData['thumbnail_url'],
                    'promo_video_url' => $cData['promo_video_url'],
                    'level' => $cData['level'],
                    'language' => 'en',
                    'price_amount' => 0,
                    'price_currency' => 'USD',
                    'rating_cache' => $cData['rating_cache'],
                    'reviews_count' => $cData['reviews_count'],
                    'enrollments_count' => $cData['enrollments_count'],
                    'total_duration_seconds' => $cData['total_duration_seconds'],
                    'lectures_count' => $cData['lectures_count'],
                    'status' => CourseStatus::PUBLISHED,
                    'is_featured' => $cData['is_featured'],
                    'is_trending' => $cData['is_trending'],
                    'published_at' => now()->subDays(rand(2, 45)),
                    'requirements' => [
                        'No prior experience required; open to all enthusiastic learners',
                        'A modern web browser with internet connection',
                    ],
                    'what_you_will_learn' => [
                        'Gain real hands-on practical skills with live project walkthroughs',
                        'Understand core architectural foundations and best practices',
                        'Build a portfolio-worthy project to show friends and recruiters',
                    ],
                ]
            );

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
                    $videoUrl = $videoLibrary[$lData['video_idx'] % count($videoLibrary)];

                    /** @var Lecture $lecture */
                    $lecture = Lecture::updateOrCreate(
                        [
                            'section_id' => $section->id,
                            'title' => $lData['title'],
                        ],
                        [
                            'ulid' => (string) Str::ulid(),
                            'course_id' => $course->id,
                            'lecture_type' => LectureType::VIDEO,
                            'duration_seconds' => $lData['duration'],
                            'is_preview' => $lData['preview'],
                            'sort_order' => $lecIdx + 1,
                            'content_payload' => [
                                'summary' => 'Lecture covering ' . $lData['title'],
                                'video_url' => $videoUrl,
                                'stream_url' => $videoUrl,
                                'resources' => [
                                    ['title' => 'Lecture Notes & Cheat Sheet', 'url' => '#'],
                                    ['title' => 'Sample Source Code', 'url' => 'https://github.com'],
                                ],
                            ],
                        ]
                    );

                    // Create or update media asset for this lecture
                    MediaAsset::updateOrCreate(
                        ['lecture_id' => $lecture->id],
                        [
                            'ulid' => (string) Str::ulid(),
                            'user_id' => $instructor->id,
                            'filename' => Str::slug($lData['title']) . '.mp4',
                            'mime_type' => 'video/mp4',
                            'size_bytes' => 15000000,
                            'status' => 'ready',
                            'storage_key' => 'videos/' . $lecture->ulid . '.mp4',
                            'hls_manifest_key' => $videoUrl,
                            'duration_seconds' => $lData['duration'],
                            'thumbnails' => [$course->thumbnail_url],
                            'captions' => [],
                        ]
                    );
                }
            }
        }
    }
}
