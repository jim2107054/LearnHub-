<?php

declare(strict_types=1);

namespace App\Domain\Identity\Http\Controllers;

use App\Domain\Identity\Actions\ConfirmTotpMfaAction;
use App\Domain\Identity\Actions\DisableTotpMfaAction;
use App\Domain\Identity\Actions\EnableTotpMfaAction;
use App\Domain\Identity\Http\Requests\ConfirmMfaRequest;
use App\Domain\Identity\Http\Requests\DisableMfaRequest;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class MfaController extends Controller
{
    public function enable(Request $request, EnableTotpMfaAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $result = $action->execute($user);

        return response()->json([
            'data' => [
                'secret' => $result['secret'],
                'qr_code_url' => $result['qr_code_url'],
                'recovery_codes' => $result['recovery_codes'],
            ],
            'message' => 'MFA setup initiated. Please confirm by verifying a 6-digit TOTP code.',
        ]);
    }

    public function confirm(ConfirmMfaRequest $request, ConfirmTotpMfaAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->execute($user, $request->validated('code'));

        return response()->json([
            'message' => 'Two-factor authentication successfully enabled.',
        ]);
    }

    public function disable(DisableMfaRequest $request, DisableTotpMfaAction $action): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $action->execute($user, $request->validated('password'));

        return response()->json([
            'message' => 'Two-factor authentication has been disabled.',
        ]);
    }
}
