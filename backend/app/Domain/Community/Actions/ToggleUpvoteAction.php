<?php

declare(strict_types=1);

namespace App\Domain\Community\Actions;

use App\Domain\Community\Models\CommunityUpvote;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Model;

class ToggleUpvoteAction
{
    /**
     * @return array{voted: bool, count: int}
     */
    public function execute(User $user, Model $model): array
    {
        $existing = CommunityUpvote::query()
            ->where('user_id', $user->id)
            ->where('upvoteable_type', $model->getMorphClass())
            ->where('upvoteable_id', $model->getKey())
            ->first();

        if ($existing) {
            $existing->delete();
            $model->decrement('upvotes_count');
            $voted = false;
        } else {
            CommunityUpvote::query()->create([
                'user_id' => $user->id,
                'upvoteable_type' => $model->getMorphClass(),
                'upvoteable_id' => $model->getKey(),
            ]);
            $model->increment('upvotes_count');
            $voted = true;
        }

        return [
            'voted' => $voted,
            'count' => (int) $model->fresh()->upvotes_count,
        ];
    }
}
