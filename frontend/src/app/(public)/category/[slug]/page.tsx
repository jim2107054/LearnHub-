import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronRight, FolderTree, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from '@/components/shared/course-card';
import { Category, Course } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const res = await fetch(`${API_BASE}/catalog/categories/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

async function getCategoryCourses(slug: string): Promise<Course[]> {
  try {
    const res = await fetch(`${API_BASE}/catalog/courses?category=${slug}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    return {
      title: 'Category Not Found | LearnHub',
    };
  }

  return {
    title: `${category.name} Courses & Tutorials | LearnHub`,
    description: category.description || `Browse the best online courses and master ${category.name} on LearnHub.`,
    openGraph: {
      title: `${category.name} Online Courses | LearnHub`,
      description: category.description || `Browse high-quality ${category.name} courses taught by industry experts.`,
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategory(slug);

  if (!category) {
    notFound();
  }

  const courses = await getCategoryCourses(slug);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-y-0 text-xs text-muted-foreground mb-6 gap-2">
        <Link href="/" className="hover:text-foreground transition">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/courses" className="hover:text-foreground transition">
          Categories
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="mb-10 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-background border p-8 md:p-12 relative overflow-hidden">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold text-primary">
            <FolderTree className="h-3.5 w-3.5" />
            <span>Category Hub</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">
            {category.name} Courses
          </h1>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            {category.description ||
              `Master ${category.name} with project-based, in-depth video courses from top industry practitioners. Earn shareable completion certificates.`}
          </p>

          {/* Subcategories Chips if present */}
          {category.children && category.children.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-foreground block mb-2">Subcategories:</span>
              <div className="flex flex-wrap gap-2">
                {category.children.map((sub) => (
                  <Link
                    key={sub.slug}
                    href={`/category/${sub.slug}`}
                    className="text-xs px-3 py-1.5 rounded-full bg-background/80 hover:bg-background border font-medium transition shadow-sm"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">
            Featured in {category.name} ({courses.length})
          </h2>
          <Button asChild variant="outline" size="sm">
            <Link href={`/courses?category=${category.slug}`}>
              View with filters
            </Link>
          </Button>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center border rounded-2xl bg-muted/20 p-8 space-y-4">
            <p className="text-muted-foreground text-sm">
              No courses are currently available in this category.
            </p>
            <Button asChild variant="outline">
              <Link href="/courses">
                <ArrowLeft className="mr-2 h-4 w-4" /> Browse all courses
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
