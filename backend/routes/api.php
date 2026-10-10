<?php

use App\Domain\Identity\Http\Controllers\AuthController;
use App\Domain\Identity\Http\Controllers\MfaController;
use App\Domain\Identity\Http\Controllers\ProfileController;
use App\Domain\Identity\Http\Controllers\SessionController;
use App\Domain\Identity\Http\Controllers\SocialAuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| LearnHub API Routes (Version 1)
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    // Health & System Info
    Route::get('/health', function (Request $request) {
        $dbStatus = 'ok';
        $redisStatus = 'ok';

        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $dbStatus = 'unreachable: '.$e->getMessage();
        }

        try {
            Redis::connection()->ping();
        } catch (\Throwable $e) {
            $redisStatus = 'unreachable: '.$e->getMessage();
        }

        $allHealthy = $dbStatus === 'ok' && $redisStatus === 'ok';

        return response()->json([
            'status' => $allHealthy ? 'healthy' : 'degraded',
            'timestamp' => now()->toIso8601String(),
            'correlation_id' => $request->header('X-Correlation-ID'),
            'checks' => [
                'database' => $dbStatus,
                'redis' => $redisStatus,
            ],
        ], $allHealthy ? 200 : 503);
    });

    Route::get('/version', function (Request $request) {
        return response()->json([
            'data' => [
                'name' => config('app.name', 'LearnHub'),
                'api_version' => 'v1.0.0',
                'environment' => config('app.env'),
                'documentation' => url('/docs/api'),
            ],
            'meta' => [
                'correlation_id' => $request->header('X-Correlation-ID'),
            ],
        ]);
    });

    // -------------------------------------------------------------------------
    // Phase 1: Identity & Access (AUTH-*)
    // -------------------------------------------------------------------------
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);

        // Social Authentication
        Route::get('/social/{provider}/redirect', [SocialAuthController::class, 'redirect']);
        Route::post('/social/{provider}/callback', [SocialAuthController::class, 'callback']);
    });

    // Authenticated Endpoints
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Multi-Factor Authentication (TOTP MFA)
        Route::prefix('auth/mfa')->group(function () {
            Route::post('/enable', [MfaController::class, 'enable']);
            Route::post('/confirm', [MfaController::class, 'confirm']);
            Route::post('/disable', [MfaController::class, 'disable']);
        });

        // Profile Management
        Route::prefix('profile')->group(function () {
            Route::get('/', [ProfileController::class, 'show']);
            Route::patch('/', [ProfileController::class, 'update']);
            Route::delete('/', [ProfileController::class, 'destroy']);

            // Device Sessions
            Route::get('/sessions', [SessionController::class, 'index']);
            Route::delete('/sessions/{id}', [SessionController::class, 'destroy']);
        });
    });
});
