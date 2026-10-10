<?php

use App\Domain\Admin\Http\Controllers\AnalyticsController;
use App\Domain\Admin\Http\Controllers\AuditLogController;
use App\Domain\Admin\Http\Controllers\CourseModerationController;
use App\Domain\Admin\Http\Controllers\DmcaController;
use App\Domain\Admin\Http\Controllers\ModerationQueueController;
use App\Domain\Admin\Http\Controllers\SettingsController;
use App\Domain\Admin\Http\Controllers\UserManagementController;
use App\Domain\Assessment\Http\Controllers\AssessmentController;
use App\Domain\Catalog\Http\Controllers\CatalogController;
use App\Domain\Catalog\Http\Controllers\CategoryController;
use App\Domain\Catalog\Http\Controllers\WishlistController;
use App\Domain\Certificate\Http\Controllers\CertificateController;
use App\Domain\Commerce\Http\Controllers\CartController;
use App\Domain\Commerce\Http\Controllers\CheckoutController;
use App\Domain\Commerce\Http\Controllers\OrderController;
use App\Domain\Commerce\Http\Controllers\WebhookController;
use App\Domain\Community\Http\Controllers\DirectMessageController;
use App\Domain\Community\Http\Controllers\ModerationReportController;
use App\Domain\Community\Http\Controllers\NotificationController;
use App\Domain\Community\Http\Controllers\QaController;
use App\Domain\Community\Http\Controllers\ReviewController;
use App\Domain\Finance\Http\Controllers\AdminFinanceController;
use App\Domain\Finance\Http\Controllers\EarningsController;
use App\Domain\Finance\Http\Controllers\PayoutMethodController;
use App\Domain\Finance\Http\Controllers\TaxProfileController;
use App\Domain\Identity\Http\Controllers\AuthController;
use App\Domain\Identity\Http\Controllers\MfaController;
use App\Domain\Identity\Http\Controllers\ProfileController;
use App\Domain\Identity\Http\Controllers\SessionController;
use App\Domain\Identity\Http\Controllers\SocialAuthController;
use App\Domain\Instructor\Http\Controllers\InstructorController;
use App\Domain\Learning\Http\Controllers\LearningController;
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

    // Deep Subsystem Health Check (Database pooler latency, Redis, Cache, Storage)
    Route::get('/health/deep', function (Request $request) {
        $start = microtime(true);
        $dbStatus = 'ok';
        $dbLatencyMs = 0;

        try {
            DB::select('SELECT 1');
            $dbLatencyMs = round((microtime(true) - $start) * 1000, 2);
        } catch (\Throwable $e) {
            $dbStatus = 'error: '.$e->getMessage();
        }

        $redisStatus = 'ok';
        $redisLatencyMs = 0;
        try {
            $rStart = microtime(true);
            Redis::ping();
            $redisLatencyMs = round((microtime(true) - $rStart) * 1000, 2);
        } catch (\Throwable $e) {
            $redisStatus = 'error: '.$e->getMessage();
        }

        $storageStatus = 'ok';
        try {
            \Illuminate\Support\Facades\Storage::disk('local')->put('.health_probe', 'probe');
            \Illuminate\Support\Facades\Storage::disk('local')->delete('.health_probe');
        } catch (\Throwable $e) {
            $storageStatus = 'error: '.$e->getMessage();
        }

        $healthy = $dbStatus === 'ok' && $redisStatus === 'ok' && $storageStatus === 'ok';

        return response()->json([
            'status' => $healthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'correlation_id' => $request->header('X-Correlation-ID'),
            'checks' => [
                'database_pooler' => [
                    'status' => $dbStatus,
                    'latency_ms' => $dbLatencyMs,
                ],
                'redis_cache' => [
                    'status' => $redisStatus,
                    'latency_ms' => $redisLatencyMs,
                ],
                'storage_disk' => [
                    'status' => $storageStatus,
                ],
            ],
        ], $healthy ? 200 : 503);
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

    // Payment Gateway Webhooks
    Route::prefix('commerce/webhooks')->group(function () {
        Route::post('/stripe', [WebhookController::class, 'handleStripe']);
    });

    // Public Certificate Verification
    Route::get('/certificates/verify/{code}', [CertificateController::class, 'verify']);

    // Community: Public Reviews & Q&A
    Route::get('/courses/{courseSlug}/reviews', [ReviewController::class, 'index']);
    Route::get('/courses/{courseSlug}/qa', [QaController::class, 'questions']);
    Route::get('/qa/questions/{questionUlid}/answers', [QaController::class, 'answers']);

    Route::post('/analytics/events', [AnalyticsController::class, 'ingest']);

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

            // GDPR Data Portability (SRS 7.2)
            Route::post('/export-data', [ProfileController::class, 'exportData']);
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

            // Phase 8: Instructor Earnings & Payouts (EAR-*)
            Route::get('/earnings', [EarningsController::class, 'dashboard']);
            Route::get('/earnings/history', [EarningsController::class, 'history']);
            Route::get('/payout-methods', [PayoutMethodController::class, 'index']);
            Route::post('/payout-methods', [PayoutMethodController::class, 'store']);
            Route::post('/payout-methods/{ulid}/default', [PayoutMethodController::class, 'setDefault']);
            Route::delete('/payout-methods/{ulid}', [PayoutMethodController::class, 'destroy']);
            Route::get('/tax-profile', [TaxProfileController::class, 'show']);
            Route::post('/tax-profile', [TaxProfileController::class, 'store']);

            // Phase 9: Instructor Analytics (ANL-01)
            Route::get('/analytics', [AnalyticsController::class, 'instructorAnalytics']);
        });

        // ---------------------------------------------------------------------
        // Phase 4: Commerce (PAY-*)
        // ---------------------------------------------------------------------
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'index']);
            Route::post('/items', [CartController::class, 'store']);
            Route::delete('/items/{courseUlid}', [CartController::class, 'destroy']);
            Route::post('/coupon', [CartController::class, 'applyCoupon']);
            Route::delete('/coupon', [CartController::class, 'removeCoupon']);
        });

        Route::post('/checkout', [CheckoutController::class, 'checkout'])->middleware('idempotent');

        Route::prefix('orders')->group(function () {
            Route::get('/', [OrderController::class, 'index']);
            Route::get('/{orderUlid}', [OrderController::class, 'show']);
            Route::post('/{orderUlid}/refund', [OrderController::class, 'requestRefund'])->middleware('idempotent');
        });

        // ---------------------------------------------------------------------
        // Phase 5: Learning Experience (LRN-*)
        // ---------------------------------------------------------------------
        Route::prefix('learning')->group(function () {
            Route::get('/enrollments', [LearningController::class, 'enrollments']);
            Route::get('/courses/{courseUlid}/lectures/{lectureUlid}', [LearningController::class, 'lecture']);
            Route::post('/courses/{courseUlid}/lectures/{lectureUlid}/progress', [LearningController::class, 'progress']);

            // Notes & Bookmarks
            Route::get('/lectures/{lectureUlid}/notes', [LearningController::class, 'notes']);
            Route::post('/lectures/{lectureUlid}/notes', [LearningController::class, 'storeNote']);
            Route::delete('/notes/{noteUlid}', [LearningController::class, 'destroyNote']);
        });

        // ---------------------------------------------------------------------
        // Phase 6: Assessments & Certificates (ASM-*, CRT-*)
        // ---------------------------------------------------------------------
        Route::prefix('assessment')->group(function () {
            Route::post('/quizzes/{quizUlid}/start', [AssessmentController::class, 'startQuiz']);
            Route::post('/quizzes/attempts/{attemptUlid}/submit', [AssessmentController::class, 'submitQuiz']);
            Route::post('/assignments/{assignmentUlid}/submit', [AssessmentController::class, 'submitAssignment']);
        });

        Route::prefix('certificates')->group(function () {
            Route::post('/courses/{courseUlid}/issue', [CertificateController::class, 'issue']);
            Route::get('/{certificateUlid}', [CertificateController::class, 'show']);
        });

        // ---------------------------------------------------------------------
        // Phase 7: Community & Notifications (COM-*, NTF-*)
        // ---------------------------------------------------------------------
        // Reviews
        Route::post('/courses/{courseSlug}/reviews', [ReviewController::class, 'store']);
        Route::delete('/reviews/{reviewUlid}', [ReviewController::class, 'destroy']);
        Route::post('/reviews/{reviewUlid}/reply', [ReviewController::class, 'reply']);

        // Q&A
        Route::prefix('qa')->group(function () {
            Route::post('/courses/{courseSlug}/questions', [QaController::class, 'storeQuestion']);
            Route::post('/questions/{questionUlid}/answers', [QaController::class, 'storeAnswer']);
            Route::post('/questions/{questionUlid}/upvote', [QaController::class, 'upvoteQuestion']);
            Route::post('/answers/{answerUlid}/upvote', [QaController::class, 'upvoteAnswer']);
            Route::post('/answers/{answerUlid}/best-answer', [QaController::class, 'markBestAnswer']);
        });

        // Moderation Flags / Reports
        Route::post('/moderation/reports', [ModerationReportController::class, 'store']);

        // Direct Messages
        Route::prefix('messages')->group(function () {
            Route::get('/', [DirectMessageController::class, 'index']);
            Route::get('/{partnerUlid}', [DirectMessageController::class, 'conversation']);
            Route::post('/{recipientUlid}', [DirectMessageController::class, 'store'])->middleware('throttle:30,1');
        });

        // Notifications & Preferences
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/{id}/read', [NotificationController::class, 'markRead']);
            Route::post('/read-all', [NotificationController::class, 'markAllRead']);
            Route::get('/preferences', [NotificationController::class, 'preferences']);
            Route::put('/preferences', [NotificationController::class, 'updatePreferences']);
        });

        // ---------------------------------------------------------------------
        // Phase 8: Finance Admin Payouts & Holds (EAR-*)
        // ---------------------------------------------------------------------
        Route::prefix('admin/finance')->group(function () {
            Route::get('/payout-batches', [AdminFinanceController::class, 'batches']);
            Route::post('/payout-batches', [AdminFinanceController::class, 'generateBatch']);
            Route::post('/payout-batches/{batchUlid}/approve', [AdminFinanceController::class, 'approveBatch']);
            Route::post('/earnings/{earningUlid}/hold', [AdminFinanceController::class, 'holdEarning']);
            Route::post('/earnings/{earningUlid}/release', [AdminFinanceController::class, 'releaseEarning']);
        });

        // ---------------------------------------------------------------------
        // Phase 9: Admin, Moderation, and Analytics (ADM-*, ANL-*)
        // ---------------------------------------------------------------------
        Route::prefix('admin')->group(function () {
            // User Management (ADM-01)
            Route::prefix('users')->group(function () {
                Route::get('/', [UserManagementController::class, 'index']);
                Route::post('/{ulid}/suspend', [UserManagementController::class, 'suspend']);
                Route::post('/{ulid}/ban', [UserManagementController::class, 'ban']);
                Route::post('/{ulid}/impersonate', [UserManagementController::class, 'impersonate']);
                Route::delete('/{ulid}', [UserManagementController::class, 'destroy']);
            });

            // Course & Content Moderation (ADM-02, ADM-03)
            Route::prefix('moderation')->group(function () {
                Route::get('/courses', [CourseModerationController::class, 'index']);
                Route::post('/courses/{submissionUlid}', [CourseModerationController::class, 'moderate']);
                Route::get('/reports', [ModerationQueueController::class, 'index']);
                Route::post('/reports/{reportUlid}/resolve', [ModerationQueueController::class, 'resolve']);
            });

            // Settings & Feature Flags (ADM-05)
            Route::prefix('settings')->group(function () {
                Route::get('/', [SettingsController::class, 'index']);
                Route::post('/', [SettingsController::class, 'update']);
                Route::post('/flags/{key}', [SettingsController::class, 'updateFeatureFlag']);
            });

            // DMCA Copyright Protection (ADM-08, BR-08)
            Route::prefix('dmca')->group(function () {
                Route::get('/', [DmcaController::class, 'index']);
                Route::post('/', [DmcaController::class, 'store']);
                Route::post('/{noticeUlid}/strike', [DmcaController::class, 'issueStrike']);
            });

            // Audit Logs (ADM-09)
            Route::get('/audit-logs', [AuditLogController::class, 'index']);

            // Analytics & KPIs (ADM-10, ANL-04)
            Route::prefix('analytics')->group(function () {
                Route::get('/kpis', [AnalyticsController::class, 'adminKpis']);
                Route::get('/export/courses', [AnalyticsController::class, 'exportCsv']);
            });
        });
    });
});
