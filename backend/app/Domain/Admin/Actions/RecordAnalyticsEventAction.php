<?php

declare(strict_types=1);

namespace App\Domain\Admin\Actions;

use App\Domain\Admin\Models\AnalyticsEvent;
use App\Domain\Identity\Models\User;

class RecordAnalyticsEventAction
{
    /**
     * @param  array{event_name: string, session_id?: ?string, entity_type?: ?string, entity_id?: ?int, properties?: array<string, mixed>, consent_given?: bool}  $data
     */
    public function execute(?User $user, array $data): AnalyticsEvent
    {
        $consentGiven = $data['consent_given'] ?? true;

        return AnalyticsEvent::query()->create([
            'user_id' => $consentGiven ? $user?->id : null,
            'session_id' => $data['session_id'] ?? null,
            'event_name' => $data['event_name'],
            'entity_type' => $data['entity_type'] ?? null,
            'entity_id' => $data['entity_id'] ?? null,
            'properties' => $data['properties'] ?? null,
            'consent_given' => $consentGiven,
            'ip_address' => $consentGiven ? request()->ip() : null,
            'user_agent' => $consentGiven ? request()->userAgent() : null,
            'created_at' => now(),
        ]);
    }
}
