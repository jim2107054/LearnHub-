<?php

declare(strict_types=1);

namespace App\Domain\Admin\Http\Controllers;

use App\Domain\Admin\Actions\ImpersonateUserAction;
use App\Domain\Identity\Enums\AccountStatus;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class UserManagementController extends Controller
{
    /**
     * Search and list users (ADM-01).
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with(['roles']);

        if ($request->filled('q')) {
            $search = '%'.$request->query('q').'%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', $search)
                    ->orWhere('email', 'ilike', $search);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('role')) {
            $query->role($request->query('role'));
        }

        $users = $query->latest()->paginate(20);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $users->currentPage(),
                    'last_page' => $users->lastPage(),
                    'per_page' => $users->perPage(),
                    'total' => $users->total(),
                ],
            ],
        ]);
    }

    /**
     * Suspend a user.
     */
    public function suspend(Request $request, string $ulid): JsonResponse
    {
        /** @var User $user */
        $user = User::query()->where('ulid', $ulid)->firstOrFail();

        $user->update(['status' => AccountStatus::SUSPENDED->value]);
        $user->tokens()->delete(); // Invalidate active tokens

        return response()->json([
            'data' => $user,
            'message' => 'User account suspended.',
        ]);
    }

    /**
     * Ban a user.
     */
    public function ban(Request $request, string $ulid): JsonResponse
    {
        /** @var User $user */
        $user = User::query()->where('ulid', $ulid)->firstOrFail();

        $user->update(['status' => AccountStatus::BANNED->value]);
        $user->tokens()->delete();

        return response()->json([
            'data' => $user,
            'message' => 'User account permanently banned.',
        ]);
    }

    /**
     * Impersonate a user (audited) (ADM-01).
     */
    public function impersonate(Request $request, string $ulid, ImpersonateUserAction $action): JsonResponse
    {
        /** @var User $admin */
        $admin = $request->user();

        /** @var User $target */
        $target = User::query()->where('ulid', $ulid)->firstOrFail();

        $result = $action->execute($admin, $target);

        return response()->json([
            'data' => [
                'token' => $result['token'],
                'user' => [
                    'id' => $result['target_user']->ulid,
                    'name' => $result['target_user']->name,
                    'email' => $result['target_user']->email,
                ],
            ],
            'message' => 'Impersonation token created. All actions during this session are audited.',
        ]);
    }

    /**
     * Delete user account.
     */
    public function destroy(Request $request, string $ulid): JsonResponse
    {
        /** @var User $user */
        $user = User::query()->where('ulid', $ulid)->firstOrFail();

        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'User account deleted.',
        ]);
    }
}
