'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ShieldAlert, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (requiresMfa) {
        // Submit TOTP MFA challenge
        await apiClient('/auth/mfa/confirm', {
          method: 'POST',
          body: JSON.stringify({ code: mfaCode }),
        });
      } else {
        const res = await apiClient<{ token?: string; mfa_required?: boolean }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password, device_name: 'Web Browser' }),
        });

        if (res.data?.mfa_required) {
          setRequiresMfa(true);
          setIsLoading(false);
          return;
        }
      }

      await refreshUser();
      router.push(nextUrl);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'account_locked') {
          setErrorMessage('Account locked due to 5 consecutive failed attempts. Please wait 15 minutes.');
        } else {
          setErrorMessage(err.message);
        }
      } else {
        setErrorMessage('An unexpected error occurred. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl border-border/60">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">
            {requiresMfa ? 'Two-Factor Authentication' : 'Welcome back'}
          </CardTitle>
          <CardDescription>
            {requiresMfa
              ? 'Enter the 6-digit verification code from your authenticator app'
              : 'Sign in to your LearnHub account to continue learning'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive border border-destructive/20">
                <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!requiresMfa ? (
              <>
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

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium" htmlFor="password">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="mfaCode">
                  6-Digit Authenticator Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mfaCode"
                    type="text"
                    placeholder="123456"
                    className="pl-9 text-center text-lg tracking-widest font-mono"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : requiresMfa ? 'Verify & Continue' : 'Sign in'}
            </Button>

            {!requiresMfa && (
              <p className="text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-semibold text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
