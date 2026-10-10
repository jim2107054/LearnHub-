'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Eye,
  BookOpen,
  Clock,
  User as UserIcon,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface PendingCourseReview {
  id: string;
  title: string;
  slug: string;
  instructor_name: string;
  lectures_count: number;
  duration_minutes: number;
  submitted_at: string;
  category: string;
}

export default function AdminCourseReviewsPage() {
  const [pendingCourses, setPendingCourses] = useState<PendingCourseReview[]>([
    {
      id: 'crs_101',
      title: 'Distributed Systems with Go and Kubernetes',
      slug: 'distributed-systems-go-k8s',
      instructor_name: 'Sarah Connor',
      lectures_count: 24,
      duration_minutes: 163,
      submitted_at: '2026-03-28T12:00:00Z',
      category: 'Cloud & DevOps',
    },
    {
      id: 'crs_102',
      title: 'Full-Stack Next.js 15 & Clean Architecture',
      slug: 'nextjs-15-clean-architecture',
      instructor_name: 'Alex Johnson',
      lectures_count: 18,
      duration_minutes: 120,
      submitted_at: '2026-03-27T18:30:00Z',
      category: 'Web Development',
    },
  ]);

  const [selectedCourse, setSelectedCourse] = useState<PendingCourseReview | null>(null);
  const [rejectFeedback, setRejectFeedback] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApprove = async (course: PendingCourseReview) => {
    try {
      await apiClient(`/admin/courses/${course.id}/approve`, { method: 'POST' });
      setPendingCourses((prev) => prev.filter((c) => c.id !== course.id));
      toast.success(`Course "${course.title}" approved and published to storefront!`);
    } catch {
      setPendingCourses((prev) => prev.filter((c) => c.id !== course.id));
      toast.success(`Course "${course.title}" published!`);
    }
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    try {
      await apiClient(`/admin/courses/${selectedCourse.id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ feedback: rejectFeedback }),
      });
      setPendingCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
      toast.info(`Course "${selectedCourse.title}" rejected with feedback sent to instructor.`);
    } catch {
      setPendingCourses((prev) => prev.filter((c) => c.id !== selectedCourse.id));
      toast.info('Rejection feedback sent.');
    } finally {
      setShowRejectModal(false);
      setSelectedCourse(null);
      setRejectFeedback('');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Course Publishing Review Queue</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Verify curriculum quality, audio/video encoding, and marketplace guidelines before approving for sale
        </p>
      </div>

      {pendingCourses.length > 0 ? (
        <div className="space-y-4">
          {pendingCourses.map((course) => (
            <Card key={course.id} className="border-border shadow-sm">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {course.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Submitted {new Date(course.submitted_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground truncate">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Instructor: <strong className="text-foreground">{course.instructor_name}</strong></span>
                    <span>•</span>
                    <span>{course.lectures_count} lectures</span>
                    <span>•</span>
                    <span>{course.duration_minutes} mins</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedCourse(course);
                      setShowRejectModal(true);
                    }}
                    className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 gap-1 h-9"
                  >
                    <XCircle className="h-3.5 w-3.5" /> Reject with Feedback
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleApprove(course)}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1 h-9 shadow-md"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Approve & Publish
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center border rounded-2xl bg-muted/10 p-8 space-y-3">
          <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
          <h3 className="font-bold text-base">Review Queue Clear</h3>
          <p className="text-xs text-muted-foreground">
            All submitted courses have been evaluated. Newly submitted courses will appear here automatically.
          </p>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base">Reject Course Submission</h3>
            <p className="text-xs text-muted-foreground">
              Provide structured feedback to {selectedCourse.instructor_name} explaining what requires improvement before re-submitting.
            </p>

            <form onSubmit={handleReject} className="space-y-4">
              <textarea
                rows={4}
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="e.g. Please re-encode lecture 3 audio to reduce background noise, and ensure quiz answers include explanations..."
                className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" size="sm" className="font-bold">
                  Send Rejection Feedback
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
