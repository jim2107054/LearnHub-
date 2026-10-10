<?php

declare(strict_types=1);

namespace App\Domain\Media\Http\Controllers;

use App\Domain\Identity\Models\User;
use App\Domain\Media\Actions\CompleteUploadAction;
use App\Domain\Media\Actions\InitiateUploadAction;
use App\Domain\Media\Models\MediaAsset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class MediaController extends Controller
{
    public function initiate(Request $request, InitiateUploadAction $action): JsonResponse
    {
        $validated = $request->validate([
            'filename' => ['required', 'string'],
            'content_type' => ['required', 'string'],
            'size_bytes' => ['required', 'integer', 'min:1'],
            'parts_count' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $result = $action->execute(
            user: $user,
            filename: $validated['filename'],
            contentType: $validated['content_type'],
            sizeBytes: $validated['size_bytes'],
            partsCount: $validated['parts_count'] ?? 5
        );

        return response()->json([
            'data' => [
                'asset_id' => $result['asset']->ulid,
                'upload_id' => $result['upload_id'],
                'storage_key' => $result['asset']->storage_key,
                'parts' => $result['parts'],
            ],
            'message' => 'Direct multipart upload initiated.',
        ], 201);
    }

    public function complete(Request $request, CompleteUploadAction $action): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => ['required', 'string'],
            'upload_id' => ['required', 'string'],
            'parts' => ['required', 'array'],
            'parts.*.PartNumber' => ['required', 'integer'],
            'parts.*.ETag' => ['required', 'string'],
        ]);

        /** @var MediaAsset $asset */
        $asset = MediaAsset::query()->where('ulid', $validated['asset_id'])->firstOrFail();

        $updated = $action->execute(
            asset: $asset,
            uploadId: $validated['upload_id'],
            parts: $validated['parts']
        );

        return response()->json([
            'data' => [
                'asset_id' => $updated->ulid,
                'status' => $updated->status,
                'hls_manifest_key' => $updated->hls_manifest_key,
            ],
            'message' => 'Upload finalized and transcoding initiated.',
        ]);
    }

    public function webhook(Request $request): JsonResponse
    {
        $status = $request->input('status', 'ready'); // ready | failed
        $jobId = $request->input('job_id');
        $duration = $request->integer('duration_seconds', 0);
        $thumbnails = $request->input('thumbnails', []);

        /** @var MediaAsset|null $asset */
        $asset = MediaAsset::query()->where('transcode_job_id', $jobId)->first();

        if ($asset) {
            $asset->update([
                'status' => $status === 'ready' ? 'ready' : 'failed',
                'duration_seconds' => $duration,
                'thumbnails' => $thumbnails,
                'error_message' => $status === 'failed' ? $request->input('error_message') : null,
            ]);
        }

        return response()->json(['received' => true]);
    }
}
