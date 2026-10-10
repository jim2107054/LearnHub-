<?php

declare(strict_types=1);

namespace App\Domain\Finance\Models;

use App\Domain\Identity\Models\User;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InstructorTaxProfile extends Model
{
    use HasUlids;

    protected $table = 'instructor_tax_profiles';

    protected $fillable = [
        'ulid',
        'instructor_id',
        'tax_form_type',
        'tax_id_number',
        'legal_name',
        'country',
        'status',
        'submitted_at',
        'verified_at',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tax_id_number' => 'encrypted',
            'submitted_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function isVerified(): bool
    {
        return $this->status === 'verified';
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function instructor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'instructor_id');
    }
}
