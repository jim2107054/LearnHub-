<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('community_upvotes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('upvoteable_type');
            $table->unsignedBigInteger('upvoteable_id');
            $table->timestamps();

            $table->unique(['user_id', 'upvoteable_type', 'upvoteable_id']);
            $table->index(['upvoteable_type', 'upvoteable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_upvotes');
    }
};
