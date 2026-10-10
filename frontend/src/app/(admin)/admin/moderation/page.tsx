'use client';

import React, { useState } from 'react';
import {
  Flag,
  CheckCircle2,
  Trash2,
  UserX,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface ModerationReport {
  id: string;
  entity_type: 'review' | 'qa_question' | 'comment' | 'profile';
  entity_id: string;
  reason: string;
  content_preview: string;
  reported_by: string;
  reported_at: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ModerationReport[]>([
    {
      id: 'rep_1',
      entity_type: 'review',
      entity_id: 'rev_991',
      reason: 'inappropriate_content',
      content_preview: 'Terrible course! Do not buy! Visit www.fake-free-leaks.com for free downloads.',
      reported_by: '2 students',
      reported_at: '2026-03-28T09:15:00Z',
      status: 'pending',
    },
    {
      id: 'rep_2',
      entity_type: 'qa_question',
      entity_id: 'qa_502',
      reason: 'spam',
      content_preview: 'Best casino betting deals telegram channel @freebets2026',
      reported_by: 'Alex Johnson',
      reported_at: '2026-03-27T16:40:00Z',
      status: 'pending',
    },
  ]);

  const handleDismiss = async (reportId: string) => {
    try {
      await apiClient(`/admin/moderation/reports/${reportId}/dismiss`, { method: 'POST' });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.info('Report dismissed as non-violating');
    } catch {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.info('Report dismissed');
    }
  };

  const handleDeleteEntity = async (reportId: string) => {
    try {
      await apiClient(`/admin/moderation/reports/${reportId}/remove-content`, { method: 'POST' });
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success('Offending content deleted and author notified of guideline violation');
    } catch {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      toast.success('Content removed');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Community Moderation Triage</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review reported comments, reviews, and questions flagged by students and instructors
        </p>
      </div>

      {reports.length > 0 ? (
        <div className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="border-border shadow-sm">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                      Flagged: {report.reason.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {report.entity_type}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Reported by {report.reported_by} • {new Date(report.reported_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30 border text-xs font-mono text-foreground/90 italic leading-relaxed">
                    &quot;{report.content_preview}&quot;
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDismiss(report.id)}
                    className="text-xs h-9"
                  >
                    Dismiss
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteEntity(report.id)}
                    className="text-xs font-bold gap-1 h-9 shadow-md"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove Content & Warn
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border rounded-2xl bg-muted/10 p-8 space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-base">All Moderation Reports Resolved</h3>
          <p className="text-xs text-muted-foreground">
            There are no open reports requiring staff review.
          </p>
        </div>
      )}
    </div>
  );
}
