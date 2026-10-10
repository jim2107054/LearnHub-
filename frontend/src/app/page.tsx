import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Award, Clock, ArrowRight, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const CATEGORIES = [
  { name: 'Software Development', slug: 'software-development', count: '1,420 courses' },
  { name: 'Cloud & DevOps', slug: 'cloud-and-devops', count: '890 courses' },
  { name: 'Data & AI', slug: 'data-and-ai', count: '650 courses' },
  { name: 'Cybersecurity', slug: 'cybersecurity', count: '410 courses' },
  { name: 'Design & UI/UX', slug: 'design', count: '520 courses' },
  { name: 'Business Leadership', slug: 'business', count: '780 courses' },
];

const FEATURED_COURSES = [
  {
    id: '1',
    title: 'Distributed Systems & Microservices Architecture',
    instructor: 'Alex Mercer',
    level: 'Advanced',
    rating: 4.9,
    reviews: 1240,
    price: '$79.99',
    badge: 'Bestseller',
  },
  {
    id: '2',
    title: 'Fullstack Next.js 15 & Laravel 12 Enterprise Architecture',
    instructor: 'Elena Rostova',
    level: 'Intermediate',
    rating: 4.8,
    reviews: 860,
    price: '$59.99',
    badge: 'Hot & New',
  },
  {
    id: '3',
    title: 'Kubernetes Production Operations & GitOps Mastery',
    instructor: 'David Chen',
    level: 'All Levels',
    rating: 4.9,
    reviews: 2100,
    price: '$89.99',
    badge: 'Popular',
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background py-20 md:py-28 border-b">
        <div className="container mx-auto px-4 text-center max-w-4xl">
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
      <section className="container mx-auto px-4">
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
          {CATEGORIES.map((cat) => (
            <Link key={cat.slug} href={`/courses?category=${cat.slug}`}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{cat.name}</p>
                  <p className="text-xs text-muted-foreground mt-2">{cat.count}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Courses Showcase */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Featured & Bestselling Courses</h2>
            <p className="text-sm text-muted-foreground">Highest-rated courses recommended by learners</p>
          </div>
          <Link href="/courses?sort=-rating" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            View ranking <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURED_COURSES.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all border flex flex-col justify-between">
              <div className="aspect-video w-full bg-gradient-to-br from-purple-700 via-indigo-800 to-slate-900 flex items-center justify-center p-6 text-white text-center">
                <span className="font-bold text-lg leading-snug">{course.title}</span>
              </div>
              <CardContent className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs font-medium">
                      {course.level}
                    </Badge>
                    <Badge variant="success" className="text-xs">
                      {course.badge}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-base mb-1 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{course.instructor}</p>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold mb-3">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    <span>{course.rating}</span>
                    <span className="text-muted-foreground font-normal">({course.reviews} reviews)</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="font-bold text-lg">{course.price}</span>
                    <Button size="sm">Enroll Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Instructor CTA Banner */}
      <section className="container mx-auto px-4">
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
