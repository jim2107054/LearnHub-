<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('gateway', 50)->index(); // stripe, paypal, mediaconvert
            $table->string('gateway_event_id')->index();
            $table->string('event_type', 100)->index();
            $table->json('payload');
            $table->string('status', 30)->default('pending')->index(); // pending, processed, failed, ignored
            $table->text('error_message')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->unique(['gateway', 'gateway_event_id'], 'unique_gateway_event');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_events');
    }
};
