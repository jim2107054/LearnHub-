<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('instructor_payout_methods', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->string('type', 30); // paypal, stripe_connect, bank_transfer
            $table->string('payout_email')->nullable();
            $table->text('account_details')->nullable(); // encrypted
            $table->boolean('is_default')->default(false);
            $table->boolean('is_verified')->default(true);
            $table->timestamps();

            $table->index(['instructor_id', 'is_default']);
        });

        Schema::create('instructor_tax_profiles', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('instructor_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('tax_form_type', 20); // W9, W8BEN, VAT_EXEMPT
            $table->text('tax_id_number'); // encrypted
            $table->string('legal_name');
            $table->string('country', 2);
            $table->string('status', 30)->default('pending')->index(); // pending, verified, rejected
            $table->timestamp('submitted_at');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('instructor_tax_profiles');
        Schema::dropIfExists('instructor_payout_methods');
    }
};
