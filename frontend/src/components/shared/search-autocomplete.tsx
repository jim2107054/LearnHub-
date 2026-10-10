'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search, Loader2, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';
import { Course } from '@/types/api';

interface AutocompleteResult {
  courses: Course[];
  categories?: Array<{ name: string; slug: string }>;
}

export function SearchAutocomplete() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AutocompleteResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await apiClient<AutocompleteResult>(`/catalog/search/autocomplete?q=${encodeURIComponent(query)}`);
        setResults(res.data);
        setIsOpen(true);
      } catch {
        // Silently fail autocomplete suggestions
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/courses?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectCourse = (slug: string) => {
    setIsOpen(false);
    router.push(`/courses/${slug}`);
  };

  const handleSelectCategory = (categorySlug: string) => {
    setIsOpen(false);
    router.push(`/courses?category=${categorySlug}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results && query.length >= 2) setIsOpen(true);
            }}
            placeholder="Search for courses, skills, subjects..."
            className="pl-9 pr-8 h-9 text-sm rounded-full bg-muted/40 focus:bg-background border-border"
          />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </form>

      {isOpen && results && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover text-popover-foreground rounded-xl border border-border shadow-2xl overflow-hidden divide-y divide-border/50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Category Suggestions */}
          {results.categories && results.categories.length > 0 && (
            <div className="p-2 bg-muted/20">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground px-2">
                Categories
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {results.categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => handleSelectCategory(cat.slug)}
                    className="text-xs px-2.5 py-1 rounded-md bg-secondary hover:bg-secondary/80 font-medium transition"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Course Suggestions */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/30">
            {results.courses && results.courses.length > 0 ? (
              results.courses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => handleSelectCourse(course.slug)}
                  className="flex items-center gap-3 p-3 hover:bg-accent cursor-pointer transition"
                >
                  <div className="relative h-12 w-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                    {course.thumbnail_url ? (
                      <Image
                        src={course.thumbnail_url}
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                        <BookOpen className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium line-clamp-1 text-foreground">
                      {course.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {course.instructor?.name || 'Instructor'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-bold text-foreground">
                      {formatPrice(course.price_amount, course.price_currency)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No matching courses found for &quot;{query}&quot;
              </div>
            )}
          </div>

          <div className="p-2 bg-muted/30 text-center">
            <button
              type="button"
              onClick={handleSearchSubmit}
              className="text-xs font-semibold text-primary hover:underline"
            >
              See all results for &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
