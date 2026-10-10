import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  ShieldAlert,
  Award,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface VerificationResult {
  code: string;
  recipient_name: string;
  course_title: string;
  instructor_name: string;
  issued_at: string;
  status: 'valid' | 'revoked' | 'expired';
}

async function verifyCertificate(code: string): Promise<VerificationResult | null> {
  try {
    const res = await fetch(`${API_BASE}/certificates/verify/${code}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data;
    if (!data) return null;
    return {
      code: data.certificate_code || data.code || code,
      recipient_name: data.student_name || data.recipient_name || 'Learner',
      course_title: data.course_title || 'Course',
      instructor_name: data.instructor_name || 'Instructor',
      issued_at: data.issued_at || new Date().toISOString(),
      status: data.status || (data.is_valid ? 'valid' : 'revoked'),
    };
  } catch {
    return null;
  }
}

interface VerifyPageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: VerifyPageProps): Promise<Metadata> {
  const { code } = await params;
  const cert = await verifyCertificate(code);

  return {
    title: `Verify Certificate ${code} | LearnHub`,
    description: cert
      ? `Verify authenticity of digital certificate awarded to ${cert.recipient_name} for ${cert.course_title}.`
      : 'Verify digital credential authenticity on LearnHub.',
  };
}

export default async function PublicCertificateVerificationPage({ params }: VerifyPageProps) {
  const { code } = await params;
  const cert = await verifyCertificate(code);

  const isValid = cert?.status === 'valid';

  return (
    <div className="container mx-auto flex min-h-[80vh] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-lg shadow-2xl border-border text-center overflow-hidden">
        <div className={`h-2.5 ${isValid ? 'bg-emerald-500' : 'bg-destructive'}`} />

        <CardHeader className="space-y-4 pt-8">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
              isValid
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-destructive/10 text-destructive'
            }`}
          >
            {isValid ? <ShieldCheck className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}
          </div>

          <div>
            <Badge
              variant={isValid ? 'default' : 'destructive'}
              className={`text-xs uppercase tracking-widest font-bold px-3 py-1 ${
                isValid ? 'bg-emerald-600 text-white' : ''
              }`}
            >
              {isValid ? 'Verified Credential' : 'Invalid or Revoked'}
            </Badge>

            <CardTitle className="text-2xl font-extrabold tracking-tight mt-3">
              Official Credential Record
            </CardTitle>
            <CardDescription className="text-xs font-mono font-semibold text-muted-foreground mt-1">
              Certificate Code: {code}
            </CardDescription>
          </div>
        </CardHeader>

        {cert ? (
          <CardContent className="space-y-6 text-left px-6">
            <div className="divide-y divide-border/60 rounded-xl border bg-muted/20 p-4 text-xs space-y-3">
              <div className="flex items-center justify-between pb-3">
                <span className="text-muted-foreground">Recipient Name</span>
                <span className="text-sm font-bold text-foreground">{cert.recipient_name}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Course</span>
                <span className="text-sm font-semibold text-foreground text-right max-w-xs truncate">
                  {cert.course_title}
                </span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Instructor</span>
                <span className="font-medium text-foreground">{cert.instructor_name}</span>
              </div>

              <div className="flex items-center justify-between py-3">
                <span className="text-muted-foreground">Issue Date</span>
                <span className="font-medium text-foreground">
                  {new Date(cert.issued_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between pt-3">
                <span className="text-muted-foreground">Issuing Authority</span>
                <span className="font-bold text-primary">LearnHub Online Academy</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                This certificate represents genuine academic completion recorded on the LearnHub cryptographic ledger.
              </span>
            </div>
          </CardContent>
        ) : (
          <CardContent className="py-6 text-sm text-muted-foreground">
            No credential matches this verification identifier. Please ensure the code is correct.
          </CardContent>
        )}

        <CardFooter className="flex justify-center border-t bg-muted/10 p-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/courses">
              Explore LearnHub Courses <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
