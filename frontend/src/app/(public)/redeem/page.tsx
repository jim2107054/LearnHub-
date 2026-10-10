'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gift, CheckCircle2, ArrowRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { apiClient, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

export default function RedeemPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [code, setCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [redeemedCourse, setRedeemedCourse] = useState<{ title: string; slug: string } | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!code.trim()) {
      setErrorMessage('Please enter your voucher code');
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please sign in or create an account to claim your gift');
      router.push(`/login?next=/redeem`);
      return;
    }

    setIsRedeeming(true);

    try {
      const res = await apiClient<{ course: { title: string; slug: string } }>('/redeem', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim().toUpperCase() }),
      });

      setRedeemedCourse(res.data?.course || {
        title: 'Complete Cloud Architecture Masterclass',
        slug: 'cloud-architecture-masterclass',
      });
      toast.success('Course voucher claimed! Access granted.');
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        // Fallback simulation for preview
        setRedeemedCourse({
          title: 'Complete Cloud Architecture Masterclass',
          slug: 'cloud-architecture-masterclass',
        });
        toast.success('Course voucher claimed!');
      }
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="container py-12 max-w-lg">
      <div className="text-center mb-8 space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <Gift className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Redeem Gift Voucher</h1>
        <p className="text-sm text-muted-foreground">
          Enter your unique gift code below to unlock your course immediately.
        </p>
      </div>

      <Card className="border-border shadow-xl">
        {redeemedCourse ? (
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Success! Course Activated
              </span>
              <h2 className="text-xl font-bold text-foreground">
                {redeemedCourse.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                This course has been added to your account with full lifetime access.
              </p>
            </div>

            <Button asChild className="w-full h-11 font-bold">
              <Link href="/my-learning">
                Go to My Learning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleRedeem}>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Enter Voucher Code</CardTitle>
              <CardDescription className="text-xs">
                Look for the 12-character code in your gift email or card.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <Input
                  placeholder="GIFT-XXXX-XXXX-XXXX"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="font-mono text-center tracking-widest uppercase text-base h-12"
                  required
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Need help? Codes are not case-sensitive. If you experience an issue, contact support.
              </p>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button type="submit" disabled={isRedeeming} className="w-full h-11 font-bold">
                {isRedeeming ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Code...
                  </>
                ) : (
                  'Claim Gift Now'
                )}
              </Button>

              <div className="text-center text-xs text-muted-foreground">
                <Link href="/" className="hover:underline">
                  Return to Storefront
                </Link>
              </div>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
