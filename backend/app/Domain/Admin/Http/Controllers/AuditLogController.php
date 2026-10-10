<?php

declare(strict_types=1);

namespace App\Domain\Admin\Http\Controllers;

use App\Domain\Admin\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class AuditLogController extends Controller
{
    /**
     * Immutable audit log viewer (ADM-09).
     */
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()->with(['user:id,ulid,name,email', 'impersonator:id,ulid,name,email']);

        if ($request->filled('action')) {
            $query->where('action', 'ilike', '%'.$request->query('action').'%');
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        $logs = $query->latest('created_at')->paginate(25);

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'pagination' => [
                    'current_page' => $logs->currentPage(),
                    'last_page' => $logs->lastPage(),
                    'per_page' => $logs->perPage(),
                    'total' => $logs->total(),
                ],
            ],
        ]);
    }
}
