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

  return (
    <Link href={`/courses/${course.slug}`} className="group block h-full">
      <Card className="h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/60 flex flex-col">
        {/* Course Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
              <BookOpen className="h-10 w-10 opacity-70" />
            </div>
          )}

          {/* Level Badge */}
          <div className="absolute left-2.5 top-2.5">
            <Badge variant="secondary" className="backdrop-blur-md bg-background/80 text-[11px] capitalize font-medium">
              {course.level.replace('_', ' ')}
            </Badge>
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-md text-foreground transition-all duration-200 hover:scale-110 hover:bg-background"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground hover:text-red-500'
              }`}
            />
          </button>
        </div>

        {/* Course Info */}
        <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>

            {course.instructor?.name && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {course.instructor.name}
              </p>
            )}

            {/* Ratings & Reviews */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-amber-500">{course.rating.toFixed(1)}</span>
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(course.rating) ? 'fill-current' : 'text-muted/60'
                    }`}
                  />
                ))}
              </div>
              <span className="text-muted-foreground">({course.reviews_count.toLocaleString()})</span>
            </div>

            {/* Meta stats */}
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-1">
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

          {/* Pricing */}
          <div className="pt-2 border-t border-border/50 flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-foreground">
                {formatPrice(course.price_amount, course.price_currency)}
              </span>
            </div>
            {course.enrollments_count > 100 && (
              <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
                Popular
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
