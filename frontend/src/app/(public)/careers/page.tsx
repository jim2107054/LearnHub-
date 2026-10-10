import React from 'react';
import Link from 'next/link';
import { Sparkles, Briefcase, Heart, Compass, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const metadata = {
  title: 'Careers at LearnHub — Join Our Global Team',
  description: 'Help us empower millions of learners worldwide. Explore open engineering, product, design, and education roles.',
};

const OPEN_POSITIONS = [
  { title: 'Senior Staff Distributed Systems Engineer', dept: 'Engineering', location: 'Remote (US / Global)', type: 'Full-time' },
  { title: 'Lead Product Designer (Design Systems)', dept: 'Design', location: 'Remote (Global)', type: 'Full-time' },
  { title: 'Machine Learning Infrastructure Engineer', dept: 'AI & Data', location: 'San Francisco, CA / Remote', type: 'Full-time' },
  { title: 'Instructor Success & Curriculum Specialist', dept: 'Education', location: 'Remote (EMEA)', type: 'Full-time' },
  { title: 'Principal Security & Compliance Architect', dept: 'Security', location: 'Remote (Global)', type: 'Full-time' },
];

export default function CareersPage() {
  return (
    <div className="bg-canvas min-h-screen text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5]">
      {/* Hero Banner */}
      <section className="bg-white dark:bg-[#1D1D1E] border-b border-hairline py-16 md:py-24">
        <div className="container max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-1 text-xs font-bold text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Join Our Mission</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink dark:text-white leading-tight">
            Work that changes lives. Starting with yours.
          </h1>

          <p className="text-lg font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            At LearnHub, we believe learning is a superpower. We’re building the infrastructure that connects millions of students with world-class practitioners.
          </p>

          <div className="pt-2">
            <a href="#open-roles">
              <Button size="lg" className="h-12 px-8 rounded-btn bg-ink text-white font-bold hover:bg-ink/90 active:bg-btn-active">
                View open positions
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Why Work at LearnHub */}
      <section className="container py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink dark:text-white">
            Why you’ll love working here
          </h2>
          <p className="text-base font-light text-muted-foreground mt-2">
            A flexible, high-trust culture committed to psychological safety and continuous growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-4">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Compass className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-ink dark:text-white">Remote-First Culture</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Work from wherever you do your best thinking. Flexible hours across global timezones with comprehensive home office allowances.
            </p>
          </div>

          <div className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-4">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Heart className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-ink dark:text-white">Unlimited Learning</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Full complimentary access to every course on LearnHub, plus an annual $2,500 learning stipend for conferences, books, and coaching.
            </p>
          </div>

          <div className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-4">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-ink dark:text-white">Comprehensive Wellbeing</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Top-tier health, dental, and mental wellness coverage, competitive equity grants, and generous parental leave policies.
            </p>
          </div>
        </div>
      </section>

      {/* Open Roles Listing */}
      <section id="open-roles" className="bg-white dark:bg-[#1D1D1E] border-t border-hairline py-16 md:py-24">
        <div className="container max-w-4xl space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-ink dark:text-white">Open Roles</h2>
            <p className="text-sm font-light text-muted-foreground mt-1">
              Find your next career chapter and help build the future of education.
            </p>
          </div>

          <div className="space-y-4">
            {OPEN_POSITIONS.map((pos, idx) => (
              <div
                key={idx}
                className="p-6 rounded-card border border-hairline bg-canvas dark:bg-[#29292A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-ink/30 transition-all"
              >
                <div>
                  <h3 className="font-bold text-base text-ink dark:text-white">{pos.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground">
                    <span>{pos.dept}</span>
                    <span>•</span>
                    <span>{pos.location}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <Badge variant="secondary" className="text-xs">
                    {pos.type}
                  </Badge>
                  <Button size="sm" className="h-9 px-4 rounded-btn bg-ink text-white font-bold hover:bg-ink/90">
                    Apply Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
