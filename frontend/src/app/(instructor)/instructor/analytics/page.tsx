'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface DropOffItem {
  lecture_id: string;
  lecture_title: string;
  duration_minutes: number;
  viewers_count: number;
  retention_percent: number;
  drop_off_percent: number;
}

export default function InstructorAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30d');

  const dropOffData: DropOffItem[] = [
    {
      lecture_id: 'lec_1',
      lecture_title: '1. Welcome to the Course & Architecture Overview',
      duration_minutes: 8,
      viewers_count: 8900,
      retention_percent: 100,
      drop_off_percent: 0,
    },
    {
      lecture_id: 'lec_2',
      lecture_title: '2. Docker & Kubernetes Local Cluster Setup',
      duration_minutes: 12,
      viewers_count: 8188,
      retention_percent: 92,
      drop_off_percent: 8,
    },
    {
      lecture_id: 'lec_3',
      lecture_title: '3. Defining Protocol Buffers and Streaming RPCs',
      duration_minutes: 15,
      viewers_count: 7387,
      retention_percent: 83,
      drop_off_percent: 9,
    },
    {
      lecture_id: 'lec_4',
      lecture_title: '4. Database Migrations and Connection Pooling',
      duration_minutes: 14,
      viewers_count: 6586,
      retention_percent: 74,
      drop_off_percent: 9,
    },
    {
      lecture_id: 'lec_5',
      lecture_title: '5. Multi-Region Failover Architecture',
      duration_minutes: 18,
      viewers_count: 5785,
      retention_percent: 65,
      drop_off_percent: 9,
    },
  ];

  const handleExportCsv = () => {
    const csvContent =
      'Lecture ID,Lecture Title,Duration (Mins),Viewers,Retention %,Drop-off %\n' +
      dropOffData
        .map(
          (d) =>
            `"${d.lecture_id}","${d.lecture_title}",${d.duration_minutes},${d.viewers_count},${d.retention_percent}%,${d.drop_off_percent}%`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-dropoff-${dateRange}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics CSV report exported');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Analytics & Student Heatmap</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Analyze retention curves, engagement depth, and pinpoint lecture drop-off bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-xs shadow-sm"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="year">Past Year</option>
          </select>

          <Button onClick={handleExportCsv} variant="outline" size="sm" className="text-xs gap-1.5 h-9">
            <Download className="h-3.5 w-3.5" /> Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Course Completion Rate</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-foreground">65.2%</h3>
              <Badge className="bg-emerald-500/10 text-emerald-600 gap-1 text-[11px] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" /> +4.2%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Marketplace benchmark: 42%</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Average Minutes Watched</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-foreground">53.4 mins</h3>
              <Badge className="bg-emerald-500/10 text-emerald-600 gap-1 text-[11px] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" /> +8.1%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Per enrolled student</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Active Daily Learners</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-foreground">624</h3>
              <Badge className="bg-emerald-500/10 text-emerald-600 gap-1 text-[11px] font-bold">
                <ArrowUpRight className="h-3.5 w-3.5" /> +12%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Active in the last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Lecture Drop-Off Heatmap (ANL-03) */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" /> Lecture Retention & Drop-Off Heatmap (ANL-03)
          </CardTitle>
          <CardDescription className="text-xs">
            Pinpoint exact lectures where student engagement declines to improve pacing and exercise design.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Lecture Title</th>
                  <th className="p-4">Duration</th>
                  <th className="p-4">Learners Reached</th>
                  <th className="p-4">Retention Bar</th>
                  <th className="p-4 text-right">Drop-Off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {dropOffData.map((item) => (
                  <tr key={item.lecture_id} className="hover:bg-muted/10 transition">
                    <td className="p-4 font-semibold text-foreground max-w-xs truncate">
                      {item.lecture_title}
                    </td>
                    <td className="p-4 text-muted-foreground">{item.duration_minutes} mins</td>
                    <td className="p-4 font-bold text-foreground">
                      {item.viewers_count.toLocaleString()}
                    </td>
                    <td className="p-4 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.retention_percent >= 80
                                ? 'bg-emerald-500'
                                : item.retention_percent >= 60
                                ? 'bg-amber-500'
                                : 'bg-destructive'
                            }`}
                            style={{ width: `${item.retention_percent}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold w-10 text-right">
                          {item.retention_percent}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      {item.drop_off_percent > 0 ? (
                        <span className="text-destructive font-bold font-mono">
                          -{item.drop_off_percent}%
                        </span>
                      ) : (
                        <span className="text-muted-foreground font-mono">0%</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
