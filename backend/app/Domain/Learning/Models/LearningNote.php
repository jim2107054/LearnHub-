<?php

declare(strict_types=1);

namespace App\Domain\Learning\Models;

use App\Domain\Catalog\Models\Lecture;
use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LearningNote extends Model
{
    use HasUlids;

    protected $table = 'learning_notes';

    protected $fillable = [
        'ulid',
        'user_id',
        'lecture_id',
        'timestamp_seconds',
        'body',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'timestamp_seconds' => 'integer',
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
