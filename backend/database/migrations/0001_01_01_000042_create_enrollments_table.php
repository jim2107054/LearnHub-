<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->string('status', 30)->default('active')->index(); // active, completed, refunded, revoked
            $table->unsignedTinyInteger('progress_percent')->default(0)->index();
            $table->foreignId('last_accessed_lecture_id')->nullable()->constrained('lectures')->nullOnDelete();
            $table->timestamp('last_accessed_at')->nullable();
            $table->timestamp('completed_at')->nullable()->index();
            $table->timestamps();

            $table->unique(['user_id', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
    }
};
