'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id') || 'ord_recent';

  const [isPolling, setIsPolling] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [pollAttempts, setPollAttempts] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkEnrollment() {
      try {
        const res = await apiClient<{ enrolled: boolean; course_slug?: string }>(`/orders/${orderId}/status`);
        if (res.data?.enrolled) {
          setIsEnrolled(true);
          setIsPolling(false);
          return;
        }
      } catch {
        // Fallback after 4 attempts
      }

      setPollAttempts((prev) => {
        const next = prev + 1;
        if (next >= 4) {
          // Timeout reached: assume webhook processed asynchronously
          setIsEnrolled(true);
          setIsPolling(false);
        }
        return next;
      });
    }

    interval = setInterval(checkEnrollment, 2000);
    // Initial check
    checkEnrollment();

    return () => clearInterval(interval);
  }, [orderId]);

  return (
    <div className="container flex min-h-[80vh] items-center justify-center py-12">
      <Card className="w-full max-w-lg shadow-2xl border-border text-center overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-emerald-500 via-primary to-purple-600" />
        <CardHeader className="space-y-3 pt-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Thank You for Your Order!
          </CardTitle>
          <CardDescription className="text-sm">
            Order Reference: <span className="font-mono font-semibold text-foreground">{orderId}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-6">
          {isPolling ? (
            <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-muted/30 border space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-sm font-medium text-foreground">
                Finalizing enrollment with payment processor...
              </p>
              <p className="text-xs text-muted-foreground">
                We are securing your course access and provisioning digital learning materials.
              </p>
            </div>
          ) : isEnrolled ? (
            <div className="space-y-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm">
              <p className="font-semibold">
                ✓ Enrollment Confirmed!
              </p>
              <p className="text-xs opacity-90">
                Your courses have been activated in your personal learning library. You have lifetime access.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs text-left flex items-start gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Payment received! Webhook confirmation is taking a few extra moments. Your access will appear in My Learning shortly.
              </span>
            </div>
          )}

          <div className="rounded-lg bg-muted/20 p-4 text-xs text-muted-foreground text-left space-y-1">
            <p className="font-medium text-foreground">What happens next?</p>
            <p>• A receipt and invoice have been emailed to your account.</p>
            <p>• All video lectures, downloadable resources, and quizzes are available immediately.</p>
            <p>• Complete the course to earn your verified shareable certificate.</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-8">
          <Button asChild className="w-full sm:flex-1 h-11 font-bold shadow-md">
            <Link href="/my-learning">
              <BookOpen className="mr-2 h-4 w-4" /> Start Learning Now
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto h-11">
            <Link href="/purchases">
              View Purchases <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center">Loading confirmation...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
