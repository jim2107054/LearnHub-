<?php

declare(strict_types=1);

namespace App\Domain\Community\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QaAnswer extends Model
{
    use HasUlids;

    protected $table = 'qa_answers';

    protected $fillable = [
        'ulid',
        'question_id',
        'user_id',
        'body',
        'is_instructor_reply',
        'is_best_answer',
        'upvotes_count',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_instructor_reply' => 'boolean',
            'is_best_answer' => 'boolean',
            'upvotes_count' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<QaQuestion, $this>
     */
    public function question(): BelongsTo
    {
        return $this->belongsTo(QaQuestion::class, 'question_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
