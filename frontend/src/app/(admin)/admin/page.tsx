'use client';

import React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  CheckSquare,
  Flag,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const kpis = {
    grossVolume: 184500000, // $1,845,000.00
    activeLearners: 142800,
    activeInstructors: 2450,
    pendingCourseReviews: 7,
    unresolvedReports: 4,
    copyrightStrikesActive: 2,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Staff Administration Console</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Platform-wide health metrics, course publishing queues, and community moderation
        </p>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Gross Marketplace GMV</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">
                {formatPrice(kpis.grossVolume, 'USD')}
              </h3>
              <span className="text-[11px] text-emerald-600 font-medium">+$142k this month</span>
            </div>
            <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Active Accounts</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">
                {(kpis.activeLearners + kpis.activeInstructors).toLocaleString()}
              </h3>
              <span className="text-[11px] text-muted-foreground">
                {kpis.activeInstructors.toLocaleString()} approved instructors
              </span>
            </div>
            <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Course Reviews Queue</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">
                {kpis.pendingCourseReviews}
              </h3>
              <span className="text-[11px] text-amber-600 font-medium">Action required</span>
            </div>
            <div className="h-11 w-11 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <CheckSquare className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Open Reports</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">
                {kpis.unresolvedReports}
              </h3>
              <span className="text-[11px] text-destructive font-medium">Triage queue</span>
            </div>
            <div className="h-11 w-11 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
              <Flag className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Queues */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Course Publishing Queue</CardTitle>
              <CardDescription className="text-xs">
                Courses submitted by instructors awaiting staff verification
              </CardDescription>
            </div>
            <Badge className="bg-amber-500 text-white text-xs">{kpis.pendingCourseReviews} Pending</Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3 divide-y divide-border/60 text-xs">
              <div className="pt-2 first:pt-0 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Distributed Systems with Go and Kubernetes</p>
                  <p className="text-muted-foreground">Instructor: Sarah Connor • Submitted 2h ago</p>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs h-7">
                  <Link href="/admin/course-reviews">Inspect</Link>
                </Button>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Next.js 15 App Router Architecture</p>
                  <p className="text-muted-foreground">Instructor: Alex Johnson • Submitted 5h ago</p>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs h-7">
                  <Link href="/admin/course-reviews">Inspect</Link>
                </Button>
              </div>
            </div>

            <Button asChild className="w-full text-xs font-semibold" variant="secondary">
              <Link href="/admin/course-reviews">
                Open Review Queue <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Moderation Triage</CardTitle>
              <CardDescription className="text-xs">
                Community reports on abusive reviews or forum content
              </CardDescription>
            </div>
            <Badge className="bg-destructive text-white text-xs">{kpis.unresolvedReports} Open</Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3 divide-y divide-border/60 text-xs">
              <div className="pt-2 first:pt-0 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Review Flag: Suspected abusive spam</p>
                  <p className="text-muted-foreground">Reported by 2 students • Course: Cloud HA</p>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs h-7">
                  <Link href="/admin/moderation">Triage</Link>
                </Button>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">DMCA Notice: External lecture mirror</p>
                  <p className="text-muted-foreground">Notice from Copyright Holder • Strike 1</p>
                </div>
                <Button asChild size="sm" variant="outline" className="text-xs h-7">
                  <Link href="/admin/dmca">Review</Link>
                </Button>
              </div>
            </div>

            <Button asChild className="w-full text-xs font-semibold" variant="secondary">
              <Link href="/admin/moderation">
                Open Moderation Desk <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
