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
}
