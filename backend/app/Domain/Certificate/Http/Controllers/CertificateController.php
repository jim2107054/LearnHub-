<?php

declare(strict_types=1);

namespace App\Domain\Certificate\Http\Controllers;

use App\Domain\Catalog\Models\Course;
use App\Domain\Certificate\Actions\IssueCertificateAction;
use App\Domain\Certificate\Models\Certificate;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CertificateController extends Controller
{
    /**
     * Issue certificate upon successful course completion.
     */
    public function issue(Request $request, string $courseUlid, IssueCertificateAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()->where('ulid', $courseUlid)->firstOrFail();

        $certificate = $action->execute($user, $course);

        return response()->json([
            'data' => [
                'id' => $certificate->ulid,
                'certificate_code' => $certificate->certificate_code,
                'course' => [
                    'id' => $course->ulid,
                    'title' => $course->title,
                ],
                'student_name' => $user->name,
                'issued_at' => $certificate->issued_at?->toIso8601String(),
                'status' => $certificate->status,
                'verification_url' => url('/api/v1/certificates/verify/'.$certificate->certificate_code),
            ],
            'message' => 'Certificate issued successfully.',
        ], 201);
    }

    /**
     * View user's earned certificate.
     */
    public function show(Request $request, string $certificateUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Certificate $certificate */
        $certificate = Certificate::query()
            ->where('ulid', $certificateUlid)
            ->where('user_id', $user->id)
            ->with(['course.primaryInstructor'])
            ->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $certificate->ulid,
                'certificate_code' => $certificate->certificate_code,
                'course' => [
                    'id' => $certificate->course->ulid,
                    'title' => $certificate->course->title,
                    'instructor' => $certificate->course->primaryInstructor?->name,
                ],
                'student_name' => $user->name,
                'issued_at' => $certificate->issued_at?->toIso8601String(),
                'status' => $certificate->status,
                'verification_url' => url('/api/v1/certificates/verify/'.$certificate->certificate_code),
            ],
        ]);
    }

    /**
     * Public certificate verification endpoint (unauthenticated).
     */
    public function verify(string $code): JsonResponse
    {
        /** @var Certificate|null $certificate */
        $certificate = Certificate::query()
            ->where('certificate_code', strtoupper(trim($code)))
            ->with(['course.primaryInstructor', 'user'])
            ->first();

        if (! $certificate) {
            return response()->json([
                'error' => [
                    'code' => 'certificate_not_found',
                    'message' => 'No valid certificate found for this verification code.',
                    'details' => [],
                    'correlation_id' => request()->header('X-Correlation-ID'),
                ],
            ], 404);
        }

        return response()->json([
            'data' => [
                'certificate_code' => $certificate->certificate_code,
                'student_name' => $certificate->user->name,
                'course_title' => $certificate->course->title,
                'instructor_name' => $certificate->course->primaryInstructor?->name,
                'issued_at' => $certificate->issued_at?->toIso8601String(),
                'status' => $certificate->status,
                'is_valid' => $certificate->isValid(),
            ],
        ]);
    }
}
