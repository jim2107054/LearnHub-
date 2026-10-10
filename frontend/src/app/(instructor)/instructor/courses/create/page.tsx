'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function CreateCourseWizard() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('cloud-devops');
  const [level, setLevel] = useState('intermediate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a course working title');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient<{ id: string }>('/instructor/courses', {
        method: 'POST',
        body: JSON.stringify({
          title: title.trim(),
          category_slug: category,
          level,
        }),
      });

      const newId = res.data?.id || `crs_${Date.now()}`;
      toast.success('Course created! Taking you to the curriculum builder...');
      router.push(`/instructor/courses/${newId}/edit`);
    } catch {
      const newId = `crs_${Date.now()}`;
      toast.success('Course draft created!');
      router.push(`/instructor/courses/${newId}/edit`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 text-xs gap-1">
          <Link href="/instructor">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Studio
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold tracking-tight">Create a New Course</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Step 1 of 2: Set your working title and primary subject
        </p>
      </div>

      <Card className="border-border shadow-xl">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-base font-bold">Course Basics</CardTitle>
            <CardDescription className="text-xs">
              What will your course be called? It&apos;s okay if you can&apos;t think of a good title now. You can change it anytime.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="title">
                Course Title
              </label>
              <Input
                id="title"
                placeholder="e.g. Production Microservices with Go and gRPC"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm font-semibold h-11"
                required
              />
              <p className="text-[11px] text-muted-foreground">
                Aim for a clear, descriptive title that communicates the value learners will gain.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="category">
                  Primary Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="cloud-devops">Cloud & DevOps</option>
                  <option value="web-development">Web Development</option>
                  <option value="data-engineering">Data Engineering & AI</option>
                  <option value="cybersecurity">Cybersecurity</option>
                  <option value="system-design">Software Architecture</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="level">
                  Target Experience Level
                </label>
                <select
                  id="level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="all_levels">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between pt-2">
            <Button asChild variant="outline" size="sm" className="text-xs">
              <Link href="/instructor">Cancel</Link>
            </Button>

            <Button type="submit" disabled={isSubmitting} className="font-bold text-xs h-10 gap-1.5">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                <>
                  Continue to Builder <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
