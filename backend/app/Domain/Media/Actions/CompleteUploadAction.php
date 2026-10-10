<?php

declare(strict_types=1);

namespace App\Domain\Media\Actions;

use App\Domain\Media\Models\MediaAsset;
use App\Infrastructure\Gateways\Video\VideoPipeline;

class CompleteUploadAction
{
    public function __construct(
        protected VideoPipeline $videoPipeline
    ) {}

    /**
     * @param  array<int, array{PartNumber: int, ETag: string}>  $parts
     */
    public function execute(MediaAsset $asset, string $uploadId, array $parts): MediaAsset
    {
        $this->videoPipeline->completeMultipartUpload($uploadId, $asset->storage_key, $parts);

        $asset->update(['status' => 'uploaded']);

        // Dispatch transcoding pipeline job
        $outputPrefix = 'hls/'.$asset->ulid;
        $jobId = $this->videoPipeline->startTranscodeJob($asset->storage_key, $outputPrefix);

        $asset->update([
            'status' => 'transcoding',
            'transcode_job_id' => $jobId,
            'hls_manifest_key' => $outputPrefix.'/master.m3u8',
        ]);

        return $asset;
    }
}
