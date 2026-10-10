<?php

declare(strict_types=1);

namespace App\Domain\Media\Models;

use App\Domain\Catalog\Models\Lecture;
use App\Domain\Identity\Models\User;
use App\Infrastructure\Support\Concerns\HasUlidField;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MediaAsset extends Model
{
    use HasUlidField;

    protected $table = 'media_assets';

    protected $fillable = [
        'ulid',
        'user_id',
        'lecture_id',
        'filename',
        'mime_type',
        'size_bytes',
        'status',
        'storage_key',
        'hls_manifest_key',
        'duration_seconds',
        'thumbnails',
        'captions',
        'transcode_job_id',
        'error_message',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'duration_seconds' => 'integer',
            'thumbnails' => 'array',
            'captions' => 'array',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Lecture, $this>
     */
    public function lecture(): BelongsTo
    {
        return $this->belongsTo(Lecture::class);
    }
}
