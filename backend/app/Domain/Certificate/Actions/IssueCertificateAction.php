<?php

declare(strict_types=1);

namespace App\Domain\Certificate\Actions;

use App\Domain\Catalog\Models\Course;
use App\Domain\Certificate\Models\Certificate;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Models\Enrollment;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class IssueCertificateAction
{
    public function execute(User $user, Course $course): Certificate
    {
        // 1. Check completion status
        /** @var Enrollment|null $enrollment */
        $enrollment = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if (! $enrollment || $enrollment->progress_percent < 100) {
            throw ValidationException::withMessages([
                'course' => ['You must complete 100% of the course lectures and assessments to earn a certificate.'],
            ]);
        }

        // 2. Check for existing certificate
        /** @var Certificate|null $existing */
        $existing = Certificate::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        // 3. Issue certificate with unique code
        $code = 'CRT-'.now()->format('Ymd').'-'.strtoupper(Str::random(8));

        return Certificate::query()->create([
            'ulid' => (string) Str::ulid(),
            'certificate_code' => $code,
            'user_id' => $user->id,
            'course_id' => $course->id,
            'issued_at' => now(),
            'status' => 'valid',
        ]);
    }
}
