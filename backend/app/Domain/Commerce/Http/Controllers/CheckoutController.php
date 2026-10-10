<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Http\Controllers;

use App\Domain\Commerce\Actions\CreateCheckoutOrderAction;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class CheckoutController extends Controller
{
    public function checkout(Request $request, CreateCheckoutOrderAction $action): JsonResponse
    {
        $validated = $request->validate([
            'billing_country' => ['nullable', 'string', 'size:2'],
            'billing_name' => ['nullable', 'string', 'max:255'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $result = $action->execute(
            user: $user,
            countryCode: $validated['billing_country'] ?? 'US',
            billingName: $validated['billing_name'] ?? null
        );

        return response()->json([
            'data' => [
                'order_id' => $result['order']->ulid,
                'order_number' => $result['order']->order_number,
                'status' => $result['order']->status->value,
                'total' => $result['order']->total->toArray(),
                'client_secret' => $result['client_secret'],
                'is_free' => $result['is_free'],
            ],
            'message' => $result['is_free']
                ? 'Free order fulfilled. You are now enrolled.'
                : 'Order created. Please complete payment with the provided client secret.',
        ], 201);
    }
}
