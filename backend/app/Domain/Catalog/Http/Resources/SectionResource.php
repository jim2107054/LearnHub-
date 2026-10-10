<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Http\Resources;

use App\Domain\Catalog\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Section
 */
class SectionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'title' => $this->title,
            'sort_order' => $this->sort_order,
            'lectures_count' => $this->lectures->count(),
            'total_duration_seconds' => $this->lectures->sum('duration_seconds'),
            'lectures' => LectureResource::collection($this->whenLoaded('lectures')),
        ];
    }
}
