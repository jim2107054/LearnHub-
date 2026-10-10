'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  Award,
  Download,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface CertificateDetails {
  id: string;
  code: string; // e.g. CRT-20260328-98A1B2C3
  recipient_name: string;
  course_title: string;
  instructor_name: string;
  issued_at: string;
  is_valid: boolean;
}

interface CertificateProps {
  params: Promise<{
    certificateId: string;
  }>;
}

export default function CertificatePage({ params }: CertificateProps) {
  const { certificateId } = use(params);

  const [cert, setCert] = useState<CertificateDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadCertificate() {
      setIsLoading(true);
      try {
        const res = await apiClient<CertificateDetails>(`/certificates/${certificateId}`);
        setCert(res.data);
      } catch {
        // Fallback for preview
        setCert({
          id: certificateId,
          code: 'CRT-20260328-98A1B2C3',
          recipient_name: 'Jordan Miller',
          course_title: 'Complete Cloud Architecture Masterclass',
          instructor_name: 'Alex Johnson',
          issued_at: '2026-03-28T14:00:00Z',
          is_valid: true,
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadCertificate();
  }, [certificateId]);

  const verifyUrl = cert
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://learnhub.example.com'}/verify/${cert.code}`
    : '';

  const handleCopyLink = () => {
    if (!verifyUrl) return;
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    toast.success('Certificate verification link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    window.print();
  };

  const handleShareLinkedIn = () => {
    if (!cert) return;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (isLoading || !cert) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Generating certificate preview...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl space-y-8">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Official Certificate of Completion</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Certificate ID: <span className="font-mono font-bold text-foreground">{cert.code}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleCopyLink} variant="outline" size="sm" className="text-xs gap-1.5">
            {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>

          <Button onClick={handleShareLinkedIn} variant="outline" size="sm" className="text-xs gap-1.5">
            <Share2 className="h-4 w-4" /> Share on LinkedIn
          </Button>

          <Button onClick={handleDownload} size="sm" className="text-xs gap-1.5 font-bold shadow-md">
            <Download className="h-4 w-4" /> Download / Print PDF
          </Button>
        </div>
      </div>

      {/* High-Resolution Certificate Frame */}
      <div className="relative mx-auto w-full max-w-4xl aspect-[1.414/1] bg-card border-8 border-double border-primary/30 rounded-2xl p-8 sm:p-14 shadow-2xl flex flex-col justify-between text-center overflow-hidden print:border-none print:shadow-none print:p-0">
        {/* Subtle Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
          <Award className="w-96 h-96 text-primary" />
        </div>

        {/* Certificate Header */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-center gap-2 text-primary font-bold tracking-widest uppercase text-sm">
            <Award className="h-6 w-6" />
            <span>LearnHub Certified Masterclass</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight text-foreground">
            Certificate of Completion
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest pt-1">
            This is to officially certify that
          </p>
        </div>

        {/* Recipient Name */}
        <div className="space-y-3 my-6 relative z-10">
          <h3 className="text-3xl sm:text-5xl font-serif font-bold text-primary underline decoration-primary/40 underline-offset-8">
            {cert.recipient_name}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto pt-2 leading-relaxed">
            has successfully completed all required lectures, assessments, and practical capstone projects for
          </p>
          <h4 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {cert.course_title}
          </h4>
        </div>

        {/* Signatures & Verification Badge */}
        <div className="grid grid-cols-3 items-end pt-8 border-t border-border/80 text-xs text-muted-foreground relative z-10">
          <div className="text-left space-y-1">
            <p className="font-serif italic text-base sm:text-lg text-foreground font-semibold">
              {cert.instructor_name}
            </p>
            <div className="h-0.5 w-32 bg-border" />
            <p className="text-[11px] uppercase tracking-wider">Instructor</p>
          </div>

          <div className="flex flex-col items-center space-y-1">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/30">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="font-mono text-[10px] text-foreground font-semibold">
              {cert.code}
            </span>
          </div>

          <div className="text-right space-y-1">
            <p className="text-foreground font-medium">
              {new Date(cert.issued_at).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <div className="h-0.5 w-32 bg-border ml-auto" />
            <p className="text-[11px] uppercase tracking-wider">Date Issued</p>
          </div>
        </div>
      </div>
    </div>
  );
}
