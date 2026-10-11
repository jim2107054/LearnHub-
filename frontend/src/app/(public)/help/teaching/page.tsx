import React from 'react';
import Link from 'next/link';
import { Sparkles, Video, CheckCircle2, BookOpen, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Teaching Center & Course Quality Checklist | LearnHub',
  description: 'Learn how to build, record, and publish best-selling courses with official LearnHub instructor quality guidelines.',
};

export default function TeachingHelpPage() {
  return (
    <div className="bg-canvas min-h-screen text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5] py-16">
      <div className="container max-w-4xl space-y-12">
        <div className="border-b border-hairline pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface px-3.5 py-1 text-xs font-bold text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Teaching Center</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-ink dark:text-white">
            Course Quality Checklist & Standards
          </h1>
          <p className="text-base font-light text-muted-foreground">
            Everything you need to know about creating high-impact video lectures, quizzes, and curriculum structure.
          </p>
        </div>

        {/* Quality Standards Grid */}
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-ink dark:text-white flex items-center gap-2">
              <Video className="h-6 w-6 text-brand" />
              1. Video & Audio Production Standards
            </h2>
            <ul className="space-y-3 text-sm font-light text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>High-Definition Video:</strong> Lectures must be exported in minimum 1080p (1920x1080) resolution with clear 16:9 aspect ratio.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Crisp Audio Quality:</strong> Clear microphone audio through both stereo channels without background hiss, room echo, or heavy distortion.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Good Lighting & Composition:</strong> If presenting on camera, ensure your face is evenly lit and framed at eye level.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-ink dark:text-white flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-brand" />
              2. Curriculum Structure & Hands-On Learning
            </h2>
            <ul className="space-y-3 text-sm font-light text-muted-foreground">
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Bite-Sized Lectures:</strong> Keep individual lectures between 3 to 15 minutes long to maximize student focus and completion rates.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Modular Sections:</strong> Group topics into logical sections that build progressively from fundamentals to advanced projects.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span><strong>Downloadable Assets:</strong> Provide starter code repositories, slide decks, or cheat sheets in your lecture resource payloads.</span>
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-ink dark:text-white flex items-center gap-2">
              <HelpCircle className="h-6 w-6 text-brand" />
              3. Course Review & Publishing Process
            </h2>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Once you submit your course for review in the Instructor Studio, our Quality Review team evaluates your video resolution, audio levels, and syllabus within 48 business hours. You’ll receive actionable feedback or immediate approval for publishing!
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="p-8 rounded-card bg-surface dark:bg-[#1D1D1E] border border-hairline flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-lg text-ink dark:text-white">Ready to create your course?</h3>
            <p className="text-xs font-light text-muted-foreground mt-1">Jump directly into the instructor dashboard to plan your modules.</p>
          </div>
          <Link href="/instructor/onboard">
            <Button size="lg" className="h-12 px-6 rounded-btn bg-ink text-white font-bold hover:bg-ink/90 active:bg-btn-active">
              Start Teaching Today →
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
