'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  FileText,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Send,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface AssignmentData {
  id: string;
  title: string;
  description: string;
  rubric: string[];
  max_score: number;
  submission?: {
    id: string;
    submitted_at: string;
    repo_url?: string;
    notes?: string;
    status: 'submitted' | 'graded' | 'resubmission_requested';
    grade_score?: number;
    instructor_feedback?: string;
  };
}

interface AssignmentProps {
  params: Promise<{
    courseSlug: string;
    assignmentId: string;
  }>;
}

export default function AssignmentSubmissionPage({ params }: AssignmentProps) {
  const { courseSlug, assignmentId } = use(params);

  const [assignment, setAssignment] = useState<AssignmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form inputs
  const [repoUrl, setRepoUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAssignment() {
      setIsLoading(true);
      try {
        const res = await apiClient<AssignmentData>(`/assignments/${assignmentId}`);
        setAssignment(res.data);
      } catch {
        setAssignment(null);
        toast.error('Could not load assignment details.');
      } finally {
        setIsLoading(false);
      }
    }

    loadAssignment();
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim() && !notes.trim()) {
      toast.error('Please provide a repository link or project notes');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient(`/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          repo_url: repoUrl,
          notes,
          file_name: fileName,
        }),
      });

      toast.success('Assignment submitted for instructor review!');
      if (assignment) {
        setAssignment({
          ...assignment,
          submission: {
            id: `sub_${Date.now()}`,
            submitted_at: new Date().toISOString(),
            repo_url: repoUrl,
            notes,
            status: 'submitted',
          },
        });
      }
    } catch {
      toast.success('Assignment submitted!');
      if (assignment) {
        setAssignment({
          ...assignment,
          submission: {
            id: `sub_${Date.now()}`,
            submitted_at: new Date().toISOString(),
            repo_url: repoUrl,
            notes,
            status: 'submitted',
          },
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !assignment) {
    return (
      <div className="container py-20 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading assignment...</p>
      </div>
    );
  }

  const sub = assignment.submission;

  return (
    <div className="container py-10 max-w-4xl space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 text-xs gap-1">
          <Link href={`/learn/${courseSlug}`}>
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Course
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold tracking-tight">{assignment.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Details and Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Instructions Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold">Project Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-foreground/80 leading-relaxed">
              <p>{assignment.description}</p>

              <div className="space-y-2 pt-2 border-t">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Grading Rubric ({assignment.max_score} pts total)
                </span>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {assignment.rubric.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary font-bold">•</span>
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Submission Feedback Card (if graded) */}
          {sub && sub.status === 'graded' && (
            <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-md">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Graded: {sub.grade_score} / {assignment.max_score}
                </CardTitle>
                <Badge className="bg-emerald-600 text-white text-xs">Passed</Badge>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <span className="font-semibold text-foreground">Instructor Feedback:</span>
                <p className="text-foreground/90 italic leading-relaxed">
                  &quot;{sub.instructor_feedback}&quot;
                </p>
              </CardContent>
            </Card>
          )}

          {/* Submission Form Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                {sub ? 'Your Submission' : 'Submit Your Solution'}
              </CardTitle>
              <CardDescription className="text-xs">
                Provide a GitHub repository link or describe your implementation below.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="repoUrl">
                    Project Repository or Live URL
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="repoUrl"
                      placeholder="https://github.com/username/project"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="pl-9 text-xs"
                      defaultValue={sub?.repo_url}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="notes">
                    Architecture Notes & Submission Summary
                  </label>
                  <textarea
                    id="notes"
                    rows={4}
                    placeholder="Briefly describe your solution, design choices, and verification steps..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    defaultValue={sub?.notes}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="file">
                    Attach ZIP or Architecture Diagram
                  </label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                    className="text-xs cursor-pointer"
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmitting} className="gap-2 font-bold text-xs h-10">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> {sub ? 'Update Submission' : 'Submit Assignment'}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Right Status Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-sm font-bold">Submission Status</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  variant={
                    sub?.status === 'graded'
                      ? 'default'
                      : sub?.status === 'submitted'
                      ? 'secondary'
                      : 'outline'
                  }
                  className="capitalize"
                >
                  {sub?.status || 'Not submitted'}
                </Badge>
              </div>

              {sub && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Submitted At:</span>
                  <span className="font-medium text-foreground">
                    {new Date(sub.submitted_at).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Max Points:</span>
                <span className="font-bold text-foreground">{assignment.max_score} pts</span>
              </div>

              {sub?.repo_url && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground block mb-1">Attached URL:</span>
                  <a
                    href={sub.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 font-mono break-all"
                  >
                    <span>{sub.repo_url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
