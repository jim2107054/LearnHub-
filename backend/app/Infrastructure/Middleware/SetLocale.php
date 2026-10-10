<?php

declare(strict_types=1);

namespace App\Infrastructure\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Supported locales in LearnHub.
     *
     * @var array<string>
     */
    protected array $supportedLocales = ['en', 'bn'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->header('X-Locale');

        if (! is_string($locale) || ! in_array($locale, $this->supportedLocales, true)) {
            $locale = $request->getPreferredLanguage($this->supportedLocales) ?? 'en';
        }

        App::setLocale($locale);

        $response = $next($request);

        $response->headers->set('Content-Language', $locale);

        return $response;
    }
}
