'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Copy,
  Check,
  DollarSign,
  TrendingUp,
  Users,
  Share2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function AffiliateDashboardPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'jordan-affiliate-2026';
  const referralUrl = `https://learnhub.example.com/?ref=${referralCode}`;

  const stats = {
    totalClicks: 1420,
    newSignups: 168,
    courseSales: 42,
    conversionRate: '25.0%',
    totalCommission: 84000, // $840.00
    pendingPayout: 32000, // $320.00
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    toast.success('Affiliate link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight">Affiliate Partner Program</h1>
          <Badge className="bg-emerald-600 text-white font-bold text-xs">Active Partner</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Share LearnHub courses with your audience and earn 20% commission on every new student purchase
        </p>
      </div>

      {/* Referral Link Generator Box */}
      <Card className="border-primary/40 bg-primary/5 shadow-md">
        <CardContent className="p-6 space-y-3">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Your Unique Referral Link
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Include this link in your blog posts, YouTube descriptions, or social channels. Cookies track conversions for 30 days.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <Input
              value={referralUrl}
              readOnly
              className="font-mono text-xs h-11 bg-background select-all"
            />
            <Button onClick={handleCopy} className="gap-1.5 h-11 font-bold text-xs flex-shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Commission Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Total Commission</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatPrice(stats.totalCommission, 'USD')}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Pending Payout</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatPrice(stats.pendingPayout, 'USD')}
            </h3>
            <p className="text-[11px] text-muted-foreground">Releases next cycle (1st)</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Referral Clicks</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {stats.totalClicks.toLocaleString()}
            </h3>
            <p className="text-[11px] text-muted-foreground">{stats.newSignups} signups registered</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Course Purchases</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {stats.courseSales}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">{stats.conversionRate} conversion</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
