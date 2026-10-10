'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, X, Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/shared/course-card';
import { apiClient } from '@/lib/api-client';
import { Course, Category, ApiSuccessResponse } from '@/types/api';

const SORT_OPTIONS = [
  { value: 'most_popular', label: 'Most Popular' },
  { value: 'highest_rated', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest Releases' },
  { value: 'price_low_to_high', label: 'Price: Low to High' },
  { value: 'price_high_to_low', label: 'Price: High to Low' },
];

const LEVELS = [
  { value: 'all_levels', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

const RATINGS = [
  { value: '4.5', label: '4.5 & up' },
  { value: '4.0', label: '4.0 & up' },
  { value: '3.5', label: '3.5 & up' },
  { value: '3.0', label: '3.0 & up' },
];

function CoursesListingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Active filters from query string
  const currentQuery = searchParams.get('q') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentLevel = searchParams.get('level') || '';
  const currentPrice = searchParams.get('price') || '';
  const currentRating = searchParams.get('rating') || '';
  const currentSort = searchParams.get('sort') || 'most_popular';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(currentQuery);

  // Update URL helper
  const updateFilter = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.set('page', '1'); // Reset to first page
      router.push(`/courses?${params.toString()}`);
    },
    [router, searchParams]
  );

  const clearAllFilters = () => {
    router.push('/courses');
  };

  // Fetch categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await apiClient<Category[]>('/catalog/categories');
        setCategories(res.data || []);
      } catch {
        // Fallback or silently handle
      }
    }
    loadCategories();
  }, []);

  // Fetch courses on filter changes
  useEffect(() => {
    async function fetchCourses() {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (currentQuery) queryParams.set('q', currentQuery);
        if (currentCategory) queryParams.set('category', currentCategory);
        if (currentLevel) queryParams.set('level', currentLevel);
        if (currentPrice) queryParams.set('price', currentPrice);
        if (currentRating) queryParams.set('rating', currentRating);
        if (currentSort) queryParams.set('sort', currentSort);
        queryParams.set('page', currentPage.toString());

        const res = await apiClient<Course[]>(`/catalog/courses?${queryParams.toString()}`);
        setCourses(res.data || []);
        if (res.meta?.pagination) {
          setTotalPages(res.meta.pagination.last_page);
          setTotalCourses(res.meta.pagination.total);
        } else {
          setTotalCourses(res.data?.length || 0);
        }
      } catch {
        setCourses([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourses();
  }, [currentQuery, currentCategory, currentLevel, currentPrice, currentRating, currentSort, currentPage]);

  const activeFilterCount = [
    currentQuery,
    currentCategory,
    currentLevel,
    currentPrice,
    currentRating,
  ].filter(Boolean).length;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and Search */}
      <div className="mb-8 space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {currentCategory
              ? `Courses in ${categories.find((c) => c.slug === currentCategory)?.name || currentCategory}`
              : currentQuery
              ? `Search results for "${currentQuery}"`
              : 'Explore All Courses'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCourses.toLocaleString()} results found to level up your career
          </p>
        </div>

        {/* Quick Search and Mobile Toggle */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateFilter('q', searchInput.trim() || null);
            }}
            className="relative w-full sm:max-w-md"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter courses by keyword..."
              className="pl-9 pr-4"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground whitespace-nowrap hidden sm:inline">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {currentCategory && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('category', null)} />
              </Badge>
            )}
            {currentLevel && (
              <Badge variant="secondary" className="gap-1 text-xs capitalize">
                Level: {currentLevel.replace('_', ' ')}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('level', null)} />
              </Badge>
            )}
            {currentPrice && (
              <Badge variant="secondary" className="gap-1 text-xs capitalize">
                Price: {currentPrice}
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('price', null)} />
              </Badge>
            )}
            {currentRating && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Rating: {currentRating}★ & up
                <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('rating', null)} />
              </Badge>
            )}
            {currentQuery && (
              <Badge variant="secondary" className="gap-1 text-xs">
                Keyword: &quot;{currentQuery}&quot;
                <X className="h-3 w-3 cursor-pointer" onClick={() => {
                  setSearchInput('');
                  updateFilter('q', null);
                }} />
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground h-6 px-2"
            >
              Reset all
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <Filter className="h-4 w-4" />
              <span>Refine By</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-primary hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => updateFilter('category', null)}
                className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition ${
                  !currentCategory ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition flex items-center justify-between ${
                    currentCategory === cat.slug
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {cat.courses_count !== undefined && (
                    <span className="text-xs opacity-60">({cat.courses_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Price
            </h4>
            <div className="space-y-1">
              {['all', 'paid', 'free'].map((p) => {
                const isSelected = (p === 'all' && !currentPrice) || currentPrice === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateFilter('price', p === 'all' ? null : p)}
                    className={`w-full text-left text-sm py-1.5 px-2 rounded-md capitalize transition ${
                      isSelected
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {p === 'all' ? 'All Prices' : p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Course Level
            </h4>
            <div className="space-y-1">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => updateFilter('level', currentLevel === lvl.value ? null : lvl.value)}
                  className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition ${
                    currentLevel === lvl.value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Minimum Rating
            </h4>
            <div className="space-y-1">
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => updateFilter('rating', currentRating === r.value ? null : r.value)}
                  className={`w-full text-left text-sm py-1.5 px-2 rounded-md transition ${
                    currentRating === r.value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Courses Listing Grid */}
        <main className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse space-y-3 rounded-xl border p-4">
                  <div className="aspect-video bg-muted rounded-lg" />
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-5 bg-muted rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-6 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => updateFilter('page', (currentPage - 1).toString())}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm text-muted-foreground px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => updateFilter('page', (currentPage + 1).toString())}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center border rounded-2xl bg-muted/20 p-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No matching courses found</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                We couldn&apos;t find any courses matching your current filters. Try searching with different keywords or clearing applied filters.
              </p>
              <Button onClick={clearAllFilters} variant="outline" className="gap-2">
                <RotateCcw className="h-4 w-4" /> Reset All Filters
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center">Loading courses...</div>}>
      <CoursesListingContent />
    </Suspense>
  );
}
