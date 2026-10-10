<?php

declare(strict_types=1);

namespace App\Infrastructure\Gateways\Video;

interface VideoPipeline
{
    /**
     * Initiate a direct-to-storage multipart upload.
     *
     * @return array{upload_id: string, key: string, parts: array<int, string>}
     */
    public function initiateMultipartUpload(string $filename, string $contentType, int $partCount = 5): array;

    /**
     * Complete an active multipart upload.
     *
     * @param  array<int, array{PartNumber: int, ETag: string}>  $parts
     * @return array{key: string, location: string}
     */
    public function completeMultipartUpload(string $uploadId, string $key, array $parts): array;

    /**
     * Dispatch an adaptive bitrate HLS transcoding job.
     */
    public function startTranscodeJob(string $sourceKey, string $outputPrefix): string;

    /**
     * Generate an expiring signed URL for HLS manifest and segments.
     */
    public function generateSignedPlaybackUrl(string $manifestKey, int $expiresInMinutes = 120): string;
}
