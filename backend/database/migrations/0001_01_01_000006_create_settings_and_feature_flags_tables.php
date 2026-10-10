<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->json('value');
            $table->string('type', 30)->default('string'); // string, integer, boolean, array, json
            $table->boolean('is_public')->default(false)->index();
            $table->string('description')->nullable();
            $table->timestamps();
        });

        Schema::create('feature_flags', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->boolean('is_enabled')->default(false)->index();
            $table->unsignedTinyInteger('rollout_percentage')->default(0);
            $table->json('rules')->nullable(); // Target user roles, tenant tiers, etc.
            $table->string('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feature_flags');
        Schema::dropIfExists('settings');
    }
};
