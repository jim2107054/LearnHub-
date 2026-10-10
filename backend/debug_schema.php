<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;

DB::listen(function($query) {
    echo "QUERY: " . $query->sql . "\n";
});

try {
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
        $table->boolean('mfa_enabled')->default(false);
        $table->text('mfa_secret')->nullable();
        $table->text('mfa_recovery_codes')->nullable();
        $table->timestamp('mfa_confirmed_at')->nullable();
        $table->unsignedSmallInteger('failed_login_attempts')->default(0);
        $table->timestamp('locked_until')->nullable();
        $table->string('terms_version')->nullable();
        $table->timestamp('terms_accepted_at')->nullable();
        $table->string('status', 30)->default('active')->index();
        $table->timestamp('deletion_requested_at')->nullable();
        $table->rememberToken();
        $table->timestamps();
        $table->softDeletes();
    });
    echo "USERS TABLE CREATED SUCCESSFULLY!\n";
} catch (Throwable $e) {
    echo "EXACT ERROR: " . $e->getMessage() . "\n";
    if ($e->getPrevious()) {
        echo "PREVIOUS: " . $e->getPrevious()->getMessage() . "\n";
    }
}
