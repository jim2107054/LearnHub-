<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->string('avatar_url')->nullable();
            $table->string('headline')->nullable();
            $table->text('bio')->nullable();
            $table->string('locale', 10)->default('en');
            $table->string('timezone', 50)->default('UTC');

            // MFA & Security
            $table->boolean('mfa_enabled')->default(false);
            $table->text('mfa_secret')->nullable(); // Encrypted TOTP secret
            $table->text('mfa_recovery_codes')->nullable(); // Encrypted JSON array
            $table->timestamp('mfa_confirmed_at')->nullable();

            // Lockout tracking
            $table->unsignedSmallInteger('failed_login_attempts')->default(0);
            $table->timestamp('locked_until')->nullable();

            // Terms & Privacy Acceptance
            $table->string('terms_version')->nullable();
            $table->timestamp('terms_accepted_at')->nullable();

            // Account lifecycle
            $table->string('status', 30)->default('active')->index(); // active, deactivated, suspended, banned, deletion_pending
            $table->timestamp('deletion_requested_at')->nullable();

            $table->rememberToken();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
