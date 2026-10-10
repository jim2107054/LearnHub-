<?php

declare(strict_types=1);

namespace App\Domain\Identity\Actions;

use App\Domain\Identity\Models\User;
use App\Domain\Identity\Models\UserDeviceSession;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class RevokeSessionAction
{
    public function execute(User $user, string $sessionId): bool
    {
        /** @var UserDeviceSession|null $deviceSession */
        $deviceSession = UserDeviceSession::query()
            ->where('user_id', $user->id)
            ->where('id', $sessionId)
            ->first();

        if (! $deviceSession) {
            throw new NotFoundHttpException('Session not found.');
        }

        $deviceSession->update([
            'is_revoked' => true,
        ]);

        // If this device session is tied to a web session in the sessions table, delete it
        if ($deviceSession->session_id) {
            DB::table('sessions')->where('id', $deviceSession->session_id)->delete();
        }

        return true;
    }
}
