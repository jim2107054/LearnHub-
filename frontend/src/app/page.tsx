import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Award, Clock, ArrowRight, Users, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard } from '@/components/shared/course-card';
import { Course, Category } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function getHomePageData(): Promise<{ courses: Course[]; categories: Category[] }> {
  try {
    const [coursesRes, catRes] = await Promise.all([
      fetch(`${API_BASE}/catalog/courses?sort=most_popular&per_page=6`, {
        next: { revalidate: 60 },
      }),
      fetch(`${API_BASE}/catalog/categories`, {
        next: { revalidate: 300 },
      }),
    ]);

    const coursesJson = coursesRes.ok ? await coursesRes.json() : null;
    const catJson = catRes.ok ? await catRes.json() : null;

    return {
      courses: coursesJson?.data || [],
      categories: catJson?.data || [],
    };
  } catch (err) {
    console.error('Failed to load homepage data:', err);
    return { courses: [], categories: [] };
  }
}

export default async function HomePage() {
  const { courses, categories } = await getHomePageData();

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 md:py-28 border-b">
        <div className="container text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-xs font-medium backdrop-blur shadow-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Over 10,000+ verified video lectures and hands-on projects</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Master in-demand skills from{' '}
            <span className="bg-gradient-to-r from-primary via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              industry professionals
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Upgrade your engineering and leadership career with real-world video courses, interactive quizzes, and verifiable certificates.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/courses">
              <Button size="lg" className="w-full sm:w-auto gap-2 shadow-lg hover:shadow-xl transition-all">
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/instructor/onboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Teach on LearnHub
              </Button>
            </Link>
          </div>

          {/* Trust Value Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 pt-12 border-t">
            <div className="flex items-center justify-center gap-3 text-left">
              <Award className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Verifiable Certificates</p>
                <p className="text-xs text-muted-foreground">Share authenticated credentials on LinkedIn</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-left">
              <Clock className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Lifetime Full Access</p>
                <p className="text-xs text-muted-foreground">Learn at your own pace anytime on web and mobile</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-3 text-left">
              <ShieldCheck className="h-8 w-8 text-primary flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">30-Day Money-Back</p>
                <p className="text-xs text-muted-foreground">Guaranteed refund policy on all course enrollments</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Top Learning Categories</h2>
            <p className="text-sm text-muted-foreground">Choose from the most popular technical disciplines</p>
          </div>
          <Link href="/courses" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            Browse all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/courses?category=${cat.slug}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{cat.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {cat.courses_count ? `${cat.courses_count} courses` : 'Explore'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured & Bestselling Courses</h2>
            <p className="text-sm text-muted-foreground">Highest-rated courses recommended by learners</p>
          </div>
          <Link href="/courses?sort=highest_rated" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            View ranking <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.slice(0, 6).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border rounded-2xl bg-muted/10 p-8 max-w-md mx-auto space-y-4">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">Loading courses from catalog...</p>
          </div>
        )}
      </section>

      {/* Instructor CTA Banner */}
      <section className="container">
        <div className="rounded-2xl bg-gradient-to-r from-primary via-purple-700 to-indigo-800 p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">Become an Instructor on LearnHub</h2>
            <p className="text-white/80 text-sm md:text-base mb-6">
              Share your engineering mastery with global students. Earn up to 97% revenue share on your courses with our state-of-the-art studio and marketing tools.
            </p>
            <Link href="/instructor/onboard">
              <Button size="lg" variant="secondary" className="font-semibold">
                Start Teaching Today
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-6 border border-white/10">
            <Users className="h-12 w-12 text-purple-200" />
            <div>
              <p className="text-2xl font-bold">100,000+</p>
              <p className="text-xs text-white/70">Active learners worldwide</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
