'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  Sparkles,
  ShieldCheck,
  Building2,
  Users,
  Award,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function SubscriptionPricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const plans = [
    {
      id: 'individual',
      name: 'Personal Pro',
      tagline: 'For individuals committed to rapid career advancement and continuous learning.',
      monthlyPrice: 29,
      annualPrice: 24, // $24/mo billed annually
      badge: 'Popular for Learners',
      features: [
        'Unlimited access to 2,500+ top-rated courses',
        'Verifiable certificates of completion',
        'Interactive coding quizzes and assessments',
        'Mobile and offline video download access',
        'Community Q&A and direct instructor access',
      ],
      ctaText: 'Start 7-Day Free Trial',
      highlight: false,
    },
    {
      id: 'team',
      name: 'Team Business',
      tagline: 'For fast-moving tech teams upskilling in cloud, DevOps, and modern architecture.',
      monthlyPrice: 199, // 10 seats
      annualPrice: 159,
      badge: 'Most Popular',
      features: [
        'Includes 10 team seats (scalable on demand)',
        'Unlimited access to entire course catalog',
        'Team progress analytics & completion reports',
        'Assigned learning paths with deadlines',
        'Centralized invoicing and seat re-allocation',
        'Priority technical support',
      ],
      ctaText: 'Upgrade Team Plan',
      highlight: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise Custom',
      tagline: 'For large organizations requiring bespoke security, SAML SSO, and LMS integration.',
      monthlyPrice: null,
      annualPrice: null,
      badge: 'Custom Deployment',
      features: [
        'Unlimited seats for the entire organization',
        'SAML 2.0 / Okta / Azure AD Single Sign-On (SSO)',
        'Custom private course authoring & hosting',
        'Dedicated Customer Success Architect',
        'SOC2 Type II & GDPR compliance package',
        'Custom LMS / SCORM API integration',
      ],
      ctaText: 'Contact Enterprise Sales',
      highlight: false,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16 max-w-6xl space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold px-3 py-1">
          Simple, Predictable Subscription Pricing
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Invest in Knowledge That Pays Lifelong Dividends
        </h1>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
          Choose a flexible subscription plan to unlock unlimited access to world-class software engineering courses.
        </p>

        {/* Monthly vs Annual Toggle */}
        <div className="inline-flex items-center gap-3 p-1.5 rounded-full border bg-muted/30 text-xs font-semibold mt-4">
          <button
            type="button"
            onClick={() => setBillingCycle('monthly')}
            className={`px-4 py-2 rounded-full transition ${
              billingCycle === 'monthly'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Monthly Billing
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('annual')}
            className={`px-4 py-2 rounded-full transition flex items-center gap-1.5 ${
              billingCycle === 'annual'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Annual Billing</span>
            <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {plans.map((plan) => {
          const price = billingCycle === 'annual' ? plan.annualPrice : plan.monthlyPrice;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col justify-between rounded-2xl border transition hover:shadow-xl relative overflow-hidden ${
                plan.highlight
                  ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                  : 'border-border/80'
              }`}
            >
              {plan.highlight && (
                <div className="bg-primary text-primary-foreground py-1 text-center text-xs font-bold uppercase tracking-wider">
                  {plan.badge}
                </div>
              )}

              <CardHeader className="space-y-2 p-6">
                {!plan.highlight && (
                  <Badge variant="secondary" className="w-fit text-[10px]">
                    {plan.badge}
                  </Badge>
                )}
                <CardTitle className="text-xl font-extrabold">{plan.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed">
                  {plan.tagline}
                </CardDescription>

                <div className="pt-4 pb-2">
                  {price !== null ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-foreground">${price}</span>
                      <span className="text-xs text-muted-foreground">/ month</span>
                    </div>
                  ) : (
                    <div className="text-3xl font-extrabold text-foreground py-1">Custom</div>
                  )}
                  {price !== null && (
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-0 space-y-4 flex-1">
                <div className="space-y-2.5 text-xs text-muted-foreground border-t pt-4">
                  <span className="text-foreground font-semibold text-xs block">Included with plan:</span>
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  onClick={() => toast.success(`Redirecting to secure subscription checkout for ${plan.name}`)}
                  variant={plan.highlight ? 'default' : 'outline'}
                  className="w-full h-11 font-bold text-xs shadow-md"
                >
                  {plan.ctaText}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Trust & Guarantee Callout */}
      <div className="rounded-2xl border bg-muted/20 p-8 text-center max-w-3xl mx-auto space-y-3">
        <ShieldCheck className="h-8 w-8 text-emerald-500 mx-auto" />
        <h3 className="font-bold text-base">30-Day Money-Back Guarantee</h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xl mx-auto">
          If LearnHub does not meet your expectations within the first 30 days of subscription, contact our support team for a full refund. No questions asked.
        </p>
      </div>
    </div>
  );
}
