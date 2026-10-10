<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('order_number')->unique();
            $table->string('status', 30)->default('pending')->index();

            // Amounts in integer minor units (e.g. cents)
            $table->unsignedInteger('subtotal_amount')->default(0);
            $table->unsignedInteger('discount_amount')->default(0);
            $table->unsignedInteger('tax_amount')->default(0);
            $table->unsignedInteger('total_amount')->default(0)->index();
            $table->string('currency', 3)->default('USD');

            // Gateway references
            $table->string('payment_gateway', 50)->default('stripe');
            $table->string('gateway_intent_id')->nullable()->index();

            // Billing details for invoice/tax
            $table->string('billing_name')->nullable();
            $table->string('billing_country', 2)->nullable();
            $table->string('billing_postal_code', 20)->nullable();

            $table->timestamp('paid_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->nullOnDelete();

            $table->unsignedInteger('unit_price_amount');
            $table->unsignedInteger('discount_amount')->default(0);
            $table->unsignedInteger('tax_amount')->default(0);
            $table->unsignedInteger('total_amount');

            // Revenue split calculations per line item
            $table->unsignedInteger('platform_fee_amount')->default(0);
            $table->unsignedInteger('instructor_share_amount')->default(0);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
