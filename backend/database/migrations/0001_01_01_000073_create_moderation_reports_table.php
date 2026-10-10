<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moderation_reports', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('reportable_type');
            $table->unsignedBigInteger('reportable_id');
            $table->string('reason', 50)->index(); // spam, harassment, hate_speech, copyright, inappropriate
            $table->text('details')->nullable();
            $table->string('status', 30)->default('pending')->index(); // pending, reviewed, dismissed, action_taken
            $table->foreignId('moderated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('moderated_at')->nullable();
            $table->text('moderator_notes')->nullable();
            $table->timestamps();

            $table->index(['reportable_type', 'reportable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moderation_reports');
    }
};
