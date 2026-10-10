<?php

declare(strict_types=1);

namespace App\Domain\Catalog\Http\Resources;

use App\Domain\Catalog\Models\Lecture;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Lecture
 */
class LectureResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->ulid,
            'title' => $this->title,
            'lecture_type' => $this->lecture_type->value,
            'duration_seconds' => $this->duration_seconds,
            'is_preview' => $this->is_preview,
            'sort_order' => $this->sort_order,
            // Only expose content payload if this lecture is explicitly flagged as a free preview
            'preview_content' => $this->is_preview ? $this->content_payload : null,
        ];
    }
}
