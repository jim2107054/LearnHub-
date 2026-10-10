<?php

declare(strict_types=1);

namespace App\Domain\Finance\Models;

use App\Domain\Catalog\Models\Course;
use App\Domain\Commerce\Models\Order;
use App\Domain\Commerce\Models\OrderItem;
use App\Domain\Identity\Models\User;
use App\Infrastructure\Support\ValueObjects\Money;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstructorEarning extends Model
{
    use HasUlids;

    protected $table = 'instructor_earnings';

    protected $fillable = [
        'ulid',
        'instructor_id',
        'order_id',
        'order_item_id',
        'course_id',
        'gross_amount',
        'platform_fee_amount',
        'tax_withheld_amount',
        'net_earnings_amount',
        'currency',
        'revenue_share_percent',
        'source_type',
        'status',
        'available_at',
        'payout_id',
        'paid_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gross_amount' => 'integer',
            'platform_fee_amount' => 'integer',
            'tax_withheld_amount' => 'integer',
            'net_earnings_amount' => 'integer',
            'revenue_share_percent' => 'integer',
            'available_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function getNetEarningsAttribute(): Money
    {
        return Money::fromCents($this->net_earnings_amount, $this->currency);
    }

    public function getGrossAttribute(): Money
    {
        return Money::fromCents($this->gross_amount, $this->currency);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<OrderItem, $this>
     */
    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }
}
