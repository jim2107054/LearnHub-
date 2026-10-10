'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Video,
  Award,
  Users,
  DollarSign,
  Globe,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Play,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth-context';

export default function InstructorOnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    topic: '',
    experienceLevel: 'intermediate',
    hasAudience: 'exploring',
    videoExperience: 'some',
    headline: '',
    bio: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Simulate onboarding save
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Welcome to the LearnHub Instructor Community!');
      router.push('/instructor/courses');
    } catch {
      toast.error('Could not complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-canvas min-h-screen text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5]">
      {/* Hero Banner - Udemy Style */}
      <section className="bg-white dark:bg-[#1D1D1E] border-b border-hairline py-16 md:py-24">
        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1 text-xs font-bold text-brand">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Teach on LearnHub</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink dark:text-white leading-tight">
              Come teach with us
            </h1>

            <p className="text-lg font-light text-muted-foreground leading-relaxed max-w-xl">
              Become an instructor and change lives — including your own. Share your knowledge with over 100,000 learners across the globe and earn sustainable income.
            </p>

            <div className="pt-2">
              <a href="#onboard-form">
                <Button size="lg" className="h-12 px-8 rounded-btn bg-ink text-white font-bold hover:bg-ink/90 active:bg-btn-active">
                  Get started
                </Button>
              </a>
            </div>
          </div>

          <div className="relative aspect-video rounded-card overflow-hidden border border-hairline bg-surface shadow-udemy-md">
            <img
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&auto=format&fit=crop&q=80"
              alt="Instructor teaching online"
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-6">
              <div className="text-white">
                <p className="font-bold text-base">Sarah Jenkins</p>
                <p className="text-xs text-white/80 font-light">Earned $120,000+ teaching Full-Stack Architecture</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Counter Band */}
      <section className="border-b border-hairline bg-[#1F1F2E] text-white py-12">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">73M+</p>
            <p className="text-xs md:text-sm font-light text-white/70 mt-1">Students worldwide</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">75+</p>
            <p className="text-xs md:text-sm font-light text-white/70 mt-1">Languages taught</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">1B+</p>
            <p className="text-xs md:text-sm font-light text-white/70 mt-1">Course enrollments</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">16,000+</p>
            <p className="text-xs md:text-sm font-light text-white/70 mt-1">Enterprise enterprise customers</p>
          </div>
        </div>
      </section>

      {/* 3 Reasons to Start */}
      <section className="container py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink dark:text-white">
            So many reasons to start
          </h2>
          <p className="text-base font-light text-muted-foreground mt-2">
            Publish the course you want, in the way you want, and always have control of your own content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-4">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-ink dark:text-white">Teach your way</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Publish the course you want, in the way you want, and always have control of your own content and intellectual property.
            </p>
          </div>

          <div className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-4">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-ink dark:text-white">Inspire learners</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Teach what you know and help learners explore their interests, gain new professional skills, and advance their careers.
            </p>
          </div>

          <div className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-4">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-ink dark:text-white">Get rewarded</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Expand your professional network, build your expertise, and earn recurring revenue on each paid student enrollment.
            </p>
          </div>
        </div>
      </section>

      {/* How to Begin: 3 Steps */}
      <section className="bg-white dark:bg-[#1D1D1E] border-y border-hairline py-16 md:py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-ink dark:text-white">
              How to begin
            </h2>
            <p className="text-base font-light text-muted-foreground mt-2">
              Step-by-step guidance from outline to video publishing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 border-l-2 border-brand pl-6">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Step 1</span>
              <h4 className="text-lg font-bold text-ink dark:text-white">Plan your curriculum</h4>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                You start with your passion and knowledge. Then choose a promising topic with our Marketplace Insights tool.
              </p>
            </div>

            <div className="space-y-3 border-l-2 border-brand pl-6">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Step 2</span>
              <h4 className="text-lg font-bold text-ink dark:text-white">Record your video</h4>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                Use basic equipment like a smartphone or DSLR. Add a good microphone and you’re ready to capture your first lecture.
              </p>
            </div>

            <div className="space-y-3 border-l-2 border-brand pl-6">
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Step 3</span>
              <h4 className="text-lg font-bold text-ink dark:text-white">Launch your course</h4>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                Gather your first ratings and reviews by promoting your course through social media and your professional network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Onboarding Wizard Form */}
      <section id="onboard-form" className="container py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          <Card className="rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] p-8 md:p-10 shadow-none">
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-bold text-ink dark:text-white">Apply to Teach on LearnHub</h2>
              <p className="text-sm font-light text-muted-foreground">
                Tell us a little bit about your background and what you plan to teach.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-ink dark:text-white">
                  What subject or topic do you want to teach?
                </label>
                <Input
                  required
                  placeholder="e.g. Next.js 15, Python for Data Science, Figma Design"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="h-12 rounded-btn bg-surface border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink dark:text-white">
                  What is your teaching experience level?
                </label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  className="w-full h-12 rounded-btn bg-surface border border-hairline px-4 text-sm font-light text-ink dark:text-white"
                >
                  <option value="beginner">I am new to teaching online</option>
                  <option value="intermediate">I have taught in person or made some tutorials</option>
                  <option value="advanced">I am an experienced online instructor</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink dark:text-white">
                  Do you have an existing student audience or follower base?
                </label>
                <select
                  value={formData.hasAudience}
                  onChange={(e) => setFormData({ ...formData, hasAudience: e.target.value })}
                  className="w-full h-12 rounded-btn bg-surface border border-hairline px-4 text-sm font-light text-ink dark:text-white"
                >
                  <option value="exploring">Not yet, starting from scratch</option>
                  <option value="small">Small audience (100 - 1,000 followers)</option>
                  <option value="large">Substantial audience (1,000+ followers)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-ink dark:text-white">
                  Professional Headline
                </label>
                <Input
                  placeholder="e.g. Senior Software Architect | Ex-Staff Engineer"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="h-12 rounded-btn bg-surface border-transparent"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-btn bg-ink text-white font-bold hover:bg-ink/90 active:bg-btn-active"
                >
                  {isSubmitting ? 'Submitting Application...' : 'Continue to Instructor Studio →'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </section>
    </div>
  );
}
