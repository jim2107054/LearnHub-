<?php

declare(strict_types=1);

namespace App\Domain\Identity\Http\Controllers;

use App\Domain\Identity\Actions\RequestAccountDeletionAction;
use App\Domain\Identity\Actions\UpdateProfileAction;
use App\Domain\Identity\DTOs\UpdateProfileData;
use App\Domain\Identity\Http\Requests\DeleteAccountRequest;
use App\Domain\Identity\Http\Requests\UpdateProfileRequest;
use App\Domain\Identity\Http\Resources\UserResource;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => new UserResource($user),
        ]);
    }

    public function update(UpdateProfileRequest $request, UpdateProfileAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $dto = UpdateProfileData::fromArray($request->validated());
        $updatedUser = $action->execute($user, $dto);

        return response()->json([
            'data' => new UserResource($updatedUser),
            'message' => 'Profile updated successfully.',
        ]);
    }

    public function destroy(DeleteAccountRequest $request, RequestAccountDeletionAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->execute($user, $request->validated('password'));

        return response()->json([
            'message' => 'Account deletion requested. Your data will be permanently erased pursuant to data privacy policies.',
        ]);
    }

    /**
     * GDPR Data Portability: export full personal data package (SRS 7.2).
     */
    public function exportData(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $export = [
            'profile' => [
                'id' => $user->ulid,
                'name' => $user->name,
                'email' => $user->email,
                'headline' => $user->headline,
                'bio' => $user->bio,
                'locale' => $user->locale,
                'timezone' => $user->timezone,
                'created_at' => $user->created_at?->toIso8601String(),
            ],
            'enrollments' => \App\Domain\Learning\Models\Enrollment::query()
                ->where('user_id', $user->id)
                ->with(['course:id,ulid,title'])
                ->get(['id', 'ulid', 'course_id', 'progress_percent', 'status', 'enrolled_at', 'completed_at']),
            'orders' => \App\Domain\Commerce\Models\Order::query()
                ->where('user_id', $user->id)
                ->with(['items'])
                ->get(['id', 'ulid', 'order_number', 'total_amount', 'currency', 'status', 'paid_at']),
            'certificates' => \App\Domain\Certificate\Models\Certificate::query()
                ->where('user_id', $user->id)
                ->get(['id', 'ulid', 'certificate_code', 'issued_at', 'status']),
            'notes' => \App\Domain\Learning\Models\LearningNote::query()
                ->where('user_id', $user->id)
                ->get(['id', 'ulid', 'content', 'timestamp_seconds', 'created_at']),
            'exported_at' => now()->toIso8601String(),
        ];

        return response()->json([
            'data' => $export,
            'message' => 'Personal data export ready.',
        ]);
    }
}
