<?php

declare(strict_types=1);

namespace App\Domain\Finance\Models;

use App\Domain\Identity\Models\User;
use App\Infrastructure\Support\ValueObjects\Money;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LedgerEntry extends Model
{
    use HasUlids;

    public const UPDATED_AT = null;

    protected $table = 'ledger_entries';

    protected $fillable = [
        'id',
        'transaction_id',
        'account_type',
        'user_id',
        'entry_type',
        'amount',
        'currency',
        'reference_type',
        'reference_id',
        'description',
        'created_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function getMoneyAttribute(): Money
    {
        return Money::fromCents($this->amount, $this->currency);
    }

    public function isDebit(): bool
    {
        return $this->entry_type === 'debit';
    }

    public function isCredit(): bool
    {
        return $this->entry_type === 'credit';
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
