<?php

declare(strict_types=1);

namespace App\Domain\Learning\Events;

use App\Domain\Catalog\Models\Lecture;
use App\Domain\Identity\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LectureCompleted
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public User $user,
        public Lecture $lecture
    ) {}
}
