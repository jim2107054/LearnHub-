<?php

use App\Domain\Identity\Enums\UserRole;
use App\Domain\Identity\Models\User;
use App\Domain\Media\Models\MediaAsset;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $this->instructor = User::create([
        'ulid' => (string) Str::ulid(),
        'name' => 'Video Instructor',
        'email' => 'video@example.com',
        'password' => Hash::make('Secret123!'),
        'status' => 'active',
    ]);
    $this->instructor->assignRole(UserRole::INSTRUCTOR->value);

    $this->actingAs($this->instructor);
});

test('it initiates direct multipart upload', function () {
    $response = $this->postJson('/api/v1/instructor/media/multipart/initiate', [
        'filename' => 'intro_lecture.mp4',
        'content_type' => 'video/mp4',
        'size_bytes' => 104857600, // 100MB
        'parts_count' => 5,
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'asset_id',
                'upload_id',
                'storage_key',
                'parts',
            ],
            'message',
        ]);

    $assetId = $response->json('data.asset_id');
    $this->assertDatabaseHas('media_assets', [
        'ulid' => $assetId,
        'status' => 'uploading',
        'filename' => 'intro_lecture.mp4',
    ]);
});

test('it completes multipart upload and dispatches transcode job', function () {
    // 1. Initiate
    $initResponse = $this->postJson('/api/v1/instructor/media/multipart/initiate', [
        'filename' => 'deep_dive.mp4',
        'content_type' => 'video/mp4',
        'size_bytes' => 52428800,
    ]);
    $assetId = $initResponse->json('data.asset_id');
    $uploadId = $initResponse->json('data.upload_id');

    // 2. Complete
    $completeResponse = $this->postJson('/api/v1/instructor/media/multipart/complete', [
        'asset_id' => $assetId,
        'upload_id' => $uploadId,
        'parts' => [
            ['PartNumber' => 1, 'ETag' => '"tag1"'],
            ['PartNumber' => 2, 'ETag' => '"tag2"'],
        ],
    ]);

    $completeResponse->assertStatus(200)
        ->assertJsonPath('data.status', 'transcoding');

    $asset = MediaAsset::where('ulid', $assetId)->first();
    expect($asset->status)->toBe('transcoding');
    expect($asset->transcode_job_id)->not->toBeNull();
});

test('it handles transcoding webhook and updates asset to ready', function () {
    $asset = MediaAsset::create([
        'ulid' => (string) Str::ulid(),
        'user_id' => $this->instructor->id,
        'filename' => 'lecture.mp4',
        'mime_type' => 'video/mp4',
        'size_bytes' => 50000000,
        'status' => 'transcoding',
        'storage_key' => 'raw/videos/test.mp4',
        'transcode_job_id' => 'job_12345',
    ]);

    $response = $this->postJson('/api/v1/media/transcode/webhook', [
        'job_id' => 'job_12345',
        'status' => 'ready',
        'duration_seconds' => 745,
        'thumbnails' => ['thumb_01.jpg', 'thumb_02.jpg'],
    ]);

    $response->assertStatus(200)
        ->assertJson(['received' => true]);

    $asset->refresh();
    expect($asset->status)->toBe('ready');
    expect($asset->duration_seconds)->toBe(745);
    expect($asset->thumbnails)->toContain('thumb_01.jpg');
});
