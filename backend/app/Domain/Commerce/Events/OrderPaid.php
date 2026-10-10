<?php

declare(strict_types=1);

namespace App\Domain\Commerce\Events;

use App\Domain\Commerce\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderPaid
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public Order $order
    ) {}
}
