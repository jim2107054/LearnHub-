<?php

declare(strict_types=1);

namespace App\Domain\Identity\Http\Resources;

use App\Domain\Identity\Models\UserDeviceSession;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin UserDeviceSession
 */
class SessionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ip_address' => $this->ip_address,
            'user_agent' => $this->user_agent,
            'device_type' => $this->device_type,
            'browser' => $this->browser,
            'platform' => $this->platform,
            'last_active_at' => $this->last_active_at?->toIso8601String(),
            'is_revoked' => (bool) $this->is_revoked,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
