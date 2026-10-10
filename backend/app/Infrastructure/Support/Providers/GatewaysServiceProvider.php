<?php

declare(strict_types=1);

namespace App\Infrastructure\Support\Providers;

use App\Infrastructure\Gateways\Payment\FakePaymentGateway;
use App\Infrastructure\Gateways\Payment\PaymentGateway;
use App\Infrastructure\Gateways\Payment\StripePaymentGateway;
use App\Infrastructure\Gateways\Tax\StandardTaxCalculator;
use App\Infrastructure\Gateways\Tax\TaxCalculator;
use App\Infrastructure\Gateways\Video\FakeVideoPipeline;
use App\Infrastructure\Gateways\Video\MediaConvertVideoPipeline;
use App\Infrastructure\Gateways\Video\VideoPipeline;
use Aws\CloudFront\CloudFrontClient;
use Aws\MediaConvert\MediaConvertClient;
use Aws\S3\S3Client;
use Illuminate\Support\ServiceProvider;

class GatewaysServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Payment Gateway Binding
        $this->app->singleton(PaymentGateway::class, function ($app) {
            $driver = config('learnhub.payment_gateway', 'stripe');

            if ($driver === 'fake' || $app->environment('testing')) {
                return new FakePaymentGateway();
            }

            return new StripePaymentGateway(
                secretKey: (string) config('services.stripe.secret', ''),
                webhookSecret: (string) config('services.stripe.webhook_secret', '')
            );
        });

        // Video Pipeline Binding
        $this->app->singleton(VideoPipeline::class, function ($app) {
            $driver = config('learnhub.video_pipeline_driver', 'fake');

            if ($driver === 'fake' || $app->environment('testing')) {
                return new FakeVideoPipeline();
            }

            $s3Client = new S3Client([
                'version' => 'latest',
                'region' => config('filesystems.disks.s3.region', 'us-east-1'),
                'credentials' => [
                    'key' => config('filesystems.disks.s3.key'),
                    'secret' => config('filesystems.disks.s3.secret'),
                ],
            ]);

            $mediaConvertClient = new MediaConvertClient([
                'version' => 'latest',
                'region' => config('services.mediaconvert.region', 'us-east-1'),
                'endpoint' => config('services.mediaconvert.endpoint'),
            ]);

            $cloudFrontClient = new CloudFrontClient([
                'version' => 'latest',
                'region' => 'us-east-1',
            ]);

            return new MediaConvertVideoPipeline(
                s3Client: $s3Client,
                mediaConvertClient: $mediaConvertClient,
                cloudFrontClient: $cloudFrontClient,
                bucket: (string) config('filesystems.disks.s3.bucket', 'learnhub-storage'),
                roleArn: (string) config('services.mediaconvert.role_arn', ''),
                cdnDomain: (string) config('services.cloudfront.domain', ''),
                keyPairId: (string) config('services.cloudfront.key_pair_id', ''),
                privateKeyPath: (string) config('services.cloudfront.private_key_path', '')
            );
        });

        // Tax Calculator Binding
        $this->app->singleton(TaxCalculator::class, function () {
            return new StandardTaxCalculator();
        });
    }
}
