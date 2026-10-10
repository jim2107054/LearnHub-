<?php

declare(strict_types=1);

namespace App\Domain\Identity\Http\Controllers;

use App\Domain\Identity\Actions\RevokeSessionAction;
use App\Domain\Identity\Http\Resources\SessionResource;
use App\Domain\Identity\Models\User;
use App\Domain\Identity\Models\UserDeviceSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class SessionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $sessions = UserDeviceSession::query()
            ->where('user_id', $user->id)
            ->where('is_revoked', false)
            ->orderByDesc('last_active_at')
            ->get();

        return response()->json([
            'data' => SessionResource::collection($sessions),
        ]);
    }

    public function destroy(Request $request, string $sessionId, RevokeSessionAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->execute($user, $sessionId);

        return response()->json([
            'message' => 'Session successfully revoked.',
        ]);
    }
}
