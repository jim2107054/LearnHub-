<?php

declare(strict_types=1);

namespace App\Infrastructure\Gateways\Video;

use Aws\CloudFront\CloudFrontClient;
use Aws\MediaConvert\MediaConvertClient;
use Aws\S3\S3Client;

class MediaConvertVideoPipeline implements VideoPipeline
{
    public function __construct(
        protected S3Client $s3Client,
        protected MediaConvertClient $mediaConvertClient,
        protected CloudFrontClient $cloudFrontClient,
        protected string $bucket,
        protected string $roleArn,
        protected string $cdnDomain,
        protected string $keyPairId,
        protected string $privateKeyPath
    ) {}

    public function initiateMultipartUpload(string $filename, string $contentType, int $partCount = 5): array
    {
        $key = 'raw/videos/'.(string) str()->uuid().'_'.$filename;

        $result = $this->s3Client->createMultipartUpload([
            'Bucket' => $this->bucket,
            'Key' => $key,
            'ContentType' => $contentType,
        ]);

        $uploadId = (string) $result['UploadId'];
        $parts = [];

        for ($i = 1; $i <= $partCount; $i++) {
            $cmd = $this->s3Client->getCommand('UploadPart', [
                'Bucket' => $this->bucket,
                'Key' => $key,
                'UploadId' => $uploadId,
                'PartNumber' => $i,
            ]);

            $presignedRequest = $this->s3Client->createPresignedRequest($cmd, '+60 minutes');
            $parts[$i] = (string) $presignedRequest->getUri();
        }

        return [
            'upload_id' => $uploadId,
            'key' => $key,
            'parts' => $parts,
        ];
    }

    public function completeMultipartUpload(string $uploadId, string $key, array $parts): array
    {
        $result = $this->s3Client->completeMultipartUpload([
            'Bucket' => $this->bucket,
            'Key' => $key,
            'UploadId' => $uploadId,
            'MultipartUpload' => ['Parts' => $parts],
        ]);

        return [
            'key' => $key,
            'location' => (string) $result['Location'],
        ];
    }

    public function startTranscodeJob(string $sourceKey, string $outputPrefix): string
    {
        $jobSetting = [
            'Inputs' => [[
                'FileInput' => "s3://{$this->bucket}/{$sourceKey}",
                'AudioSelectors' => ['Audio Selector 1' => ['DefaultSelection' => 'DEFAULT']],
            ]],
            'OutputGroups' => [[
                'Name' => 'Apple HLS',
                'OutputGroupSettings' => [
                    'Type' => 'HLS_GROUP_SETTINGS',
                    'HlsGroupSettings' => [
                        'SegmentLength' => 6,
                        'Destination' => "s3://{$this->bucket}/{$outputPrefix}/",
                        'MinSegmentLength' => 0,
                    ],
                ],
                'Outputs' => [
                    [
                        'Preset' => 'System-Avc_16x9_1080p_29_97fps_8500kbps',
                        'NameModifier' => '_1080p',
                    ],
                    [
                        'Preset' => 'System-Avc_16x9_720p_29_97fps_5000kbps',
                        'NameModifier' => '_720p',
                    ],
                    [
                        'Preset' => 'System-Avc_16x9_360p_29_97fps_1200kbps',
                        'NameModifier' => '_360p',
                    ],
                ],
            ]],
        ];

        $result = $this->mediaConvertClient->createJob([
            'Role' => $this->roleArn,
            'Settings' => $jobSetting,
        ]);

        return (string) $result['Job']['Id'];
    }

    public function generateSignedPlaybackUrl(string $manifestKey, int $expiresInMinutes = 120): string
    {
        $streamUrl = rtrim($this->cdnDomain, '/').'/'.ltrim($manifestKey, '/');
        $expires = time() + ($expiresInMinutes * 60);

        return $this->cloudFrontClient->getSignedUrl([
            'url' => $streamUrl,
            'expires' => $expires,
            'key_pair_id' => $this->keyPairId,
            'private_key' => $this->privateKeyPath,
        ]);
    }
}
