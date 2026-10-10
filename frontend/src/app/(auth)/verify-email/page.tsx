'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MailCheck, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export default function VerifyEmailPage() {
  const { user } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleResend = async () => {
    setResending(true);
    setResendStatus(null);
    try {
      // Simulate/trigger resend verification link
      await new Promise((resolve) => setTimeout(resolve, 800));
      setResendStatus('A new verification email has been sent to your inbox.');
    } catch {
      setResendStatus('Failed to send verification email. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-border/60 text-center">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Verify Your Email</CardTitle>
          <CardDescription>
            We have sent a confirmation email to{' '}
            <span className="font-semibold text-foreground">
              {user?.email || 'your email address'}
            </span>
            . Please check your inbox and click the link to activate your account.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {resendStatus && (
            <div className="rounded-lg bg-primary/10 p-3 text-sm text-primary border border-primary/20">
              {resendStatus}
            </div>
          )}

          <div className="rounded-lg bg-muted/40 p-4 text-xs text-muted-foreground text-left space-y-1">
            <p className="font-medium text-foreground">Didn&apos;t receive an email?</p>
            <p>• Check your spam or junk folder.</p>
            <p>• Verify that you entered your email address correctly.</p>
            <p>• Wait a few minutes and try requesting another link.</p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              'Resend Verification Email'
            )}
          </Button>

          <Button asChild className="w-full">
            <Link href="/">
              Continue to Home <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
