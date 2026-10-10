<?php

declare(strict_types=1);

namespace App\Domain\Identity\Http\Resources;

use App\Domain\Identity\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'name' => $this->name,
            'email' => $this->email,
            'avatar_url' => $this->avatar_url,
            'headline' => $this->headline,
            'bio' => $this->bio,
            'locale' => $this->locale,
            'timezone' => $this->timezone,
            'roles' => $this->getRoleNames(),
            'mfa_enabled' => (bool) $this->mfa_enabled,
            'email_verified' => $this->email_verified_at !== null,
            'status' => $this->status,
            'terms_accepted_at' => $this->terms_accepted_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
