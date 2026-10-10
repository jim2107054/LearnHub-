<?php

declare(strict_types=1);

namespace App\Domain\Finance\Models;

use App\Domain\Identity\Models\User;
use App\Infrastructure\Support\ValueObjects\Money;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PayoutBatch extends Model
{
    use HasUlids;

    protected $table = 'payout_batches';

    protected $fillable = [
        'ulid',
        'batch_number',
        'period_start',
        'period_end',
        'total_payout_amount',
        'currency',
        'status',
        'approved_by',
        'processed_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'period_start' => 'date',
            'period_end' => 'date',
            'total_payout_amount' => 'integer',
            'processed_at' => 'datetime',
        ];
    }

    public function getTotalAttribute(): Money
    {
        return Money::fromCents($this->total_payout_amount, $this->currency);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * @return HasMany<Payout, $this>
     */
    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class, 'payout_batch_id');
    }
}
