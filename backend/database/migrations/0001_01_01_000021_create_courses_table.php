<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->foreignId('primary_instructor_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('subtitle')->nullable();
            $table->longText('description')->nullable();
            $table->string('level', 30)->default('all_levels')->index();
            $table->string('language', 10)->default('en')->index();

            // Price in minor units (integer cents, never floats)
            $table->unsignedInteger('price_amount')->default(0)->index();
            $table->string('price_currency', 3)->default('USD');

            $table->string('thumbnail_url')->nullable();
            $table->string('promo_video_url')->nullable();
            $table->string('status', 30)->default('draft')->index();

            // Learning objectives & requirements
            $table->json('requirements')->nullable();
            $table->json('what_you_will_learn')->nullable();

            // Denormalized metrics for high performance
            $table->decimal('rating_cache', 3, 2)->default(0.00)->index();
            $table->unsignedInteger('reviews_count')->default(0)->index();
            $table->unsignedInteger('enrollments_count')->default(0)->index();
            $table->unsignedInteger('total_duration_seconds')->default(0)->index();
            $table->unsignedInteger('lectures_count')->default(0);

            // Editorial flags
            $table->boolean('is_featured')->default(false)->index();
            $table->boolean('is_trending')->default(false)->index();

            $table->timestamp('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
