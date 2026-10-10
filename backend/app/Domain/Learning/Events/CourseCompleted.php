<?php

declare(strict_types=1);

namespace App\Domain\Learning\Events;

use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Models\Enrollment;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CourseCompleted
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public User $user,
        public Course $course,
        public Enrollment $enrollment
    ) {}
}
