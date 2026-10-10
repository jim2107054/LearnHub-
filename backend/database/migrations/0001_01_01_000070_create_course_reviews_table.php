<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('course_reviews', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('rating'); // 1-5
            $table->text('content')->nullable();
            $table->text('instructor_reply')->nullable();
            $table->timestamp('instructor_replied_at')->nullable();
            $table->boolean('is_verified_purchase')->default(true);
            $table->unsignedInteger('helpful_votes_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'course_id']);
            $table->index(['course_id', 'rating']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('course_reviews');
    }
};
