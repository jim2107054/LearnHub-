import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Award, Clock, ArrowRight, Users, BookOpen, Search, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CourseCard } from '@/components/shared/course-card';
import { Course, Category } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function getHomePageData(): Promise<{ courses: Course[]; categories: Category[] }> {
  try {
    const [coursesRes, catRes] = await Promise.all([
      fetch(`${API_BASE}/catalog/courses?sort=most_popular&per_page=8`, {
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
    <div className="flex flex-col gap-12 md:gap-16 pb-20 bg-canvas text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5]">
      {/* Hero Billboard Banner - Udemy Style */}
      <section className="container pt-6">
        <div className="relative rounded-card overflow-hidden bg-gradient-to-r from-[#2D2A4A] via-[#1F1F2E] to-[#2D1B4E] text-white p-8 md:p-14 lg:p-16 border border-hairline/20 shadow-none">
          <div className="max-w-2xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-medium text-white/90 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-[#ECEB98]" />
              <span>Real skills for the real world</span>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-5xl font-bold tracking-tight leading-tight">
              Learning that gets you.<br />
              <span className="text-[#ECEB98]">Skills for your present</span> and your future.
            </h1>

            <p className="text-base md:text-lg font-light text-white/80 leading-relaxed max-w-xl">
              Master development, cloud, AI, and business strategy with expert-led video courses and real-world projects.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/courses">
                <Button size="lg" className="h-12 px-6 rounded-btn bg-white text-ink font-bold hover:bg-white/90 hover:underline active:bg-btn-active active:text-white">
                  Explore Courses
                </Button>
              </Link>
              <Link href="/instructor/onboard">
                <Button size="lg" variant="outline" className="h-12 px-6 rounded-btn border-white/40 text-white font-bold hover:bg-white/10 hover:underline">
                  Teach on LearnHub
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative background overlay */}
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand via-purple-900 to-transparent" />
        </div>
      </section>

      {/* Value Propositions Strip */}
      <section className="container">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-4 p-5 rounded-card bg-white dark:bg-[#1D1D1E] border border-hairline">
            <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 text-brand">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink dark:text-white">Verifiable Certificates</h4>
              <p className="text-xs font-light text-muted-foreground mt-0.5">
                Earn recognized certificates on every completed curriculum.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-card bg-white dark:bg-[#1D1D1E] border border-hairline">
            <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 text-brand">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink dark:text-white">Lifetime Access</h4>
              <p className="text-xs font-light text-muted-foreground mt-0.5">
                Learn at your own pace anytime on desktop and mobile.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-card bg-white dark:bg-[#1D1D1E] border border-hairline">
            <div className="h-10 w-10 rounded-full bg-surface flex items-center justify-center flex-shrink-0 text-brand">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-ink dark:text-white">30-Day Money-Back</h4>
              <p className="text-xs font-light text-muted-foreground mt-0.5">
                Satisfaction guarantee on all course enrollments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Categories - Compact Udemy Cards */}
      <section className="container">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink dark:text-white">
              Top Categories
            </h2>
            <p className="text-sm font-light text-muted-foreground mt-1">
              Explore skills across our top learning categories
            </p>
          </div>
          <Link href="/courses" className="text-sm font-bold text-brand hover:text-link-hover hover:underline">
            All categories →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/courses?category=${cat.slug}`} className="group">
              <div className="h-full rounded-card-sm border border-hairline bg-white dark:bg-[#1D1D1E] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink/40 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-ink dark:text-white group-hover:text-brand transition-colors line-clamp-1">
                    {cat.name}
                  </h4>
                  <p className="text-xs font-light text-muted-foreground mt-1">
                    {cat.courses_count ? `${cat.courses_count} courses` : 'Explore'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured / Bestselling Courses Showcase */}
      <section className="container">
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink dark:text-white">
              Learners are viewing
            </h2>
            <p className="text-sm font-light text-muted-foreground mt-1">
              High-rated courses trending across the catalog
            </p>
          </div>
          <Link href="/courses?sort=highest_rated" className="text-sm font-bold text-brand hover:text-link-hover hover:underline">
            See all courses →
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.slice(0, 8).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border border-hairline rounded-card bg-white p-8 max-w-md mx-auto space-y-3">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-light text-muted-foreground">Loading courses...</p>
          </div>
        )}
      </section>

      {/* Become an Instructor Banner - Udemy Style */}
      <section className="container">
        <div className="rounded-card bg-surface dark:bg-[#1D1D1E] border border-hairline p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-ink dark:text-white">
              Become an instructor
            </h2>
            <p className="text-sm md:text-base font-light text-muted-foreground leading-relaxed">
              Instructors from around the world teach millions of learners on LearnHub. We provide the tools and skills to teach what you love.
            </p>
            <div className="pt-2">
              <Link href="/instructor/onboard">
                <Button size="lg" className="h-12 px-6 rounded-btn bg-ink text-white font-bold hover:bg-ink/90 hover:underline active:bg-btn-active">
                  Start teaching today
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 rounded-card bg-white dark:bg-[#29292A] border border-hairline">
            <div className="h-14 w-14 rounded-full bg-brand/10 text-brand flex items-center justify-center">
              <Users className="h-7 w-7" />
            </div>
            <div>
              <p className="text-2xl font-bold text-ink dark:text-white">100,000+</p>
              <p className="text-xs font-light text-muted-foreground">Active learners globally</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
