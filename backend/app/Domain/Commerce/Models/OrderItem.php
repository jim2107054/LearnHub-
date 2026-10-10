<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Models;

use App\Domain\Catalog\Models\Course;
use App\Domain\Identity\Models\User;
use App\Domain\Instructor\Models\Coupon;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderItem extends Model
{
    use HasUlids;

    protected $table = 'order_items';

    protected $fillable = [
        'ulid',
        'order_id',
        'course_id',
        'instructor_id',
        'coupon_id',
        'unit_price_amount',
        'discount_amount',
        'tax_amount',
        'total_amount',
        'platform_fee_amount',
        'instructor_share_amount',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'unit_price_amount' => 'integer',
            'discount_amount' => 'integer',
            'tax_amount' => 'integer',
            'total_amount' => 'integer',
            'platform_fee_amount' => 'integer',
            'instructor_share_amount' => 'integer',
        ];
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<Course, $this>
     */
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }

    /**
     * @return BelongsTo<Coupon, $this>
     */
    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }
}
