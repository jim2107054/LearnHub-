<?php

declare(strict_types=1);

namespace App\Infrastructure\Middleware;

use App\Infrastructure\Models\IdempotencyKey;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Idempotency
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('Idempotency-Key');

        if (! is_string($key) || trim($key) === '') {
            return $next($request);
        }

        $userId = $request->user()?->id;
        $requestHash = hash('sha256', $request->getContent());
        $path = $request->path();

        $existing = IdempotencyKey::query()
            ->where('key', $key)
            ->first();

        if ($existing) {
            if ($existing->status === 'in_progress') {
                return response()->json([
                    'error' => [
                        'code' => 'idempotency_conflict',
                        'message' => 'A request with this Idempotency-Key is currently processing.',
                        'details' => (object) [],
                        'correlation_id' => $request->header('X-Correlation-ID'),
                    ],
                ], 409);
            }

            if ($existing->status === 'completed' && $existing->response_body !== null) {
                return new JsonResponse(
                    $existing->response_body,
                    $existing->response_status ?? 200,
                    ['X-Idempotent-Replay' => 'true']
                );
            }
        }

        $record = IdempotencyKey::query()->create([
            'key' => $key,
            'user_id' => $userId,
            'request_path' => $path,
            'request_hash' => $requestHash,
            'status' => 'in_progress',
            'expires_at' => now()->addHours(24),
        ]);

        /** @var Response $response */
        $response = $next($request);

        if ($response instanceof JsonResponse) {
            $record->update([
                'status' => 'completed',
                'response_status' => $response->getStatusCode(),
                'response_body' => $response->getData(true),
            ]);
        } else {
            $record->delete();
        }

        return $response;
    }
}
