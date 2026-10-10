<?php

declare(strict_types=1);

namespace App\Domain\Media\Actions;

use App\Domain\Identity\Models\User;
use App\Domain\Media\Models\MediaAsset;
use App\Infrastructure\Gateways\Video\VideoPipeline;
use Illuminate\Support\Str;

class InitiateUploadAction
{
    public function __construct(
        protected VideoPipeline $videoPipeline
    ) {}

    /**
     * @return array{asset: MediaAsset, upload_id: string, parts: array<int, string>}
     */
    public function execute(User $user, string $filename, string $contentType, int $sizeBytes, int $partsCount = 5): array
    {
        $result = $this->videoPipeline->initiateMultipartUpload($filename, $contentType, $partsCount);

        $asset = MediaAsset::query()->create([
            'ulid' => (string) Str::ulid(),
            'user_id' => $user->id,
            'filename' => $filename,
            'mime_type' => $contentType,
            'size_bytes' => $sizeBytes,
            'status' => 'uploading',
            'storage_key' => $result['key'],
        ]);

        return [
            'asset' => $asset,
            'upload_id' => $result['upload_id'],
            'parts' => $result['parts'],
        ];
    }
}
