<?php

declare(strict_types=1);

namespace App\Infrastructure\Gateways\Video;

use Illuminate\Support\Str;

class FakeVideoPipeline implements VideoPipeline
{
    /** @var array<string, array<string, mixed>> */
    public array $uploads = [];

    /** @var array<string, array<string, mixed>> */
    public array $jobs = [];

    public function initiateMultipartUpload(string $filename, string $contentType, int $partCount = 5): array
    {
        $uploadId = 'fake_upload_'.Str::random(16);
        $key = 'raw/videos/'.Str::uuid().'_'.$filename;

        $parts = [];
        for ($i = 1; $i <= $partCount; $i++) {
            $parts[$i] = "https://storage.learnhub.test/{$key}?uploadId={$uploadId}&partNumber={$i}&token=".Str::random(12);
        }

        $this->uploads[$uploadId] = [
            'key' => $key,
            'parts' => $parts,
            'status' => 'initiated',
        ];

        return [
            'upload_id' => $uploadId,
            'key' => $key,
            'parts' => $parts,
        ];
    }

    public function completeMultipartUpload(string $uploadId, string $key, array $parts): array
    {
        if (isset($this->uploads[$uploadId])) {
            $this->uploads[$uploadId]['status'] = 'completed';
        }

        return [
            'key' => $key,
            'location' => "https://storage.learnhub.test/{$key}",
        ];
    }

    public function startTranscodeJob(string $sourceKey, string $outputPrefix): string
    {
        $jobId = 'fake_job_'.Str::random(16);

        $this->jobs[$jobId] = [
            'source' => $sourceKey,
            'output' => $outputPrefix,
            'status' => 'SUBMITTED',
        ];

        return $jobId;
    }

    public function generateSignedPlaybackUrl(string $manifestKey, int $expiresInMinutes = 120): string
    {
        $token = Str::random(32);
        $expires = now()->addMinutes($expiresInMinutes)->timestamp;

        return "https://cdn.learnhub.test/{$manifestKey}?Expires={$expires}&Signature={$token}";
    }
}
