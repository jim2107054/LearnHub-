<?php

use App\Infrastructure\Middleware\CorrelationId;
use App\Infrastructure\Middleware\ForceJson;
use App\Infrastructure\Middleware\SecurityHeaders;
use App\Infrastructure\Middleware\SetLocale;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->prepend([
            CorrelationId::class,
            ForceJson::class,
            SecurityHeaders::class,
            SetLocale::class,
        ]);

        $middleware->statefulApi();

        $middleware->alias([
            'idempotent' => \App\Infrastructure\Middleware\Idempotency::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson() || $request->is('up') === false) {
                $correlationId = $request->header('X-Correlation-ID', (string) str()->uuid());

                if ($e instanceof ValidationException) {
                    return response()->json([
                        'error' => [
                            'code' => 'validation_failed',
                            'message' => 'The given data was invalid.',
                            'details' => $e->errors(),
                            'correlation_id' => $correlationId,
                        ],
                    ], 422);
                }

                if ($e instanceof AuthenticationException) {
                    return response()->json([
                        'error' => [
                            'code' => 'unauthenticated',
                            'message' => $e->getMessage() ?: 'Unauthenticated.',
                            'details' => (object) [],
                            'correlation_id' => $correlationId,
                        ],
                    ], 401);
                }

                if ($e instanceof AuthorizationException || $e instanceof AccessDeniedHttpException) {
                    return response()->json([
                        'error' => [
                            'code' => 'forbidden',
                            'message' => $e->getMessage() ?: 'This action is unauthorized.',
                            'details' => (object) [],
                            'correlation_id' => $correlationId,
                        ],
                    ], 403);
                }

                if ($e instanceof ModelNotFoundException || $e instanceof NotFoundHttpException) {
                    return response()->json([
                        'error' => [
                            'code' => 'not_found',
                            'message' => 'The requested resource was not found.',
                            'details' => (object) [],
                            'correlation_id' => $correlationId,
                        ],
                    ], 404);
                }

                if ($e instanceof MethodNotAllowedHttpException) {
                    return response()->json([
                        'error' => [
                            'code' => 'method_not_allowed',
                            'message' => 'The HTTP method is not allowed for this route.',
                            'details' => (object) [],
                            'correlation_id' => $correlationId,
                        ],
                    ], 405);
                }

                if ($e instanceof ThrottleRequestsException) {
                    return response()->json([
                        'error' => [
                            'code' => 'rate_limit_exceeded',
                            'message' => 'Too many requests. Please slow down and try again later.',
                            'details' => (object) [],
                            'correlation_id' => $correlationId,
                        ],
                    ], 429);
                }

                if ($e instanceof HttpException) {
                    return response()->json([
                        'error' => [
                            'code' => 'http_error',
                            'message' => $e->getMessage() ?: 'An HTTP error occurred.',
                            'details' => (object) [],
                            'correlation_id' => $correlationId,
                        ],
                    ], $e->getStatusCode());
                }

                $statusCode = 500;
                $message = config('app.debug') ? $e->getMessage() : 'An unexpected internal server error occurred.';
                $details = config('app.debug') ? [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => collect($e->getTrace())->take(5)->toArray(),
                ] : (object) [];

                return response()->json([
                    'error' => [
                        'code' => 'server_error',
                        'message' => $message,
                        'details' => $details,
                        'correlation_id' => $correlationId,
                    ],
                ], $statusCode);
            }
        });
    })->create();
