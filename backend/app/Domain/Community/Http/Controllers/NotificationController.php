<?php

declare(strict_types=1);

namespace App\Domain\Community\Http\Controllers;

use App\Domain\Community\Models\NotificationPreference;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Routing\Controller;

class NotificationController extends Controller
{
    /**
     * List user's in-app notifications.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $notifications = $user->notifications()
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'unread_count' => $user->unreadNotifications()->count(),
                'pagination' => [
                    'current_page' => $notifications->currentPage(),
                    'last_page' => $notifications->lastPage(),
                    'per_page' => $notifications->perPage(),
                    'total' => $notifications->total(),
                ],
            ],
        ]);
    }

    /**
     * Mark single notification as read.
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var DatabaseNotification $notification */
        $notification = $user->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllRead(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $user->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Get user's category & channel notification preferences (NTF-02).
     */
    public function preferences(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $preferences = NotificationPreference::query()
            ->where('user_id', $user->id)
            ->get();

        return response()->json([
            'data' => $preferences,
        ]);
    }

    /**
     * Update user's notification preference.
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'in:learning,announcements,qa,reviews,marketing'],
            'channel' => ['required', 'string', 'in:email,in_app,push'],
            'is_enabled' => ['required', 'boolean'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $preference = NotificationPreference::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'category' => $validated['category'],
                'channel' => $validated['channel'],
            ],
            [
                'is_enabled' => $validated['is_enabled'],
            ]
        );

        return response()->json([
            'data' => $preference,
            'message' => 'Notification preference updated.',
        ]);
    }
}
