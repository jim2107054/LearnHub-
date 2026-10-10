<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Domain\Identity\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Core permissions catalog
        $permissions = [
            'view courses',
            'enroll courses',
            'review courses',
            'create courses',
            'edit own courses',
            'publish courses',
            'grade assignments',
            'moderate reviews',
            'moderate qna',
            'manage payouts',
            'view financial reports',
            'manage platform settings',
            'manage users',
            'impersonate users',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // Create roles and assign specific permissions
        foreach (UserRole::cases() as $roleEnum) {
            $role = Role::firstOrCreate(['name' => $roleEnum->value, 'guard_name' => 'web']);

            match ($roleEnum) {
                UserRole::LEARNER => $role->syncPermissions(['view courses', 'enroll courses', 'review courses']),
                UserRole::INSTRUCTOR => $role->syncPermissions([
                    'view courses', 'enroll courses', 'review courses',
                    'create courses', 'edit own courses', 'publish courses', 'grade assignments',
                ]),
                UserRole::TA => $role->syncPermissions(['view courses', 'grade assignments', 'moderate qna']),
                UserRole::MODERATOR => $role->syncPermissions(['moderate reviews', 'moderate qna']),
                UserRole::FINANCE => $role->syncPermissions(['manage payouts', 'view financial reports']),
                UserRole::SUPPORT => $role->syncPermissions(['view courses', 'manage users']),
                UserRole::SUPER_ADMIN => $role->syncPermissions(Permission::all()),
            };
        }
    }
}
