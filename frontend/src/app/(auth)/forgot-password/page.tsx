'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient, ApiError } from '@/lib/api-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await apiClient('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setIsSuccess(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to send reset email. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-border/60">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Reset password</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you instructions to reset your password
          </CardDescription>
        </CardHeader>

        {isSuccess ? (
          <CardContent className="space-y-4 text-center py-6">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold">Check your inbox</h3>
            <p className="text-sm text-muted-foreground">
              If an account exists with <span className="font-medium text-foreground">{email}</span>, you will receive a password reset link shortly.
            </p>
            <div className="pt-4">
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Back to Sign in
                </Button>
              </Link>
            </div>
          </CardContent>
        ) : (
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="alex@example.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending instructions...' : 'Send Reset Link'}
              </Button>
              <Link href="/login" className="text-center text-xs text-primary hover:underline">
                Return to Sign in
              </Link>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}
