<?php

declare(strict_types=1);

namespace App\Domain\Community\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class ModerationReport extends Model
{
    use HasUlids;

    protected $table = 'moderation_reports';

    protected $fillable = [
        'ulid',
        'reporter_id',
        'reportable_type',
        'reportable_id',
        'reason',
        'details',
        'status',
        'moderated_by',
        'moderated_at',
        'moderator_notes',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'moderated_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    /**
     * @return MorphTo<Model, $this>
     */
    public function reportable(): MorphTo
    {
        return $this->morphTo();
    }
}
