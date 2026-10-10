<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ledger_entries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->ulid('transaction_id')->index(); // Identifies balanced debit & credit pairs
            $table->string('account_type', 50)->index(); // cash_clearing, platform_revenue, instructor_earnings, tax_payable, refund_clearing
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // Associated instructor if applicable
            $table->string('entry_type', 10); // debit, credit
            $table->unsignedInteger('amount'); // Minor units integer
            $table->string('currency', 3)->default('USD');
            $table->string('reference_type', 50)->index(); // order, refund, payout
            $table->string('reference_id')->index();
            $table->string('description');
            $table->timestamp('created_at')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ledger_entries');
    }
};
