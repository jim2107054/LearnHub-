'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, X, Search, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from '@/components/shared/course-card';
import { apiClient } from '@/lib/api-client';
import { Course, Category } from '@/types/api';

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
        const meta = res.meta as any;
        const lastPage = meta?.pagination?.last_page || meta?.last_page || 1;
        const total = meta?.pagination?.total || meta?.total || res.data?.length || 0;
        setTotalPages(lastPage);
        setTotalCourses(total);
      } catch (err) {
        console.error('Failed to fetch courses:', err);
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
    <div className="container py-8 md:py-12 bg-canvas min-h-screen text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5]">
      {/* Header and Search */}
      <div className="mb-8 space-y-5">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink dark:text-white">
            {currentCategory
              ? `${categories.find((c) => c.slug === currentCategory)?.name || currentCategory} Courses`
              : currentQuery
              ? `Results for "${currentQuery}"`
              : 'All Courses'}
          </h1>
          <p className="text-sm font-light text-muted-foreground mt-1">
            {totalCourses.toLocaleString()} courses found to expand your skills
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Filter courses by keyword..."
              className="pl-11 pr-4 h-11 rounded-full bg-white dark:bg-[#1D1D1E] border border-hairline shadow-none"
            />
          </form>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 h-10 rounded-btn"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </Button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground font-light whitespace-nowrap hidden sm:inline">Sort by:</span>
              <select
                value={currentSort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="h-10 rounded-btn border border-hairline bg-white dark:bg-[#1D1D1E] px-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-none text-ink dark:text-white"
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
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-light text-muted-foreground">Active filters:</span>
            {currentCategory && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3 rounded-full bg-white dark:bg-[#1D1D1E] border border-hairline font-medium">
                Category: {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                <X className="h-3 w-3 cursor-pointer hover:text-brand" onClick={() => updateFilter('category', null)} />
              </Badge>
            )}
            {currentLevel && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3 rounded-full bg-white dark:bg-[#1D1D1E] border border-hairline capitalize font-medium">
                Level: {currentLevel.replace('_', ' ')}
                <X className="h-3 w-3 cursor-pointer hover:text-brand" onClick={() => updateFilter('level', null)} />
              </Badge>
            )}
            {currentPrice && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3 rounded-full bg-white dark:bg-[#1D1D1E] border border-hairline capitalize font-medium">
                Price: {currentPrice}
                <X className="h-3 w-3 cursor-pointer hover:text-brand" onClick={() => updateFilter('price', null)} />
              </Badge>
            )}
            {currentRating && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3 rounded-full bg-white dark:bg-[#1D1D1E] border border-hairline font-medium">
                Rating: {currentRating}★ & up
                <X className="h-3 w-3 cursor-pointer hover:text-brand" onClick={() => updateFilter('rating', null)} />
              </Badge>
            )}
            {currentQuery && (
              <Badge variant="secondary" className="gap-1.5 text-xs py-1 px-3 rounded-full bg-white dark:bg-[#1D1D1E] border border-hairline font-medium">
                Keyword: &quot;{currentQuery}&quot;
                <X className="h-3 w-3 cursor-pointer hover:text-brand" onClick={() => {
                  setSearchInput('');
                  updateFilter('q', null);
                }} />
              </Badge>
            )}
            <Button
              variant="link"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-brand font-bold"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex items-center gap-2 font-bold text-sm text-ink dark:text-white">
              <Filter className="h-4 w-4" />
              <span>Refine By</span>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-brand hover:text-link-hover hover:underline font-bold"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Categories
            </h4>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => updateFilter('category', null)}
                className={`w-full text-left text-sm py-2 px-3 rounded-btn transition ${
                  !currentCategory
                    ? 'bg-surface font-bold text-brand dark:bg-white/10'
                    : 'text-ink/80 dark:text-white/80 hover:bg-surface font-light'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => updateFilter('category', cat.slug)}
                  className={`w-full text-left text-sm py-2 px-3 rounded-btn transition flex items-center justify-between ${
                    currentCategory === cat.slug
                      ? 'bg-surface font-bold text-brand dark:bg-white/10'
                      : 'text-ink/80 dark:text-white/80 hover:bg-surface font-light'
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
          <div className="space-y-2 pt-2 border-t border-hairline">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
                    className={`w-full text-left text-sm py-2 px-3 rounded-btn capitalize transition ${
                      isSelected
                        ? 'bg-surface font-bold text-brand dark:bg-white/10'
                        : 'text-ink/80 dark:text-white/80 hover:bg-surface font-light'
                    }`}
                  >
                    {p === 'all' ? 'All Prices' : p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Level Filter */}
          <div className="space-y-2 pt-2 border-t border-hairline">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Course Level
            </h4>
            <div className="space-y-1">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl.value}
                  type="button"
                  onClick={() => updateFilter('level', currentLevel === lvl.value ? null : lvl.value)}
                  className={`w-full text-left text-sm py-2 px-3 rounded-btn transition ${
                    currentLevel === lvl.value
                      ? 'bg-surface font-bold text-brand dark:bg-white/10'
                      : 'text-ink/80 dark:text-white/80 hover:bg-surface font-light'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2 pt-2 border-t border-hairline">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Minimum Rating
            </h4>
            <div className="space-y-1">
              {RATINGS.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => updateFilter('rating', currentRating === r.value ? null : r.value)}
                  className={`w-full text-left text-sm py-2 px-3 rounded-btn transition ${
                    currentRating === r.value
                      ? 'bg-surface font-bold text-brand dark:bg-white/10'
                      : 'text-ink/80 dark:text-white/80 hover:bg-surface font-light'
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
                <div key={i} className="animate-pulse space-y-3 rounded-card border border-hairline bg-white p-5">
                  <div className="aspect-video bg-surface rounded-xl" />
                  <div className="h-4 bg-surface rounded w-3/4" />
                  <div className="h-3 bg-surface rounded w-1/2" />
                  <div className="h-5 bg-surface rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8 border-t border-hairline">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => updateFilter('page', (currentPage - 1).toString())}
                    className="h-10 px-4 rounded-btn border-ink text-ink font-bold hover:bg-black/5"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                  </Button>
                  <span className="text-sm font-light text-muted-foreground px-4">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => updateFilter('page', (currentPage + 1).toString())}
                    className="h-10 px-4 rounded-btn border-ink text-ink font-bold hover:bg-black/5"
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 text-center border border-hairline rounded-card bg-white dark:bg-[#1D1D1E] p-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-surface">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-ink dark:text-white">No matching courses found</h3>
              <p className="text-sm font-light text-muted-foreground max-w-md mx-auto">
                We couldn&apos;t find any courses matching your current filters. Try searching with different keywords or clearing applied filters.
              </p>
              <div className="pt-2">
                <Button onClick={clearAllFilters} variant="outline" className="gap-2 h-11 px-5 rounded-btn border-ink font-bold text-ink">
                  <RotateCcw className="h-4 w-4" /> Reset All Filters
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<div className="container py-16 text-center text-muted-foreground font-light">Loading courses...</div>}>
      <CoursesListingContent />
    </Suspense>
  );
}
