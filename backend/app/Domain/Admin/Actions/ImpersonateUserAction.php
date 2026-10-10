<?php

declare(strict_types=1);

namespace App\Domain\Admin\Actions;

use App\Domain\Admin\Models\AuditLog;
use App\Domain\Identity\Models\User;
use Illuminate\Support\Str;

class ImpersonateUserAction
{
    /**
     * @return array{token: string, target_user: User}
     */
    public function execute(User $admin, User $targetUser): array
    {
        $token = $targetUser->createToken('impersonation_by_'.$admin->id)->plainTextToken;

        // Record immutable audit entry (ADM-01, ADM-09)
        AuditLog::query()->create([
            'id' => (string) Str::ulid(),
            'user_id' => $targetUser->id,
            'impersonator_id' => $admin->id,
            'action' => 'user.impersonate',
            'auditable_type' => User::class,
            'auditable_id' => (string) $targetUser->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'correlation_id' => request()->header('X-Correlation-ID', (string) Str::uuid()),
            'created_at' => now(),
        ]);

        return [
            'token' => $token,
            'target_user' => $targetUser,
        ];
    }
}
