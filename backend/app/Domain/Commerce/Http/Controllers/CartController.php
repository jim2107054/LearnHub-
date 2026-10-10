<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Http\Controllers;

use App\Domain\Catalog\Models\Course;
use App\Domain\Commerce\Models\CartItem;
use App\Domain\Commerce\Services\CartService;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function __construct(
        protected CartService $cartService
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $country = $request->string('country', 'US')->toString();

        $summary = $this->cartService->getSummary($user, $country);

        return response()->json([
            'data' => [
                'items' => $summary['items']->map(fn ($item) => [
                    'id' => $item->id,
                    'course' => [
                        'id' => $item->course->ulid,
                        'title' => $item->course->title,
                        'slug' => $item->course->slug,
                        'thumbnail_url' => $item->course->thumbnail_url,
                        'price' => [
                            'amount' => $item->course->price_amount,
                            'currency' => $item->course->price_currency,
                            'formatted' => $item->course->price->format(),
                        ],
                        'instructor' => $item->course->primaryInstructor?->name,
                    ],
                    'coupon' => $item->coupon ? [
                        'code' => $item->coupon->code,
                        'discount_type' => $item->coupon->discount_type,
                        'discount_value' => $item->coupon->discount_value,
                    ] : null,
                ]),
                'pricing' => [
                    'subtotal' => $summary['subtotal']->toArray(),
                    'discount' => $summary['discount']->toArray(),
                    'tax' => $summary['tax']->toArray(),
                    'total' => $summary['total']->toArray(),
                ],
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => ['required', 'string'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()->where('ulid', $validated['course_id'])->firstOrFail();

        CartItem::firstOrCreate([
            'user_id' => $user->id,
            'course_id' => $course->id,
        ]);

        return response()->json([
            'message' => 'Course added to cart.',
        ], 201);
    }

    public function destroy(Request $request, string $courseUlid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var Course $course */
        $course = Course::query()->where('ulid', $courseUlid)->firstOrFail();

        CartItem::query()
            ->where('user_id', $user->id)
            ->where('course_id', $course->id)
            ->delete();

        return response()->json([
            'message' => 'Course removed from cart.',
        ]);
    }

    public function applyCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
        ]);

        /** @var User $user */
        $user = $request->user();

        /** @var Coupon|null $coupon */
        $coupon = Coupon::query()
            ->where('code', strtoupper(trim($validated['code'])))
            ->first();

        if (! $coupon || ! $coupon->isValid()) {
            throw ValidationException::withMessages([
                'code' => ['The promotional code is invalid or has expired.'],
            ]);
        }

        // Apply coupon to eligible items in user's cart
        $cartQuery = CartItem::query()->where('user_id', $user->id);

        if ($coupon->course_id) {
            $cartQuery->where('course_id', $coupon->course_id);
        }

        $appliedCount = $cartQuery->update(['coupon_id' => $coupon->id]);

        if ($appliedCount === 0) {
            throw ValidationException::withMessages([
                'code' => ['This coupon does not apply to any courses currently in your cart.'],
            ]);
        }

        return response()->json([
            'message' => 'Coupon successfully applied.',
        ]);
    }

    public function removeCoupon(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        CartItem::query()
            ->where('user_id', $user->id)
            ->update(['coupon_id' => null]);

        return response()->json([
            'message' => 'Coupon removed.',
        ]);
    }
}
