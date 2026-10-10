<?php

declare(strict_types=1);

namespace App\Domain\Finance\Models;

use App\Domain\Identity\Models\User;
use App\Infrastructure\Support\ValueObjects\Money;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    use HasUlids;

    protected $table = 'payouts';

    protected $fillable = [
        'ulid',
        'payout_batch_id',
        'instructor_id',
        'payout_method_id',
        'amount',
        'currency',
        'status',
        'failure_reason',
        'gateway_payout_id',
        'paid_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'paid_at' => 'datetime',
        ];
    }

    public function getPayoutAmountAttribute(): Money
    {
        return Money::fromCents($this->amount, $this->currency);
    }

    /**
     * @return BelongsTo<PayoutBatch, $this>
     */
    public function batch(): BelongsTo
    {
        return $this->belongsTo(PayoutBatch::class, 'payout_batch_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * @return BelongsTo<InstructorPayoutMethod, $this>
     */
    public function payoutMethod(): BelongsTo
    {
        return $this->belongsTo(InstructorPayoutMethod::class, 'payout_method_id');
    }
}
