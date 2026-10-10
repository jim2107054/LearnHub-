<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('lecture_id')->nullable()->constrained('lectures')->nullOnDelete();
            $table->string('filename');
            $table->string('mime_type');
            $table->unsignedBigInteger('size_bytes');
            $table->string('status', 30)->default('uploading')->index(); // uploading, uploaded, scanning, transcoding, ready, failed
            $table->string('storage_key');
            $table->string('hls_manifest_key')->nullable();
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->json('thumbnails')->nullable();
            $table->json('captions')->nullable(); // SRT/VTT caption files track keys
            $table->string('transcode_job_id')->nullable()->index();
            $table->text('error_message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};
