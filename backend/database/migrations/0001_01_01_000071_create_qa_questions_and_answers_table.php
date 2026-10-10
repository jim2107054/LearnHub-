<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qa_questions', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('lecture_id')->nullable()->constrained('lectures')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->text('body');
            $table->unsignedInteger('upvotes_count')->default(0);
            $table->unsignedInteger('answers_count')->default(0);
            $table->boolean('is_solved')->default(false)->index();
            $table->timestamps();

            $table->index(['course_id', 'created_at']);
        });

        Schema::create('qa_answers', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('question_id')->constrained('qa_questions')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_instructor_reply')->default(false);
            $table->boolean('is_best_answer')->default(false)->index();
            $table->unsignedInteger('upvotes_count')->default(0);
            $table->timestamps();

            $table->index(['question_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qa_answers');
        Schema::dropIfExists('qa_questions');
    }
};
