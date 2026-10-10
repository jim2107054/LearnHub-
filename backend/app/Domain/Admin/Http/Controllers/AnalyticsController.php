<?php

declare(strict_types=1);

namespace App\Domain\Admin\Http\Controllers;

use App\Domain\Admin\Actions\RecordAnalyticsEventAction;
use App\Domain\Admin\Models\AnalyticsEvent;
use App\Domain\Catalog\Models\Course;
use App\Domain\Commerce\Enums\OrderStatus;
use App\Domain\Commerce\Models\Order;
use App\Domain\Commerce\Models\Refund;
use App\Domain\Finance\Models\InstructorEarning;
use App\Domain\Identity\Models\User;
use App\Domain\Learning\Models\Enrollment;
use App\Domain\Learning\Models\LectureProgress;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Routing\Controller;

class AnalyticsController extends Controller
{
    /**
     * Ingest behavior tracking event with consent verification (ANL-05).
     */
    public function ingest(Request $request, RecordAnalyticsEventAction $action): JsonResponse
    {
        $validated = $request->validate([
            'event_name' => ['required', 'string', 'max:100'],
            'session_id' => ['nullable', 'string', 'max:64'],
            'entity_type' => ['nullable', 'string', 'max:50'],
            'entity_id' => ['nullable', 'integer'],
            'properties' => ['nullable', 'array'],
            'consent_given' => ['nullable', 'boolean'],
        ]);

        /** @var User|null $user */
        $user = $request->user();

        $event = $action->execute($user, $validated);

        return response()->json([
            'data' => [
                'event_id' => $event->id,
                'recorded' => true,
            ],
        ], 202);
    }

    /**
     * Platform Admin KPIs Dashboard (ADM-10).
     */
    public function adminKpis(): JsonResponse
    {
        $paidOrders = Order::query()->where('status', OrderStatus::PAID);

        $gmv = (int) $paidOrders->sum('total_amount');
        $platformRevenue = (int) InstructorEarning::query()->sum('platform_fee_amount');
        $totalSignups = User::query()->count();
        $totalEnrollments = Enrollment::query()->count();
        $totalRefundsCount = Refund::query()->count();
        $totalRefundsAmount = (int) Refund::query()->sum('amount');

        // Top 5 courses by enrollments
        $topCourses = Course::query()
            ->orderByDesc('enrollments_count')
            ->limit(5)
            ->get(['ulid', 'title', 'enrollments_count', 'rating_cache', 'price_amount']);

        return response()->json([
            'data' => [
                'gmv_amount' => $gmv,
                'platform_revenue_amount' => $platformRevenue,
                'total_signups' => $totalSignups,
                'total_enrollments' => $totalEnrollments,
                'refunds_count' => $totalRefundsCount,
                'refunds_amount' => $totalRefundsAmount,
                'currency' => 'USD',
                'top_courses' => $topCourses,
            ],
        ]);
    }

    /**
     * Instructor Analytics Dashboard (ANL-01).
     */
    public function instructorAnalytics(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        // 1. Total enrollments & revenue for this instructor
        $courseIds = Course::query()->where('primary_instructor_id', $user->id)->pluck('id');

        $totalEnrollments = Enrollment::query()->whereIn('course_id', $courseIds)->count();
        $netEarnings = (int) InstructorEarning::query()->where('instructor_id', $user->id)->sum('net_earnings_amount');

        // 2. Average completion rate across students
        $avgCompletion = (float) Enrollment::query()
            ->whereIn('course_id', $courseIds)
            ->avg('progress_percent');

        // 3. Drop-off / completed count per lecture
        $lectureStats = LectureProgress::query()
            ->whereHas('lecture', fn ($q) => $q->whereIn('course_id', $courseIds))
            ->selectRaw('lecture_id, count(*) as views_count, sum(case when is_completed then 1 else 0 end) as completions_count')
            ->groupBy('lecture_id')
            ->with(['lecture:id,ulid,title'])
            ->limit(20)
            ->get()
            ->map(fn ($r) => [
                'lecture_id' => $r->lecture?->ulid,
                'lecture_title' => $r->lecture?->title,
                'views_count' => (int) $r->views_count,
                'completions_count' => (int) $r->completions_count,
            ]);

        // 4. Page views from analytics events
        $pageViews = AnalyticsEvent::query()
            ->where('entity_type', 'course')
            ->whereIn('entity_id', $courseIds)
            ->where('event_name', 'course_view')
            ->count();

        return response()->json([
            'data' => [
                'total_page_views' => $pageViews,
                'total_enrollments' => $totalEnrollments,
                'net_earnings_amount' => $netEarnings,
                'average_completion_percent' => round($avgCompletion, 1),
                'lecture_dropoff_stats' => $lectureStats,
                'currency' => 'USD',
            ],
        ]);
    }

    /**
     * Export reports to CSV (ANL-04).
     */
    public function exportCsv(Request $request): Response
    {
        $courses = Course::query()->latest()->get();

        $csvHeader = "ULID,Title,Status,Price Cents,Enrollments,Rating,Reviews\n";
        $csvRows = '';

        foreach ($courses as $c) {
            $csvRows .= sprintf(
                "\"%s\",\"%s\",\"%s\",%d,%d,%.2f,%d\n",
                $c->ulid,
                str_replace('"', '""', $c->title),
                $c->status->value,
                $c->price_amount,
                $c->enrollments_count,
                $c->rating_cache,
                $c->reviews_count
            );
        }

        return response($csvHeader.$csvRows, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="courses_report_'.now()->format('Ymd_His').'.csv"',
        ]);
    }
}
