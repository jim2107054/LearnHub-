<?php

use App\Domain\Catalog\Enums\CourseStatus;
use App\Domain\Catalog\Models\Course;
use App\Domain\Commerce\Enums\OrderStatus;
use App\Domain\Commerce\Models\Order;
use App\Domain\Commerce\Models\OrderItem;
use App\Domain\Finance\Models\InstructorEarning;
use App\Domain\Finance\Models\InstructorPayoutMethod;
use App\Domain\Finance\Models\InstructorTaxProfile;
use App\Domain\Finance\Models\LedgerEntry;
use App\Domain\Finance\Models\PayoutBatch;
use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->admin = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Finance Admin',
        'email' => 'finance_admin@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->admin->assignRole(UserRole::SUPER_ADMIN->value);

    $this->instructor = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Top Instructor',
        'email' => 'top_instructor@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->course = Course::create([
        'ulid' => (string) Str::ulid(),
        'primary_instructor_id' => $this->instructor->id,
        'title' => 'Rust Microservices in Production',
        'slug' => 'rust-microservices-in-production',
        'status' => CourseStatus::PUBLISHED,
        'price_amount' => 10000, // $100.00
        'price_currency' => 'USD',
    ]);

    $this->order = Order::create([
        'ulid' => (string) Str::ulid(),
        'user_id' => $this->admin->id,
        'order_number' => 'ORD-12345678',
        'status' => OrderStatus::PAID,
        'subtotal_amount' => 10000,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total_amount' => 10000,
        'currency' => 'USD',
        'payment_gateway' => 'stripe',
        'paid_at' => now(),
    ]);

    $this->orderItem = OrderItem::create([
        'ulid' => (string) Str::ulid(),
        'order_id' => $this->order->id,
        'course_id' => $this->course->id,
        'instructor_id' => $this->instructor->id,
        'price_amount' => 10000,
        'discount_amount' => 0,
        'tax_amount' => 0,
        'total_amount' => 10000,
        'platform_fee_amount' => 6300, // 63%
        'instructor_share_amount' => 3700, // 37% ($37.00)
    ]);

    $this->actingAs($this->instructor);
});

test('instructor can view earnings dashboard with gross, net, and balances', function () {
    // Create an earning for the instructor
    InstructorEarning::create([
        'ulid' => (string) Str::ulid(),
        'instructor_id' => $this->instructor->id,
        'order_id' => $this->order->id,
        'order_item_id' => $this->orderItem->id,
        'course_id' => $this->course->id,
        'gross_amount' => 10000,
        'platform_fee_amount' => 6300,
        'tax_withheld_amount' => 0,
        'net_earnings_amount' => 3700,
        'currency' => 'USD',
        'revenue_share_percent' => 37,
        'source_type' => 'platform_organic',
        'status' => 'pending_hold',
        'available_at' => now()->addDays(30),
    ]);

    $response = $this->getJson('/api/v1/instructor/earnings');

    $response->assertStatus(200)
        ->assertJson([
            'data' => [
                'summary' => [
                    'gross_sales' => 10000,
                    'platform_fees' => 6300,
                    'net_earnings' => 3700,
                    'pending_hold_balance' => 3700,
                    'available_balance' => 0,
                    'paid_total' => 0,
                    'currency' => 'USD',
                ],
            ],
        ]);
});

test('instructor can manage payout methods and submit tax profile', function () {
    // 1. Add payout method
    $methodRes = $this->postJson('/api/v1/instructor/payout-methods', [
        'type' => 'paypal',
        'payout_email' => 'payouts@instructor.com',
    ]);

    $methodRes->assertStatus(201)
        ->assertJson([
            'data' => [
                'type' => 'paypal',
                'payout_email' => 'payouts@instructor.com',
                'is_default' => true,
            ],
        ]);

    // 2. Submit tax profile (W-9)
    $taxRes = $this->postJson('/api/v1/instructor/tax-profile', [
        'tax_form_type' => 'W9',
        'tax_id_number' => '12-3456789',
        'legal_name' => 'John Instructor LLC',
        'country' => 'US',
    ]);

    $taxRes->assertStatus(201)
        ->assertJson([
            'data' => [
                'status' => 'verified',
                'tax_form_type' => 'W9',
            ],
        ]);
});

test('finance admin can generate and execute monthly payout batch with balanced ledger entries', function () {
    // 1. Setup instructor compliance (verified tax profile & default payout method)
    InstructorTaxProfile::create([
        'ulid' => (string) Str::ulid(),
        'instructor_id' => $this->instructor->id,
        'tax_form_type' => 'W9',
        'tax_id_number' => '12-3456789',
        'legal_name' => 'John Instructor LLC',
        'country' => 'US',
        'status' => 'verified',
        'submitted_at' => now(),
        'verified_at' => now(),
    ]);

    $method = InstructorPayoutMethod::create([
        'ulid' => (string) Str::ulid(),
        'instructor_id' => $this->instructor->id,
        'type' => 'paypal',
        'payout_email' => 'payouts@instructor.com',
        'is_default' => true,
        'is_verified' => true,
    ]);

    // 2. Create available earnings >= $50 threshold (6000 cents = $60)
    $earning = InstructorEarning::create([
        'ulid' => (string) Str::ulid(),
        'instructor_id' => $this->instructor->id,
        'order_id' => $this->order->id,
        'order_item_id' => $this->orderItem->id,
        'course_id' => $this->course->id,
        'gross_amount' => 10000,
        'platform_fee_amount' => 4000,
        'tax_withheld_amount' => 0,
        'net_earnings_amount' => 6000,
        'currency' => 'USD',
        'revenue_share_percent' => 60,
        'source_type' => 'platform_organic',
        'status' => 'available',
        'available_at' => now()->subDay(), // hold period past
    ]);

    // 3. Admin generates payout batch
    $this->actingAs($this->admin);

    $batchRes = $this->postJson('/api/v1/admin/finance/payout-batches');
    $batchRes->assertStatus(201);
    $batchUlid = $batchRes->json('data.ulid');

    // 4. Admin approves and executes batch
    $approveRes = $this->postJson("/api/v1/admin/finance/payout-batches/{$batchUlid}/approve");
    $approveRes->assertStatus(200)
        ->assertJson([
            'data' => [
                'status' => 'completed',
            ],
        ]);

    // 5. Verify ledger entries balanced (debit instructor_earnings == credit cash_clearing)
    $debits = LedgerEntry::query()
        ->where('account_type', 'instructor_earnings')
        ->where('entry_type', 'debit')
        ->sum('amount');

    $credits = LedgerEntry::query()
        ->where('account_type', 'cash_clearing')
        ->where('entry_type', 'credit')
        ->sum('amount');

    expect($debits)->toBe(6000);
    expect($credits)->toBe(6000);

    // Earning marked as paid
    $earning->refresh();
    expect($earning->status)->toBe('paid');
});

test('admin can place hold and release hold on instructor earning', function () {
    $earning = InstructorEarning::create([
        'ulid' => (string) Str::ulid(),
        'instructor_id' => $this->instructor->id,
        'order_id' => $this->order->id,
        'order_item_id' => $this->orderItem->id,
        'course_id' => $this->course->id,
        'gross_amount' => 5000,
        'platform_fee_amount' => 2000,
        'tax_withheld_amount' => 0,
        'net_earnings_amount' => 3000,
        'currency' => 'USD',
        'revenue_share_percent' => 60,
        'source_type' => 'platform_organic',
        'status' => 'available',
        'available_at' => now()->subDay(),
    ]);

    $this->actingAs($this->admin);

    // Place hold
    $holdRes = $this->postJson("/api/v1/admin/finance/earnings/{$earning->ulid}/hold");
    $holdRes->assertStatus(200);
    $earning->refresh();
    expect($earning->status)->toBe('on_hold');

    // Release hold
    $releaseRes = $this->postJson("/api/v1/admin/finance/earnings/{$earning->ulid}/release");
    $releaseRes->assertStatus(200);
    $earning->refresh();
    expect($earning->status)->toBe('available');
});
