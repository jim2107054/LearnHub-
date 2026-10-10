<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Events;

use App\Domain\Commerce\Models\Refund;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RefundProcessed
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public Refund $refund
    ) {}
}
