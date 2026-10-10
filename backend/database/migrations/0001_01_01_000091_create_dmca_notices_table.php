<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dmca_notices', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->string('claimant_name');
            $table->string('claimant_email');
            $table->string('infringing_work_url');
            $table->string('status', 30)->default('received')->index(); // received, under_review, strike_issued, counter_notice_filed, resolved
            $table->boolean('strike_applied')->default(false)->index();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['instructor_id', 'strike_applied']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dmca_notices');
    }
};
