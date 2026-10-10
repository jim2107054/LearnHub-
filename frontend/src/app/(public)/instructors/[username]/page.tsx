import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Star, Users, BookOpen, Award, ArrowLeft, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/shared/course-card';
import { InstructorProfile } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function getInstructorProfile(username: string): Promise<InstructorProfile | null> {
  try {
    const res = await fetch(`${API_BASE}/catalog/instructors/${username}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    return null;
  }
}

interface InstructorPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: InstructorPageProps): Promise<Metadata> {
  const { username } = await params;
  const instructor = await getInstructorProfile(username);

  if (!instructor) {
    return {
      title: 'Instructor Not Found | LearnHub',
    };
  }

  return {
    title: `${instructor.name} — Instructor Profile | LearnHub`,
    description: instructor.bio?.slice(0, 160) || `Learn from ${instructor.name} on LearnHub.`,
  };
}

export default async function InstructorPublicProfilePage({ params }: InstructorPageProps) {
  const { username } = await params;
  const instructor = await getInstructorProfile(username);

  if (!instructor) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      {/* Top Profile Card */}
      <div className="flex flex-col md:flex-row gap-8 items-start border-b pb-12">
        <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full overflow-hidden bg-primary/10 border-4 border-background shadow-xl flex-shrink-0">
          {instructor.avatar_url ? (
            <Image
              src={instructor.avatar_url}
              alt={instructor.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-primary">
              <UserIcon className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="space-y-4 flex-1">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Instructor Profile
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-1">
              {instructor.name}
            </h1>
            <p className="text-muted-foreground text-base mt-1 font-medium">
              {instructor.headline}
            </p>
          </div>

          {/* Instructor Stats */}
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-bold">{instructor.students_count.toLocaleString()}</span>
              <span className="text-muted-foreground">Students</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
              <span className="font-bold">{instructor.rating.toFixed(1)}</span>
              <span className="text-muted-foreground">Instructor Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <span className="font-bold">{instructor.reviews_count.toLocaleString()}</span>
              <span className="text-muted-foreground">Reviews</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span className="font-bold">{instructor.courses_count}</span>
              <span className="text-muted-foreground">Courses</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              About Me
            </h2>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">
              {instructor.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Instructor Courses Rail */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">
            Courses by {instructor.name} ({instructor.courses?.length || 0})
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href="/courses">
              <ArrowLeft className="mr-2 h-4 w-4" /> All courses
            </Link>
          </Button>
        </div>

        {instructor.courses && instructor.courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {instructor.courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center rounded-xl border bg-muted/20 p-6 text-sm text-muted-foreground">
            No active courses published at this time. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
}
