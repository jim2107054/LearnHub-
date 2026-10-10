<?php

declare(strict_types=1);

namespace App\Infrastructure\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class IdempotencyKey extends Model
{
    use HasUlids;

    protected $table = 'idempotency_keys';

    protected $fillable = [
        'id',
        'key',
        'user_id',
        'request_path',
        'request_hash',
        'response_status',
        'response_body',
        'status',
        'expires_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'response_body' => 'array',
            'response_status' => 'integer',
            'expires_at' => 'datetime',
        ];
    }
}
