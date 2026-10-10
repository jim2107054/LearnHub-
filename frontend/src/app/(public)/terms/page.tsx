import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | LearnHub',
  description: 'These Terms of Use govern your access to and use of the LearnHub platform, courses, and related services.',
};

export default function TermsPage() {
  return (
    <div className="bg-canvas min-h-screen text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5] py-16">
      <div className="container max-w-4xl space-y-8">
        <div className="border-b border-hairline pb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink dark:text-white">
            Terms of Use
          </h1>
          <p className="text-sm font-light text-muted-foreground mt-2">
            Last Updated: October 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm font-light leading-relaxed space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">1. Introduction & Acceptance</h2>
            <p className="text-muted-foreground leading-relaxed">
              Welcome to LearnHub. These Terms of Use (&quot;Terms&quot;) govern your use of the website, mobile applications, APIs, and online learning platform operated by LearnHub, Inc. (&quot;LearnHub&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). By creating an account, enrolling in a course, or accessing any service, you agree to comply with and be legally bound by these Terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">2. Accounts & Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              You must provide accurate, current, and complete information when registering an account. You are solely responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your account. You agree to notify us immediately of any unauthorized access or security breach.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">3. Course Enrollment & Lifetime Access</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you enroll in a course on LearnHub, whether paid or free, you receive a revocable, non-exclusive, non-transferable personal license to view the course content and video lectures. Lifetime access entitles you to continued on-demand streaming of the course materials as long as the content is hosted on the platform in compliance with legal and copyright requirements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">4. 30-Day Refund Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed">
              If a course you purchased does not meet your expectations, you may request a refund within 30 days of purchase, provided that you have not consumed an excessive portion of the curriculum or requested multiple serial refunds. Approved refunds are credited back to the original payment method.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">5. Instructor Content & Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              Instructors retain full intellectual property ownership of the instructional materials they submit. Instructors grant LearnHub a global license to host, transcode, stream, market, and distribute their content to registered learners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">6. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed">
              You may not scrape, pirate, redistribute, download, or re-upload course videos to external networks or torrent trackers. Violations result in immediate account termination, credential revocation, and forfeiture of all enrollments without refund.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
