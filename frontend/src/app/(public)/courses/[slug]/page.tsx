import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CourseDetailView } from './course-detail-view';
import { Course, Review, RatingBreakdown } from '@/types/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function getCourse(slug: string): Promise<Course | null> {
  try {
    const res = await fetch(`${API_BASE}/catalog/courses/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}

async function getReviews(slug: string): Promise<Review[]> {
  try {
    const res = await fetch(`${API_BASE}/courses/${slug}/reviews`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

async function getRelatedCourses(slug: string): Promise<Course[]> {
  try {
    const res = await fetch(`${API_BASE}/catalog/courses/${slug}/related`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return {
      title: 'Course Not Found | LearnHub',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://learnhub.example.com';
  const url = `${siteUrl}/courses/${course.slug}`;

  return {
    title: `${course.title} | LearnHub`,
    description: course.subtitle || course.description?.slice(0, 160) || 'Learn on LearnHub',
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${course.title} | Online Course`,
      description: course.subtitle || course.description?.slice(0, 160),
      url,
      type: 'website',
      images: course.thumbnail_url ? [{ url: course.thumbnail_url }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: course.title,
      description: course.subtitle || course.description?.slice(0, 160),
      images: course.thumbnail_url ? [course.thumbnail_url] : [],
    },
  };
}

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const [reviews, relatedCourses] = await Promise.all([
    getReviews(slug),
    getRelatedCourses(slug),
  ]);

  // Construct rating breakdown from reviews or mock
  const ratingBreakdown: RatingBreakdown = {
    average_rating: course.rating,
    total_reviews: course.reviews_count,
    distribution: {
      5: { count: Math.round(course.reviews_count * 0.7), percentage: 70 },
      4: { count: Math.round(course.reviews_count * 0.2), percentage: 20 },
      3: { count: Math.round(course.reviews_count * 0.06), percentage: 6 },
      2: { count: Math.round(course.reviews_count * 0.03), percentage: 3 },
      1: { count: Math.round(course.reviews_count * 0.01), percentage: 1 },
    },
  };

  // Schema.org JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description || course.subtitle,
    provider: {
      '@type': 'Organization',
      name: 'LearnHub',
      sameAs: 'https://learnhub.example.com',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: course.rating.toFixed(1),
      ratingCount: Math.max(course.reviews_count, 1),
    },
    offers: {
      '@type': 'Offer',
      price: (course.price_amount / 100).toFixed(2),
      priceCurrency: course.price_currency || 'USD',
      availability: 'https://schema.org/InStock',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: {
        '@type': 'Person',
        name: course.instructor?.name || 'Instructor',
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CourseDetailView
        course={course}
        reviews={reviews}
        ratingBreakdown={ratingBreakdown}
        relatedCourses={relatedCourses}
      />
    </>
  );
}
