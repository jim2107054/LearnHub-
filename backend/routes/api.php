<?php

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
});
