'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, Clock, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@/types/api';
import { formatPrice, formatDuration } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface CourseCardProps {
  course: Course;
  initialWishlisted?: boolean;
}

export function CourseCard({ course, initialWishlisted = false }: CourseCardProps) {
  const { isAuthenticated } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please sign in to add courses to your wishlist');
      return;
    }

    const previous = isWishlisted;
    setIsWishlisted(!previous); // Optimistic update
    setIsTogglingWishlist(true);

    try {
      if (previous) {
        await apiClient(`/wishlist/${course.id}`, { method: 'DELETE' });
        toast.info('Removed from wishlist');
      } else {
        await apiClient(`/wishlist/${course.id}`, { method: 'POST' });
        toast.success('Added to wishlist');
      }
    } catch {
      setIsWishlisted(previous); // Revert on error
      toast.error('Could not update wishlist. Please try again.');
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const isBestseller = (course.enrollments_count || 0) > 100 || course.rating >= 4.8;

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full select-none">
      <Card className="h-full overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:border-[#1F1F2E]/30 bg-white dark:bg-[#1D1D1E] border border-hairline rounded-card flex flex-col shadow-none">
        {/* Course Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-surface">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-brand/10 text-brand">
              <BookOpen className="h-10 w-10 opacity-70" />
            </div>
          )}

          {/* Level Badge */}
          <div className="absolute left-3 top-3">
            <Badge variant="secondary" className="backdrop-blur-sm bg-white/90 text-ink text-[11px] capitalize font-medium shadow-none">
              {course.level.replace('_', ' ')}
            </Badge>
          </div>

          {/* Udemy-style Circular Pill Wishlist Button (28px) */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-udemy-sm transition-all duration-150 hover:bg-white hover:scale-110 active:bg-btn-active active:text-white"
          >
            <Heart
              className={`h-3.5 w-3.5 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-ink hover:text-red-500'
              }`}
            />
          </button>
        </div>

        {/* Course Info */}
        <CardContent className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <h3 className="font-bold text-base leading-snug line-clamp-2 text-ink dark:text-white group-hover:text-brand transition-colors">
              {course.title}
            </h3>

            {course.instructor?.name && (
              <p className="text-xs font-light text-muted-foreground line-clamp-1">
                {course.instructor.name}
              </p>
            )}

            {/* Ratings & Reviews (Udemy golden star styling) */}
            <div className="flex items-center gap-1.5 text-xs pt-0.5">
              <span className="font-bold text-[#B4690E] dark:text-[#E59819]">{course.rating.toFixed(1)}</span>
              <div className="flex text-[#B4690E] dark:text-[#E59819]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(course.rating) ? 'fill-current' : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground font-light text-[11px]">
                ({course.reviews_count.toLocaleString()})
              </span>
            </div>

            {/* Meta stats */}
            <div className="flex items-center gap-3 text-[11px] font-light text-muted-foreground pt-1">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(course.total_duration_seconds)}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                <span>{course.lectures_count} lectures</span>
              </div>
            </div>
          </div>

          {/* Pricing & Badges */}
          <div className="pt-2 border-t border-hairline flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-ink dark:text-white">
                {formatPrice(course.price_amount, course.price_currency)}
              </span>
            </div>
            {isBestseller && (
              <Badge variant="bestseller" className="text-[10px] uppercase tracking-wider py-0.5 px-2">
                Bestseller
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
