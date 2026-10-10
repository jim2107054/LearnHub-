import React from 'react';
import Link from 'next/link';
import { Sparkles, Globe, Users, Award, BookOpen, ArrowRight, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'About LearnHub — We Share Knowledge with the World',
  description: 'Our mission is to improve lives through learning. Learn more about LearnHub’s story, team, and global impact.',
};

export default function AboutPage() {
  return (
    <div className="bg-canvas min-h-screen text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5]">
      {/* Hero Banner */}
      <section className="bg-white dark:bg-[#1D1D1E] border-b border-hairline py-16 md:py-24">
        <div className="container max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-1 text-xs font-bold text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Our Mission</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-ink dark:text-white leading-tight">
            We share knowledge with the world
          </h1>

          <p className="text-lg md:text-xl font-light text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Whether you want to learn or to share what you know, you’ve come to the right place. As a global destination for online learning, we connect people through knowledge.
          </p>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="border-b border-hairline bg-[#1F1F2E] text-white py-12">
        <div className="container grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">73M+</p>
            <p className="text-xs md:text-sm font-light text-white/70 mt-1">Learners worldwide</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">75K+</p>
            <p className="text-xs md:text-sm font-light text-white/70 mt-1">Expert instructors</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">220K+</p>
            <p className="text-xs md:text-sm font-light text-white/70 mt-1">Courses published</p>
          </div>
          <div>
            <p className="text-3xl md:text-4xl font-bold text-white">180+</p>
            <p className="text-xs md:text-sm font-light text-white/70 mt-1">Countries reached</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink dark:text-white">
            Transforming lives through accessible education
          </h2>
          <p className="text-base font-light text-muted-foreground mt-2">
            Every day, our instructors and learners discover new possibilities and achieve extraordinary milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-4">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-ink dark:text-white">Global Reach</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              We empower learners in over 180 countries to gain real-world skills in programming, artificial intelligence, cloud infrastructure, and leadership.
            </p>
          </div>

          <div className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-4">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <HeartHandshake className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-ink dark:text-white">Equal Opportunity</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Education should not be restricted by geography or background. We provide accessible free and affordable courses taught by industry veterans.
            </p>
          </div>

          <div className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-4">
            <div className="h-12 w-12 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-ink dark:text-white">Demonstrable Mastery</h3>
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              Real projects, coding challenges, and verifiable certificates that authenticate your competence to prospective employers and industry peers.
            </p>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="bg-surface dark:bg-[#1D1D1E] border-t border-hairline py-16">
        <div className="container max-w-4xl text-center space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-ink dark:text-white">
            Ready to shape the future of learning?
          </h2>
          <p className="text-base font-light text-muted-foreground max-w-xl mx-auto">
            Discover courses in today’s hottest disciplines, or join our community of world-class instructors.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link href="/courses">
              <Button size="lg" className="h-12 px-6 rounded-btn bg-ink text-white font-bold hover:bg-ink/90 active:bg-btn-active">
                Browse courses
              </Button>
            </Link>
            <Link href="/instructor/onboard">
              <Button size="lg" variant="outline" className="h-12 px-6 rounded-btn border-ink text-ink font-bold hover:bg-black/5">
                Teach on LearnHub
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
