<?php

declare(strict_types=1);

namespace App\Domain\Admin\Http\Controllers;

use App\Domain\Admin\Models\FeatureFlag;
use App\Domain\Admin\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Cache;

class SettingsController extends Controller
{
    /**
     * List all platform settings and feature flags (ADM-05).
     */
    public function index(): JsonResponse
    {
        $settings = Cache::remember('platform:settings:all', 300, function () {
            return Setting::all();
        });

        $featureFlags = Cache::remember('platform:feature_flags:all', 300, function () {
            return FeatureFlag::all();
        });

        return response()->json([
            'data' => [
                'settings' => $settings,
                'feature_flags' => $featureFlags,
            ],
        ]);
    }

    /**
     * Update or create a platform setting.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'key' => ['required', 'string', 'max:100'],
            'value' => ['required'],
            'type' => ['nullable', 'string', 'in:string,integer,boolean,array,json'],
            'is_public' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);

        $setting = Setting::query()->updateOrCreate(
            ['key' => $validated['key']],
            [
                'value' => $validated['value'],
                'type' => $validated['type'] ?? 'string',
                'is_public' => $validated['is_public'] ?? false,
                'description' => $validated['description'] ?? null,
            ]
        );

        Cache::forget('platform:settings:all');

        return response()->json([
            'data' => $setting,
            'message' => 'Setting updated successfully.',
        ]);
    }

    /**
     * Update a feature flag.
     */
    public function updateFeatureFlag(Request $request, string $key): JsonResponse
    {
        $validated = $request->validate([
            'is_enabled' => ['required', 'boolean'],
            'rollout_percentage' => ['nullable', 'integer', 'min:0', 'max:100'],
            'rules' => ['nullable', 'array'],
        ]);

        $flag = FeatureFlag::query()->updateOrCreate(
            ['key' => $key],
            [
                'is_enabled' => $validated['is_enabled'],
                'rollout_percentage' => $validated['rollout_percentage'] ?? ($validated['is_enabled'] ? 100 : 0),
                'rules' => $validated['rules'] ?? null,
            ]
        );

        Cache::forget('platform:feature_flags:all');

        return response()->json([
            'data' => $flag,
            'message' => 'Feature flag updated.',
        ]);
    }
}
