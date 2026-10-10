<?php

declare(strict_types=1);

namespace App\Domain\Finance\Http\Controllers;

use App\Domain\Finance\Models\InstructorPayoutMethod;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class PayoutMethodController extends Controller
{
    /**
     * List instructor payout methods.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $methods = InstructorPayoutMethod::query()
            ->where('instructor_id', $user->id)
            ->get(['ulid', 'type', 'payout_email', 'is_default', 'is_verified', 'created_at']);

        return response()->json([
            'data' => $methods,
        ]);
    }

    /**
     * Add a payout method (EAR-04).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'string', Rule::in(['paypal', 'stripe_connect', 'bank_transfer'])],
            'payout_email' => ['nullable', 'email'],
            'account_details' => ['nullable', 'array'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $hasExisting = InstructorPayoutMethod::query()->where('instructor_id', $user->id)->exists();

        $method = InstructorPayoutMethod::query()->create([
            'ulid' => (string) Str::ulid(),
            'instructor_id' => $user->id,
            'type' => $validated['type'],
            'payout_email' => $validated['payout_email'] ?? null,
            'account_details' => $validated['account_details'] ?? null,
            'is_default' => ! $hasExisting, // Automatically default if first method
            'is_verified' => true,
        ]);

        return response()->json([
            'data' => [
                'id' => $method->ulid,
                'type' => $method->type,
                'payout_email' => $method->payout_email,
                'is_default' => $method->is_default,
                'is_verified' => $method->is_verified,
            ],
            'message' => 'Payout method added successfully.',
        ], 201);
    }

    /**
     * Set a payout method as default.
     */
    public function setDefault(Request $request, string $ulid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var InstructorPayoutMethod $method */
        $method = InstructorPayoutMethod::query()
            ->where('ulid', $ulid)
            ->where('instructor_id', $user->id)
            ->firstOrFail();

        InstructorPayoutMethod::query()
            ->where('instructor_id', $user->id)
            ->update(['is_default' => false]);

        $method->update(['is_default' => true]);

        return response()->json([
            'message' => 'Default payout method updated.',
        ]);
    }

    /**
     * Remove a payout method.
     */
    public function destroy(Request $request, string $ulid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var InstructorPayoutMethod $method */
        $method = InstructorPayoutMethod::query()
            ->where('ulid', $ulid)
            ->where('instructor_id', $user->id)
            ->firstOrFail();

        $method->delete();

        return response()->json([
            'message' => 'Payout method removed.',
        ]);
    }
}
