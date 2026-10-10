import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | LearnHub',
  description: 'Understand how LearnHub collects, protects, and manages your personal information and student learning records.',
};

export default function PrivacyPage() {
  return (
    <div className="bg-canvas min-h-screen text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5] py-16">
      <div className="container max-w-4xl space-y-8">
        <div className="border-b border-hairline pb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink dark:text-white">
            Privacy Policy
          </h1>
          <p className="text-sm font-light text-muted-foreground mt-2">
            Last Updated: October 2026
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-sm font-light leading-relaxed space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us when creating an account, enrolling in courses, submitting assignments, or contacting customer support. This includes your name, email address, country locale, payment transaction details, and course progress tracking.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">2. How We Use Your Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your personal information is used to provide high-quality video streaming, manage certificates of completion, track lecture progress, deliver personalized course recommendations, and prevent fraudulent payment activity.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">3. Data Sharing & Third Parties</h2>
            <p className="text-muted-foreground leading-relaxed">
              LearnHub does not sell your personal data to data brokers. We share information only with authorized infrastructure processors necessary to operate our platform, such as payment gateways (Stripe), cloud hosting (AWS), and customer support platforms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-ink dark:text-white">4. Your Privacy Rights (GDPR & CCPA)</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on your location, you have the right to request access to the personal data we hold about you, request corrections, export your data in machine-readable JSON format, or request complete account erasure. You can exercise these rights through your profile settings or by contacting privacy@learnhub.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
