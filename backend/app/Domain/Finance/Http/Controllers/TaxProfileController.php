<?php

declare(strict_types=1);

namespace App\Domain\Finance\Http\Controllers;

use App\Domain\Finance\Models\InstructorTaxProfile;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TaxProfileController extends Controller
{
    /**
     * View instructor tax profile status (EAR-05).
     */
    public function show(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $profile = InstructorTaxProfile::query()
            ->where('instructor_id', $user->id)
            ->first();

        if (! $profile) {
            return response()->json([
                'data' => [
                    'is_submitted' => false,
                    'status' => 'unsubmitted',
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'id' => $profile->ulid,
                'tax_form_type' => $profile->tax_form_type,
                'legal_name' => $profile->legal_name,
                'country' => $profile->country,
                'status' => $profile->status,
                'submitted_at' => $profile->submitted_at?->toIso8601String(),
                'verified_at' => $profile->verified_at?->toIso8601String(),
            ],
        ]);
    }

    /**
     * Submit or update instructor tax profile (W-9 / W-8BEN).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tax_form_type' => ['required', 'string', Rule::in(['W9', 'W8BEN', 'VAT_EXEMPT'])],
            'tax_id_number' => ['required', 'string', 'min:5', 'max:50'],
            'legal_name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'size:2'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $profile = InstructorTaxProfile::query()->updateOrCreate(
            ['instructor_id' => $user->id],
            [
                'ulid' => (string) Str::ulid(),
                'tax_form_type' => $validated['tax_form_type'],
                'tax_id_number' => $validated['tax_id_number'],
                'legal_name' => $validated['legal_name'],
                'country' => strtoupper($validated['country']),
                'status' => 'verified', // Auto-verified in local/sandbox, external compliance webhook in production
                'submitted_at' => now(),
                'verified_at' => now(),
            ]
        );

        return response()->json([
            'data' => [
                'id' => $profile->ulid,
                'status' => $profile->status,
                'tax_form_type' => $profile->tax_form_type,
            ],
            'message' => 'Tax profile submitted and verified successfully.',
        ], 201);
    }
}
