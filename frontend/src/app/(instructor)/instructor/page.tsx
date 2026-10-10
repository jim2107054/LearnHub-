'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  Star,
  BookOpen,
  Plus,
  ArrowRight,
  Edit3,
  BarChart3,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';

interface InstructorCourseSummary {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'under_review' | 'published' | 'rejected';
  enrollments_count: number;
  rating: number;
  price_amount: number;
  lectures_count: number;
  total_duration_seconds: number;
  updated_at: string;
}

export default function InstructorDashboardPage() {
  const [courses, setCourses] = useState<InstructorCourseSummary[]>([
    {
      id: 'crs_1',
      title: 'Complete Cloud Architecture Masterclass',
      slug: 'cloud-architecture-masterclass',
      status: 'published',
      enrollments_count: 8900,
      rating: 4.8,
      price_amount: 4999,
      lectures_count: 38,
      total_duration_seconds: 14200,
      updated_at: '2026-03-27T10:00:00Z',
    },
    {
      id: 'crs_2',
      title: 'Distributed Systems with Go and Kubernetes',
      slug: 'distributed-systems-go-k8s',
      status: 'under_review',
      enrollments_count: 0,
      rating: 0,
      price_amount: 6999,
      lectures_count: 24,
      total_duration_seconds: 9800,
      updated_at: '2026-03-28T14:30:00Z',
    },
    {
      id: 'crs_3',
      title: 'High-Performance PostgreSQL & Partitioning',
      slug: 'high-performance-postgresql',
      status: 'draft',
      enrollments_count: 0,
      rating: 0,
      price_amount: 3999,
      lectures_count: 4,
      total_duration_seconds: 1800,
      updated_at: '2026-03-29T09:00:00Z',
    },
  ]);

  const kpis = {
    totalRevenue: 2489000, // $24,890.00
    activeStudents: 8900,
    averageRating: 4.8,
    publishedCourses: 1,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Instructor Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Monitor course performance, manage your curriculum, and inspect student growth
          </p>
        </div>

        <Button asChild className="gap-2 font-bold text-xs h-10 shadow-md">
          <Link href="/instructor/courses/create">
            <Plus className="h-4 w-4" /> Create New Course
          </Link>
        </Button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Total Earnings</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">
                {formatPrice(kpis.totalRevenue, 'USD')}
              </h3>
              <span className="text-[11px] text-emerald-600 font-medium">+$2,410 this month</span>
            </div>
            <div className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Total Students</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">
                {kpis.activeStudents.toLocaleString()}
              </h3>
              <span className="text-[11px] text-emerald-600 font-medium">+412 new enrollments</span>
            </div>
            <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Instructor Rating</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">
                {kpis.averageRating.toFixed(1)} ★
              </h3>
              <span className="text-[11px] text-muted-foreground">From 1,420 ratings</span>
            </div>
            <div className="h-11 w-11 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Published Courses</p>
              <h3 className="text-2xl font-extrabold text-foreground mt-1">
                {kpis.publishedCourses}
              </h3>
              <span className="text-[11px] text-muted-foreground">2 courses in progress</span>
            </div>
            <div className="h-11 w-11 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <BookOpen className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Your Courses</h2>
          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/instructor/courses">View All Courses</Link>
          </Button>
        </div>

        <div className="space-y-3">
          {courses.map((course) => {
            const statusConfig = {
              published: { label: 'Published', variant: 'default' as const, color: 'bg-emerald-600 text-white' },
              under_review: { label: 'Under Review', variant: 'secondary' as const, color: 'bg-amber-500 text-white' },
              draft: { label: 'Draft', variant: 'outline' as const, color: '' },
              rejected: { label: 'Changes Requested', variant: 'destructive' as const, color: '' },
            }[course.status];

            return (
              <Card key={course.id} className="border-border hover:shadow-md transition">
                <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusConfig.color || 'bg-muted text-muted-foreground'}`}>
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {course.lectures_count} lectures
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-foreground truncate">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span>{course.enrollments_count.toLocaleString()} students</span>
                      {course.rating > 0 && <span>{course.rating.toFixed(1)} ★</span>}
                      <span>{formatPrice(course.price_amount, 'USD')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button asChild variant="outline" size="sm" className="text-xs gap-1.5">
                      <Link href={`/instructor/courses/${course.id}/edit`}>
                        <Edit3 className="h-3.5 w-3.5" /> Edit Course
                      </Link>
                    </Button>

                    <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5">
                      <Link href={`/instructor/analytics?course=${course.id}`}>
                        <BarChart3 className="h-3.5 w-3.5" /> Analytics
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
