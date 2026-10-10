<?php

declare(strict_types=1);

namespace App\Domain\Learning\Services;

use App\Domain\Identity\Models\User;
use Illuminate\Support\Facades\Redis;
use Symfony\Component\HttpKernel\Exception\HttpException;

class StreamLimiterService
{
    /**
     * Check and register active streaming session.
     */
    public function acquire(User $user, string $sessionId): void
    {
        $limit = (int) config('learnhub.concurrent_stream_limit', 3);
        $key = 'active_streams:'.$user->id;

        try {
            // Remove expired sessions older than 60 seconds
            $threshold = now()->subSeconds(60)->timestamp;
            Redis::zremrangebyscore($key, '-inf', (string) $threshold);

            // Check current active streams count
            $activeCount = (int) Redis::zcard($key);

            // Check if current session already active
            $score = Redis::zscore($key, $sessionId);

            if ($score === null && $activeCount >= $limit) {
                throw new HttpException(
                    429,
                    sprintf('You have reached the limit of %d concurrent video streams. Please close another tab or device.', $limit)
                );
            }

            // Register or refresh session timestamp
            Redis::zadd($key, now()->timestamp, $sessionId);
            Redis::expire($key, 300);
        } catch (\Throwable $e) {
            if ($e instanceof HttpException) {
                throw $e;
            }
            // Graceful degradation if Redis is temporarily unreachable
        }
    }
}
