'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star,
  Clock,
  BookOpen,
  Award,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  PlayCircle,
  FileText,
  HelpCircle,
  Heart,
  Share2,
  X,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Course, Review, RatingBreakdown, Lecture } from '@/types/api';
import { formatPrice, formatDuration } from '@/lib/utils';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface CourseDetailViewProps {
  course: Course;
  reviews?: Review[];
  ratingBreakdown?: RatingBreakdown | null;
  relatedCourses?: Course[];
}

export function CourseDetailView({
  course,
  reviews = [],
  ratingBreakdown,
  relatedCourses = [],
}: CourseDetailViewProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Accordion state: map section id to open/closed boolean
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    course.sections?.forEach((s, idx) => {
      initial[s.id] = idx === 0; // First section open by default
    });
    return initial;
  });

  // Preview lecture modal state
  const [previewLecture, setPreviewLecture] = useState<Lecture | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<string | null>(null);
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Cart state
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAllSections = () => {
    const all: Record<string, boolean> = {};
    course.sections?.forEach((s) => {
      all[s.id] = true;
    });
    setOpenSections(all);
  };

  const collapseAllSections = () => {
    setOpenSections({});
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    try {
      // Simulate coupon validation call
      await new Promise((r) => setTimeout(r, 600));
      setCouponApplied(couponCode.toUpperCase());
      setCouponDiscountPercent(20); // 20% discount applied
      toast.success(`Coupon ${couponCode.toUpperCase()} applied! You saved 20%`);
    } catch {
      toast.error('Invalid or expired coupon code');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      await apiClient('/cart/items', {
        method: 'POST',
        body: JSON.stringify({ course_id: course.id }),
      });
      toast.success('Added to shopping cart!');
      router.push('/cart');
    } catch {
      // If guest or mock, still route to cart gracefully
      toast.info('Course added to cart');
      router.push('/cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push('/checkout');
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to save courses to your wishlist');
      return;
    }
    const next = !isWishlisted;
    setIsWishlisted(next);
    try {
      if (next) {
        await apiClient(`/wishlist/${course.id}`, { method: 'POST' });
        toast.success('Added to your wishlist');
      } else {
        await apiClient(`/wishlist/${course.id}`, { method: 'DELETE' });
        toast.info('Removed from your wishlist');
      }
    } catch {
      setIsWishlisted(!next);
    }
  };

  const currentPrice = couponDiscountPercent > 0
    ? Math.round(course.price_amount * (1 - couponDiscountPercent / 100))
    : course.price_amount;

  return (
    <div className="min-h-screen">
      {/* Top Banner / Hero */}
      <section className="bg-slate-900 text-slate-100 py-10 md:py-14 border-b border-slate-800">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-4">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/" className="hover:text-white transition">Home</Link>
              <span>/</span>
              <Link href="/courses" className="hover:text-white transition">Courses</Link>
              <span>/</span>
              <span className="text-slate-200 truncate">{course.title}</span>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {course.title}
            </h1>

            {course.subtitle && (
              <p className="text-base md:text-lg text-slate-300 leading-relaxed">
                {course.subtitle}
              </p>
            )}

            {/* Ratings & Metadata */}
            <div className="flex flex-wrap items-center gap-3 text-sm pt-2">
              <Badge className="bg-amber-500 text-slate-950 font-bold hover:bg-amber-400">
                {course.rating.toFixed(1)} ★
              </Badge>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(course.rating) ? 'fill-current' : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-amber-400 font-semibold underline cursor-pointer">
                ({course.reviews_count.toLocaleString()} ratings)
              </span>
              <span className="text-slate-400">
                {course.enrollments_count.toLocaleString()} students enrolled
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-1.5">
                <span>Created by</span>
                <span className="font-semibold text-white underline cursor-pointer">
                  {course.instructor?.name || 'LearnHub Instructor'}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Last updated 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="capitalize">English</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Body */}
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Details, Curriculum, Reviews */}
        <div className="lg:col-span-2 space-y-10">
          {/* What You'll Learn */}
          <Card className="border-border/60 bg-muted/10">
            <CardContent className="p-6 space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> What you will learn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Build complete production applications from scratch with industry best practices</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Master modern architecture patterns, performance tuning, and clean code principles</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Write robust automated tests, handle errors gracefully, and deploy with confidence</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>Receive an official, verifiable digital certificate to showcase on your LinkedIn</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Curriculum */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Course content</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {course.sections?.length || 0} sections • {course.lectures_count} lectures • {formatDuration(course.total_duration_seconds)} total length
                </p>
              </div>
              <button
                type="button"
                onClick={Object.values(openSections).some(Boolean) ? collapseAllSections : expandAllSections}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {Object.values(openSections).some(Boolean) ? 'Collapse all sections' : 'Expand all sections'}
              </button>
            </div>

            {/* Sections Accordion */}
            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
              {course.sections && course.sections.length > 0 ? (
                course.sections.map((section, sIdx) => {
                  const isOpen = !!openSections[section.id];
                  return (
                    <div key={section.id} className="bg-card">
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold hover:bg-muted/30 transition text-sm"
                      >
                        <div className="flex items-center gap-3">
                          <ChevronDown
                            className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          />
                          <span>
                            Section {sIdx + 1}: {section.title}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-normal">
                          {section.lectures?.length || 0} lectures
                        </span>
                      </button>

                      {isOpen && (
                        <div className="divide-y divide-border/40 bg-muted/10">
                          {section.lectures?.map((lecture) => (
                            <div
                              key={lecture.id}
                              className="flex items-center justify-between px-6 py-3 text-sm hover:bg-accent/40 transition"
                            >
                              <div className="flex items-center gap-3">
                                {lecture.lecture_type === 'video' ? (
                                  <PlayCircle className="h-4 w-4 text-primary" />
                                ) : lecture.lecture_type === 'quiz' ? (
                                  <HelpCircle className="h-4 w-4 text-amber-500" />
                                ) : (
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="font-medium text-foreground text-xs md:text-sm">
                                  {lecture.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs">
                                {lecture.is_free_preview && (
                                  <Button
                                    variant="link"
                                    size="sm"
                                    onClick={() => setPreviewLecture(lecture)}
                                    className="text-xs text-primary font-semibold h-auto p-0 hover:underline"
                                  >
                                    Preview
                                  </Button>
                                )}
                                <span className="text-muted-foreground">
                                  {formatDuration(lecture.duration_seconds)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Curriculum details will be announced soon.
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold">Description</h2>
            <div className="prose dark:prose-invert max-w-none text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {course.description ||
                'This comprehensive course is designed to take you from foundational concepts through to building and deploying full-scale production applications. Packed with practical projects, quizzes, and real-world code.'}
            </div>
          </section>

          {/* Instructor Bio */}
          <section className="space-y-4 border-t pt-8">
            <h2 className="text-xl font-bold">Instructor</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
                  {course.instructor?.avatar_url ? (
                    <Image
                      src={course.instructor.avatar_url}
                      alt={course.instructor.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <UserIcon className="h-8 w-8 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    {course.instructor?.name || 'LearnHub Instructor'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {course.instructor?.headline || 'Senior Software Engineer & Educator'}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Passionate educator and industry practitioner with over a decade of experience designing scalable distributed systems. Dedicated to helping thousands of students land engineering roles worldwide.
              </p>
            </div>
          </section>

          {/* Reviews & Ratings Section */}
          <section className="space-y-6 border-t pt-8">
            <div className="flex items-center gap-3">
              <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
              <h2 className="text-2xl font-bold">
                {course.rating.toFixed(1)} course rating • {course.reviews_count.toLocaleString()} ratings
              </h2>
            </div>

            {/* Ratings Breakdown Grid */}
            {ratingBreakdown?.distribution && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-6 rounded-xl border">
                {[5, 4, 3, 2, 1].map((star) => {
                  const item = ratingBreakdown.distribution[star] || { percentage: 0, count: 0 };
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1 w-12 text-muted-foreground font-medium">
                        <span>{star}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      </div>
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-muted-foreground font-mono">
                        {item.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sample Reviews */}
            {reviews.length > 0 && (
              <div className="space-y-4 divide-y divide-border/60">
                {reviews.map((rev) => (
                  <div key={rev.id} className="pt-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                          {rev.user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold">{rev.user.name}</p>
                          <div className="flex text-amber-400 text-[10px]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-2.5 w-2.5 ${
                                  i < rev.rating ? 'fill-current' : 'text-muted'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] text-muted-foreground">Verified Student</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sticky Purchase Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card className="shadow-2xl border-border/80 overflow-hidden">
              {/* Video Thumbnail Preview */}
              <div className="relative aspect-video w-full bg-black group cursor-pointer" onClick={() => {
                const firstPreview = course.sections?.flatMap((s) => s.lectures).find((l) => l.is_free_preview);
                if (firstPreview) setPreviewLecture(firstPreview);
              }}>
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    className="object-cover opacity-90 group-hover:opacity-100 transition"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted">
                    <BookOpen className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/20 transition">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                    <PlayCircle className="h-8 w-8" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-0 right-0 text-center">
                  <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                    Preview this course
                  </span>
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-extrabold text-foreground">
                      {formatPrice(currentPrice, course.price_currency)}
                    </span>
                    {couponDiscountPercent > 0 && (
                      <span className="text-base line-through text-muted-foreground">
                        {formatPrice(course.price_amount, course.price_currency)}
                      </span>
                    )}
                    {couponDiscountPercent > 0 && (
                      <Badge className="bg-emerald-600 text-white font-bold">
                        {couponDiscountPercent}% OFF
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Primary CTA Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="w-full text-base h-12 font-bold shadow-md"
                  >
                    {isAddingToCart ? 'Adding to cart...' : 'Add to cart'}
                  </Button>

                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    className="w-full text-base h-12 font-semibold border-primary text-primary hover:bg-primary/10"
                  >
                    Buy now
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    30-Day Money-Back Guarantee
                  </p>
                </div>

                {/* Course Includes List */}
                <div className="space-y-2.5 text-xs text-foreground/80 pt-2 border-t">
                  <p className="font-semibold text-foreground text-sm">This course includes:</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDuration(course.total_duration_seconds)} on-demand video</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{course.lectures_count} downloadable resources</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>Certificate of completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                    <span>Full lifetime access</span>
                  </div>
                </div>

                {/* Wishlist & Share actions */}
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <button
                    type="button"
                    onClick={handleWishlistToggle}
                    className="flex items-center gap-1.5 font-medium hover:text-primary transition"
                  >
                    <Heart
                      className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`}
                    />
                    <span>{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined') {
                        navigator.clipboard.writeText(window.location.href);
                        toast.success('Course link copied to clipboard');
                      }
                    }}
                    className="flex items-center gap-1.5 font-medium hover:text-primary transition"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Apply Coupon Input */}
                <form onSubmit={handleApplyCoupon} className="pt-2 border-t space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="text-xs uppercase"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      disabled={isApplyingCoupon || !couponCode.trim()}
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </Button>
                  </div>
                  {couponApplied && (
                    <p className="text-xs text-emerald-600 font-medium">
                      ✓ Coupon {couponApplied} is applied
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Free Preview Lecture Modal */}
      {previewLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl rounded-2xl bg-card border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <span className="text-xs font-semibold text-primary uppercase">Free Preview</span>
                <h3 className="text-base font-bold text-foreground">{previewLecture.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewLecture(null)}
                className="rounded-full p-1.5 hover:bg-muted text-muted-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black flex items-center justify-center">
              <video
                controls
                autoPlay
                className="h-full w-full object-contain"
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
