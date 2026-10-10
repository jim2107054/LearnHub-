<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Http\Controllers;

use App\Domain\Catalog\Models\Course;
use App\Domain\Commerce\Actions\ProcessRefundAction;
use App\Domain\Commerce\Models\Order;
use App\Domain\Identity\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class OrderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $orders = Order::query()
            ->where('user_id', $user->id)
            ->with(['items.course'])
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json([
            'data' => $orders->items(),
            'meta' => [
                'current_page' => $orders->currentPage(),
                'total' => $orders->total(),
            ],
        ]);
    }

    public function show(Request $request, string $orderUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $order = Order::query()
            ->where('user_id', $user->id)
            ->where('ulid', $orderUlid)
            ->with(['items.course', 'refunds'])
            ->firstOrFail();

        return response()->json([
            'data' => $order,
        ]);
    }

    public function requestRefund(Request $request, string $orderUlid, ProcessRefundAction $action): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'string'],
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var Order $order */
        $order = Order::query()
            ->where('user_id', $user->id)
            ->where('ulid', $orderUlid)
            ->firstOrFail();

        /** @var Course $course */
        $course = Course::query()->where('ulid', $validated['course_id'])->firstOrFail();

        $refund = $action->execute(
            order: $order,
            course: $course,
            user: $user,
            reason: $validated['reason'] ?? 'Customer refund request'
        );

        return response()->json([
            'data' => $refund,
            'message' => 'Refund processed successfully and course enrollment revoked.',
        ]);
    }
}
