<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructor_earnings', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->unsignedInteger('gross_amount');
            $table->unsignedInteger('platform_fee_amount');
            $table->unsignedInteger('tax_withheld_amount')->default(0);
            $table->unsignedInteger('net_earnings_amount');
            $table->string('currency', 3)->default('USD');
            $table->unsignedTinyInteger('revenue_share_percent'); // 37% or 97%
            $table->string('source_type', 30)->default('platform_organic'); // platform_organic, instructor_coupon, referral
            $table->string('status', 30)->default('pending_hold')->index(); // pending_hold, available, paid, reversed, on_hold
            $table->timestamp('available_at')->index(); // 30-day refund hold
            $table->unsignedBigInteger('payout_id')->nullable()->index();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['instructor_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_earnings');
    }
};
