<?php

use App\Domain\Catalog\Http\Controllers\CatalogController;
use App\Domain\Catalog\Http\Controllers\CategoryController;
use App\Domain\Catalog\Http\Controllers\WishlistController;
use App\Domain\Identity\Http\Controllers\AuthController;
use App\Domain\Identity\Http\Controllers\MfaController;
use App\Domain\Identity\Http\Controllers\ProfileController;
use App\Domain\Identity\Http\Controllers\SessionController;
use App\Domain\Identity\Http\Controllers\SocialAuthController;
use App\Domain\Instructor\Http\Controllers\InstructorController;
use App\Domain\Media\Http\Controllers\MediaController;
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

    // -------------------------------------------------------------------------
    // Phase 2: Catalog & Storefront (CAT-*)
    // -------------------------------------------------------------------------
    Route::prefix('catalog')->group(function () {
        Route::get('/home', [CatalogController::class, 'home']);
        Route::get('/courses', [CatalogController::class, 'index']);
        Route::get('/courses/{slug}', [CatalogController::class, 'show']);
        Route::get('/courses/{slug}/related', [CatalogController::class, 'related']);
        Route::get('/search/autocomplete', [CatalogController::class, 'autocomplete']);

        Route::get('/categories', [CategoryController::class, 'index']);
        Route::get('/categories/{slug}', [CategoryController::class, 'show']);
    });

    // Media transcode callback webhook
    Route::post('/media/transcode/webhook', [MediaController::class, 'webhook']);

    // -------------------------------------------------------------------------
    // Authenticated Endpoints (Sanctum)
    // -------------------------------------------------------------------------
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

        // Wishlists
        Route::prefix('wishlist')->group(function () {
            Route::get('/', [WishlistController::class, 'index']);
            Route::post('/{courseUlid}', [WishlistController::class, 'store']);
            Route::delete('/{courseUlid}', [WishlistController::class, 'destroy']);
        });

        // ---------------------------------------------------------------------
        // Phase 3: Instructor Studio & Media (INS-*)
        // ---------------------------------------------------------------------
        Route::prefix('instructor')->group(function () {
            Route::post('/onboard', [InstructorController::class, 'onboard']);

            // Courses
            Route::get('/courses', [InstructorController::class, 'courses']);
            Route::post('/courses', [InstructorController::class, 'store']);
            Route::patch('/courses/{courseUlid}', [InstructorController::class, 'update']);
            Route::delete('/courses/{courseUlid}', [InstructorController::class, 'destroy']);

            // Validation & Submissions
            Route::get('/courses/{courseUlid}/validate', [InstructorController::class, 'validateChecklist']);
            Route::post('/courses/{courseUlid}/submit-review', [InstructorController::class, 'submitReview']);

            // Curriculum
            Route::post('/courses/{courseUlid}/sections', [InstructorController::class, 'storeSection']);
            Route::post('/courses/{courseUlid}/sections/{sectionUlid}/lectures', [InstructorController::class, 'storeLecture']);
            Route::post('/courses/{courseUlid}/curriculum/reorder', [InstructorController::class, 'reorderCurriculum']);

            // Coupons
            Route::get('/coupons', [InstructorController::class, 'coupons']);
            Route::post('/coupons', [InstructorController::class, 'storeCoupon']);

            // Multipart Media Upload
            Route::post('/media/multipart/initiate', [MediaController::class, 'initiate']);
            Route::post('/media/multipart/complete', [MediaController::class, 'complete']);
        });
    });
});
