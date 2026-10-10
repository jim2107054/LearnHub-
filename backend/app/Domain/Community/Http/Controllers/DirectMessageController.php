<?php

declare(strict_types=1);

namespace App\Domain\Community\Http\Controllers;

use App\Domain\Community\Models\DirectMessage;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;

class DirectMessageController extends Controller
{
    /**
     * List recent conversation threads.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // Find users with whom current user exchanged messages
        $sentTo = DirectMessage::query()->where('sender_id', $user->id)->pluck('recipient_id');
        $receivedFrom = DirectMessage::query()->where('recipient_id', $user->id)->pluck('sender_id');

        $partnerIds = $sentTo->merge($receivedFrom)->unique()->values();

        $partners = User::query()
            ->whereIn('id', $partnerIds)
            ->select(['id', 'ulid', 'name', 'avatar_url', 'headline'])
            ->get();

        return response()->json([
            'data' => $partners,
        ]);
    }

    /**
     * Get message thread with a specific user.
     */
    public function conversation(Request $request, string $partnerUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var User $partner */
        $partner = User::query()->where('ulid', $partnerUlid)->firstOrFail();

        $messages = DirectMessage::query()
            ->where(function ($q) use ($user, $partner) {
                $q->where('sender_id', $user->id)->where('recipient_id', $partner->id);
            })
            ->orWhere(function ($q) use ($user, $partner) {
                $q->where('sender_id', $partner->id)->where('recipient_id', $user->id);
            })
            ->orderBy('created_at', 'asc')
            ->get();

        // Mark unread messages from partner as read
        DirectMessage::query()
            ->where('sender_id', $partner->id)
            ->where('recipient_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'data' => $messages,
        ]);
    }

    /**
     * Send direct message to a user (rate-limited).
     */
    public function store(Request $request, string $recipientUlid): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        /** @var User $sender */
        $sender = $request->user();

        /** @var User $recipient */
        $recipient = User::query()->where('ulid', $recipientUlid)->firstOrFail();

        if ($sender->id === $recipient->id) {
            return response()->json([
                'error' => [
                    'code' => 'invalid_recipient',
                    'message' => 'You cannot send a message to yourself.',
                ],
            ], 422);
        }

        $message = DirectMessage::query()->create([
            'ulid' => (string) Str::ulid(),
            'sender_id' => $sender->id,
            'recipient_id' => $recipient->id,
            'message' => $validated['message'],
        ]);

        return response()->json([
            'data' => $message,
            'message' => 'Message sent.',
        ], 201);
    }
}
