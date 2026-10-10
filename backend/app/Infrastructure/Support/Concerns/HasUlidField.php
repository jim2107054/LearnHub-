<?php

declare(strict_types=1);

namespace App\Infrastructure\Support\Concerns;

use Illuminate\Database\Eloquent\Concerns\HasUlids;

trait HasUlidField
{
    use HasUlids;

    /**
     * Get the columns that should receive a unique identifier.
     *
     * @return array<int, string>
     */
    public function uniqueIds(): array
    {
        return ['ulid'];
    }
}
