<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
        ]);

        // Create Super Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@learnhub.test'],
            [
                'ulid' => (string) Str::ulid(),
                'name' => 'LearnHub Super Admin',
                'password' => Hash::make('Admin1234!'),
                'email_verified_at' => now(),
                'status' => AccountStatus::ACTIVE->value,
                'terms_version' => 'v1.0',
                'terms_accepted_at' => now(),
                'locale' => 'en',
                'timezone' => 'UTC',
            ]
        );
        $admin->assignRole(UserRole::SUPER_ADMIN->value);

        // Create Demo Instructor
        $instructor = User::firstOrCreate(
            ['email' => 'instructor@learnhub.test'],
            [
                'ulid' => (string) Str::ulid(),
                'name' => 'Demo Instructor',
                'headline' => 'Senior Cloud Architect & Educator',
                'bio' => 'Teaching web architecture, microservices, and modern software development.',
                'password' => Hash::make('Instructor1234!'),
                'email_verified_at' => now(),
                'status' => AccountStatus::ACTIVE->value,
                'terms_version' => 'v1.0',
                'terms_accepted_at' => now(),
                'locale' => 'en',
                'timezone' => 'UTC',
            ]
        );
        $instructor->assignRole(UserRole::INSTRUCTOR->value);

        // Create Demo Learner
        $learner = User::firstOrCreate(
            ['email' => 'learner@learnhub.test'],
            [
                'ulid' => (string) Str::ulid(),
                'name' => 'Demo Learner',
                'password' => Hash::make('Learner1234!'),
                'email_verified_at' => now(),
                'status' => AccountStatus::ACTIVE->value,
                'terms_version' => 'v1.0',
                'terms_accepted_at' => now(),
                'locale' => 'en',
                'timezone' => 'UTC',
            ]
        );
        $learner->assignRole(UserRole::LEARNER->value);

        $this->call([
            CatalogSeeder::class,
        ]);
    }
}
