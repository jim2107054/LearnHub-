'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Play,
  Award,
  Search,
  Star,
  Clock,
  Heart,
  Calendar,
  MoreVertical,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { Enrollment } from '@/types/api';
import { toast } from 'sonner';

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'in_progress' | 'completed' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Weekly Goal state
  const [weeklyTargetMinutes, setWeeklyTargetMinutes] = useState(120);
  const [completedMinutesThisWeek, setCompletedMinutesThisWeek] = useState(45);

  useEffect(() => {
    async function loadEnrollments() {
      setIsLoading(true);
      try {
        const res = await apiClient<Enrollment[]>('/learning/enrollments');
        setEnrollments(res.data || []);
      } catch {
        setEnrollments([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadEnrollments();
  }, []);

  const toggleFavorite = (courseId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
        toast.info('Removed from favorites');
      } else {
        next.add(courseId);
        toast.success('Added to favorites');
      }
      return next;
    });
  };

  const filteredEnrollments = enrollments.filter((enr) => {
    const matchesQuery = enr.course.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesQuery) return false;

    if (selectedTab === 'in_progress') return enr.progress_percent < 100;
    if (selectedTab === 'completed') return enr.progress_percent >= 100;
    if (selectedTab === 'favorites') return favorites.has(enr.course.id);
    return true;
  });

  return (
    <div className="container py-10 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Learning</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track your ongoing courses, resume where you left off, and claim certificates
          </p>
        </div>

        {/* Weekly Learning Goal Widget */}
        <div className="rounded-xl border bg-muted/20 p-4 flex items-center gap-4 text-xs">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1 font-semibold text-foreground">
              <span>Weekly Goal:</span>
              <span>{completedMinutesThisWeek} / {weeklyTargetMinutes} mins</span>
            </div>
            <div className="w-36 h-2 bg-muted rounded-full overflow-hidden mt-1.5">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${Math.min(100, Math.round((completedMinutesThisWeek / weeklyTargetMinutes) * 100))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b pb-4">
        <div className="flex items-center gap-2 overflow-x-auto text-sm">
          {[
            { id: 'all', label: 'All Courses' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' },
            { id: 'favorites', label: 'Favorites' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search my courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground">Loading your courses...</p>
        </div>
      ) : filteredEnrollments.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnrollments.map((enr) => {
            const isFav = favorites.has(enr.course.id);
            const isCompleted = enr.progress_percent >= 100;

            return (
              <Card key={enr.id} className="overflow-hidden border-border/80 flex flex-col justify-between hover:shadow-lg transition">
                <div>
                  {/* Thumbnail Banner */}
                  <div className="relative aspect-video w-full bg-muted">
                    {enr.course.thumbnail_url ? (
                      <Image
                        src={enr.course.thumbnail_url}
                        alt={enr.course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        <BookOpen className="h-10 w-10" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleFavorite(enr.course.id)}
                      className="absolute right-2.5 top-2.5 h-8 w-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center text-foreground hover:scale-110 transition"
                    >
                      <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
                    </button>
                  </div>

                  {/* Course Info */}
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-bold text-base line-clamp-2 leading-snug">
                      {enr.course.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {enr.course.instructor?.name || 'Instructor'}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">
                          {isCompleted ? 'Completed' : `${enr.progress_percent}% complete`}
                        </span>
                        {isCompleted && (
                          <span className="text-emerald-500 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> 100%
                          </span>
                        )}
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-primary'
                          }`}
                          style={{ width: `${enr.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  <Button asChild className="w-full gap-2 font-semibold">
                    <Link href={`/learn/${enr.course.slug}/${enr.last_lecture_id || 'lec_1'}`}>
                      <Play className="h-4 w-4" />
                      {isCompleted ? 'Review Course' : 'Continue Learning'}
                    </Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center border rounded-2xl bg-muted/10 p-8 max-w-md mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BookOpen className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold">No courses match your filter</h2>
          <p className="text-xs text-muted-foreground">
            {searchQuery
              ? `No enrolled courses matched "${searchQuery}".`
              : 'You have not enrolled in any courses in this category yet.'}
          </p>
          <Button asChild variant="outline">
            <Link href="/courses">Explore Marketplace</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
