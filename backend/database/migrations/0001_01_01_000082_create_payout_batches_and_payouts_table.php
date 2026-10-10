<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_batches', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('batch_number', 50)->unique();
            $table->date('period_start');
            $table->date('period_end');
            $table->unsignedBigInteger('total_payout_amount')->default(0);
            $table->string('currency', 3)->default('USD');
            $table->string('status', 30)->default('pending_approval')->index(); // pending_approval, approved, processing, completed, failed
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });

        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('payout_batch_id')->constrained('payout_batches')->cascadeOnDelete();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('payout_method_id')->nullable()->constrained('instructor_payout_methods')->nullOnDelete();
            $table->unsignedInteger('amount'); // integer minor units
            $table->string('currency', 3)->default('USD');
            $table->string('status', 30)->default('pending')->index(); // pending, paid, failed, on_hold
            $table->text('failure_reason')->nullable();
            $table->string('gateway_payout_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['instructor_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payouts');
        Schema::dropIfExists('payout_batches');
    }
};
