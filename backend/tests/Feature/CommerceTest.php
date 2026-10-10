<?php

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Commerce\Enums\OrderStatus;
use App\Domain\Commerce\Models\CartItem;
use App\Domain\Commerce\Models\Order;
use App\Domain\Finance\Models\LedgerEntry;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\Coupon;
use App\Domain\Learning\Models\Enrollment;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->instructor = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Commerce Instructor',
        'email' => 'comm_instructor@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->learner = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Commerce Learner',
        'email' => 'comm_learner@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->learner->assignRole(UserRole::LEARNER->value);

    $this->course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Mastering E-Commerce Architecture',
        'slug' => 'mastering-ecommerce-architecture',
        'status' => CourseStatus::PUBLISHED,
        'price_amount' => 5000, // $50.00
        'price_currency' => 'USD',
    ]);

    $this->actingAs($this->learner);
});

test('it manages cart items and calculates price breakdown', function () {
    // 1. Add course to cart
    $addResponse = $this->postJson('/api/v1/cart/items', [
        'course_id' => $this->course->ulid,
    ]);
    $addResponse->assertStatus(201);

    // 2. View cart
    $cartResponse = $this->getJson('/api/v1/cart');
    $cartResponse->assertStatus(200)
        ->assertJsonPath('data.pricing.subtotal.amount', 5000)
        ->assertJsonPath('data.pricing.total.amount', 5000);
});

test('it applies coupon to cart and recalculates totals', function () {
    CartItem::create([
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
    ]);

    $coupon = Coupon::create([
        'ulid' => (string) Str::ulid(),
        'instructor_id' => $this->instructor->id,
        'course_id' => $this->course->id,
        'code' => 'HALFPRICE',
        'discount_type' => 'percentage',
        'discount_value' => 50,
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/v1/cart/coupon', [
        'code' => 'HALFPRICE',
    ]);
    $response->assertStatus(200);

    $cartResponse = $this->getJson('/api/v1/cart');
    $cartResponse->assertStatus(200)
        ->assertJsonPath('data.pricing.discount.amount', 2500)
        ->assertJsonPath('data.pricing.total.amount', 2500);
});

test('it creates checkout order and returns payment client secret', function () {
    CartItem::create([
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
    ]);

    $response = $this->postJson('/api/v1/checkout', [
        'billing_country' => 'US',
        'billing_name' => 'Commerce Learner',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'order_id',
                'order_number',
                'status',
                'total',
                'client_secret',
                'is_free',
            ],
        ]);

    $orderId = $response->json('data.order_id');
    $this->assertDatabaseHas('orders', [
        'ulid' => $orderId,
        'status' => 'pending',
        'total_amount' => 5000,
    ]);
});

test('it processes webhook payment event, provisions enrollment, and balances ledger', function () {
    CartItem::create([
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
    ]);

    $checkout = $this->postJson('/api/v1/checkout', ['billing_country' => 'US']);
    $orderUlid = $checkout->json('data.order_id');

    $order = Order::where('ulid', $orderUlid)->first();

    // Trigger Stripe webhook simulation
    $webhookPayload = [
        'id' => 'evt_test_'.Str::random(16),
        'type' => 'payment_intent.succeeded',
        'data' => [
            'object' => [
                'id' => $order->gateway_intent_id,
                'metadata' => [
                    'order_id' => $order->ulid,
                ],
            ],
        ],
    ];

    $response = $this->postJson('/api/v1/commerce/webhooks/stripe', $webhookPayload);
    $response->assertStatus(200);

    // 1. Order should now be marked paid
    $order->refresh();
    expect($order->status)->toBe(OrderStatus::PAID);

    // 2. Enrollment provisioned
    $this->assertDatabaseHas('enrollments', [
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
        'status' => 'active',
    ]);

    // 3. Double-entry ledger balanced (debits === credits)
    $ledgerEntries = LedgerEntry::where('reference_id', $order->ulid)->get();
    $debits = $ledgerEntries->where('entry_type', 'debit')->sum('amount');
    $credits = $ledgerEntries->where('entry_type', 'credit')->sum('amount');

    expect($debits)->toBe($order->total_amount);
    expect($credits)->toBe($order->total_amount);
    expect($debits)->toBe($credits); // Fundamental financial invariant
});

test('it processes refund and revokes course access', function () {
    CartItem::create([
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
    ]);

    $checkout = $this->postJson('/api/v1/checkout');
    $order = Order::where('ulid', $checkout->json('data.order_id'))->first();

    // Simulate paid order and enrollment
    app(\App\Domain\Commerce\Actions\ProcessPaymentSuccessAction::class)->execute($order);

    // Request refund
    $refundResponse = $this->postJson("/api/v1/orders/{$order->ulid}/refund", [
        'course_id' => $this->course->ulid,
        'reason' => 'Course was not what I expected',
    ]);

    $refundResponse->assertStatus(200)
        ->assertJsonPath('data.status', 'processed');

    // Enrollment revoked
    $enrollment = Enrollment::where('user_id', $this->learner->id)->where('course_id', $this->course->id)->first();
    expect($enrollment->status)->toBe('refunded');
});

test('it rejects refund request when progress exceeds allowable threshold (10%)', function () {
    CartItem::create([
        'user_id' => $this->learner->id,
        'course_id' => $this->course->id,
    ]);

    $checkout = $this->postJson('/api/v1/checkout');
    $order = Order::where('ulid', $checkout->json('data.order_id'))->first();

    app(\App\Domain\Commerce\Actions\ProcessPaymentSuccessAction::class)->execute($order);

    // Learner watched 45% of the course
    Enrollment::where('user_id', $this->learner->id)
        ->where('course_id', $this->course->id)
        ->update(['progress_percent' => 45]);

    $refundResponse = $this->postJson("/api/v1/orders/{$order->ulid}/refund", [
        'course_id' => $this->course->ulid,
        'reason' => 'Watched half the course and want money back',
    ]);

    $refundResponse->assertStatus(422)
        ->assertJsonValidationErrors(['progress']);
});
