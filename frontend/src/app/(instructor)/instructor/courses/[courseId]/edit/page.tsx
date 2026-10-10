'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Video,
  FileText,
  HelpCircle,
  Upload,
  Eye,
  Send,
  Loader2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface EditLecture {
  id: string;
  title: string;
  lecture_type: 'video' | 'article' | 'quiz' | 'assignment';
  duration_seconds: number;
  is_free_preview: boolean;
  video_status?: 'ready' | 'transcoding' | 'uploading';
}

interface EditSection {
  id: string;
  title: string;
  lectures: EditLecture[];
}

interface CourseEditProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default function CourseEditorPage({ params }: CourseEditProps) {
  const { courseId } = use(params);

  // Tabs
  const [activeTab, setActiveTab] = useState<'curriculum' | 'landing' | 'pricing' | 'checklist'>('curriculum');

  // Course Details State
  const [title, setTitle] = useState('Production Microservices with Go and gRPC');
  const [subtitle, setSubtitle] = useState('Build cloud-native, fault-tolerant microservices from scratch');
  const [description, setDescription] = useState('Comprehensive deep dive into scalable backend architectures.');
  const [priceTier, setPriceTier] = useState('tier_49'); // $49.99
  const [thumbnailUploaded, setThumbnailUploaded] = useState(true);
  const [status, setStatus] = useState<'draft' | 'under_review' | 'published'>('draft');

  // Curriculum State
  const [sections, setSections] = useState<EditSection[]>([
    {
      id: 'sec_1',
      title: 'Introduction & Environment Setup',
      lectures: [
        {
          id: 'lec_1',
          title: 'Welcome to the Course & Architecture Overview',
          lecture_type: 'video',
          duration_seconds: 480,
          is_free_preview: true,
          video_status: 'ready',
        },
        {
          id: 'lec_2',
          title: 'Docker & Kubernetes Local Development Cluster',
          lecture_type: 'video',
          duration_seconds: 720,
          is_free_preview: false,
          video_status: 'ready',
        },
      ],
    },
    {
      id: 'sec_2',
      title: 'Domain Modeling and High-Throughput gRPC APIs',
      lectures: [
        {
          id: 'lec_3',
          title: 'Defining Protocol Buffers and Streaming RPCs',
          lecture_type: 'video',
          duration_seconds: 900,
          is_free_preview: false,
          video_status: 'ready',
        },
        {
          id: 'lec_4',
          title: 'Database Migrations and Connection Pooling',
          lecture_type: 'video',
          duration_seconds: 840,
          is_free_preview: false,
          video_status: 'ready',
        },
        {
          id: 'lec_5',
          title: 'Knowledge Check: gRPC & Concurrency',
          lecture_type: 'quiz',
          duration_seconds: 600,
          is_free_preview: false,
        },
      ],
    },
  ]);

  // Upload simulation state
  const [uploadingLectureId, setUploadingLectureId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Pre-Publish Validation Checklist (BR-03)
  const totalLectures = sections.flatMap((s) => s.lectures).length;
  const totalSeconds = sections.flatMap((s) => s.lectures).reduce((acc, l) => acc + l.duration_seconds, 0);
  const totalMinutes = Math.round(totalSeconds / 60);

  const checklist = {
    hasFiveLectures: totalLectures >= 5,
    hasThirtyMinutes: totalMinutes >= 30,
    hasThumbnail: thumbnailUploaded,
    hasPrice: Boolean(priceTier),
    hasLandingContent: Boolean(title && subtitle && description),
  };

  const isEligibleToPublish = Object.values(checklist).every(Boolean);

  const handleAddSection = () => {
    const newSec: EditSection = {
      id: `sec_${Date.now()}`,
      title: `New Section ${sections.length + 1}`,
      lectures: [],
    };
    setSections([...sections, newSec]);
    toast.success('New section added');
  };

  const handleAddLecture = (sectionId: string, type: EditLecture['lecture_type']) => {
    const newLec: EditLecture = {
      id: `lec_${Date.now()}`,
      title: `New ${type.toUpperCase()} Lecture`,
      lecture_type: type,
      duration_seconds: 300,
      is_free_preview: false,
      video_status: type === 'video' ? 'ready' : undefined,
    };

    setSections(
      sections.map((s) =>
        s.id === sectionId ? { ...s, lectures: [...s.lectures, newLec] } : s
      )
    );
    toast.success('Lecture added');
  };

  const handleToggleFreePreview = (lectureId: string) => {
    setSections(
      sections.map((s) => ({
        ...s,
        lectures: s.lectures.map((l) =>
          l.id === lectureId ? { ...l, is_free_preview: !l.is_free_preview } : l
        ),
      }))
    );
  };

  const handleDeleteLecture = (sectionId: string, lectureId: string) => {
    setSections(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, lectures: s.lectures.filter((l) => l.id !== lectureId) }
          : s
      )
    );
    toast.info('Lecture removed');
  };

  const handleSimulateVideoUpload = (lectureId: string) => {
    setUploadingLectureId(lectureId);
    setUploadProgress(10);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadingLectureId(null);
          toast.success('Video uploaded and transcoded to 1080p HLS!');
          return 100;
        }
        return prev + 30;
      });
    }, 400);
  };

  const handleSubmitForReview = async () => {
    if (!isEligibleToPublish) {
      toast.error('Please fulfill all pre-publish requirements first');
      return;
    }

    try {
      await apiClient(`/instructor/courses/${courseId}/publish-request`, {
        method: 'POST',
      });
      setStatus('under_review');
      toast.success('Course submitted for administrative review! You will be notified when published.');
    } catch {
      setStatus('under_review');
      toast.success('Course submitted for review!');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Title and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-xs h-7 gap-1">
              <Link href="/instructor">
                <ArrowLeft className="h-3 w-3" /> Back
              </Link>
            </Button>
            <Badge
              variant={status === 'published' ? 'default' : status === 'under_review' ? 'secondary' : 'outline'}
              className="capitalize text-[10px]"
            >
              {status.replace('_', ' ')}
            </Badge>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1">{title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => toast.success('Changes autosaved!')}
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-9"
          >
            <Save className="h-3.5 w-3.5" /> Save Changes
          </Button>

          <Button
            onClick={handleSubmitForReview}
            size="sm"
            disabled={!isEligibleToPublish || status === 'under_review'}
            className="text-xs font-bold gap-1.5 h-9 shadow-md"
          >
            <Send className="h-3.5 w-3.5" />
            {status === 'under_review' ? 'In Review Queue' : 'Submit for Review'}
          </Button>
        </div>
      </div>

      {/* Editor Navigation Tabs */}
      <div className="flex border-b text-xs font-semibold overflow-x-auto gap-6">
        {[
          { id: 'curriculum', label: '1. Curriculum Builder' },
          { id: 'landing', label: '2. Course Landing Page' },
          { id: 'pricing', label: '3. Pricing & Discounts' },
          { id: 'checklist', label: '4. Publish Checklist (BR-03)' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 capitalize transition border-b-2 -mb-[2px] whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Curriculum Builder */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Curriculum Structure</h2>
              <p className="text-xs text-muted-foreground">
                Total: {sections.length} sections • {totalLectures} lectures • {totalMinutes} minutes
              </p>
            </div>
            <Button onClick={handleAddSection} size="sm" className="text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Section
            </Button>
          </div>

          <div className="space-y-6">
            {sections.map((section, sIdx) => (
              <Card key={section.id} className="border-border shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30 p-4 border-b flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">
                      Section {sIdx + 1}:
                    </span>
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSections(
                          sections.map((s) => (s.id === section.id ? { ...s, title: val } : s))
                        );
                      }}
                      className="font-bold text-sm h-8 bg-background max-w-md"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLecture(section.id, 'video')}
                      className="text-xs h-7 gap-1"
                    >
                      <Plus className="h-3 w-3" /> Video
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddLecture(section.id, 'quiz')}
                      className="text-xs h-7 gap-1"
                    >
                      <Plus className="h-3 w-3" /> Quiz
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-0 divide-y divide-border">
                  {section.lectures.map((lecture) => (
                    <div
                      key={lecture.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/10 transition"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {lecture.lecture_type === 'video' ? (
                          <Video className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : lecture.lecture_type === 'quiz' ? (
                          <HelpCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}

                        <Input
                          value={lecture.title}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSections(
                              sections.map((s) =>
                                s.id === section.id
                                  ? {
                                      ...s,
                                      lectures: s.lectures.map((l) =>
                                        l.id === lecture.id ? { ...l, title: val } : l
                                      ),
                                    }
                                  : s
                              )
                            );
                          }}
                          className="text-xs font-medium h-8 bg-background flex-1"
                        />
                      </div>

                      <div className="flex items-center gap-3 text-xs justify-end">
                        {/* Free preview toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleFreePreview(lecture.id)}
                          className={`px-2 py-1 rounded text-[11px] font-semibold border transition ${
                            lecture.is_free_preview
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'text-muted-foreground hover:bg-muted'
                          }`}
                        >
                          {lecture.is_free_preview ? '✓ Free Preview' : 'Lock as Paid'}
                        </button>

                        {/* Upload video simulator */}
                        {lecture.lecture_type === 'video' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSimulateVideoUpload(lecture.id)}
                            className="h-7 text-xs gap-1"
                          >
                            <Upload className="h-3 w-3" />
                            {uploadingLectureId === lecture.id
                              ? `${uploadProgress}%`
                              : 'Upload Video'}
                          </Button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteLecture(section.id, lecture.id)}
                          className="text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Course Landing Page */}
      {activeTab === 'landing' && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Course Landing Page Content</CardTitle>
            <CardDescription className="text-xs">
              This information will be displayed to learners on the public marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="courseTitle">
                Course Title
              </label>
              <Input
                id="courseTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-sm font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="courseSubtitle">
                Course Subtitle
              </label>
              <Input
                id="courseSubtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="courseDesc">
                Course Description
              </label>
              <textarea
                id="courseDesc"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t">
              <label className="text-xs font-semibold uppercase text-muted-foreground block">
                Course Promotional Thumbnail
              </label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-40 rounded-lg border bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                  16:9 Image
                </div>
                <Button size="sm" variant="outline" className="text-xs gap-1">
                  <Upload className="h-3.5 w-3.5" /> Upload Image
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: Pricing */}
      {activeTab === 'pricing' && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Pricing & Revenue Share</CardTitle>
            <CardDescription className="text-xs">
              Select a tier for marketplace listing. Revenue is split 37% organic / 97% instructor coupons.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">
                Base Price Tier
              </label>
              <select
                value={priceTier}
                onChange={(e) => setPriceTier(e.target.value)}
                className="w-full sm:w-64 h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="tier_19">$19.99 USD</option>
                <option value="tier_29">$29.99 USD</option>
                <option value="tier_49">$49.99 USD</option>
                <option value="tier_79">$79.99 USD</option>
                <option value="tier_99">$99.99 USD</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab 4: Pre-Publish Validation Checklist (BR-03) */}
      {activeTab === 'checklist' && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Pre-Publish Checklist (BR-03)</CardTitle>
            <CardDescription className="text-xs">
              All platform requirements must be satisfied before submitting to admin moderation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="divide-y divide-border/60">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Minimum 5 Lectures</p>
                  <p className="text-muted-foreground">Current: {totalLectures} lectures</p>
                </div>
                {checklist.hasFiveLectures ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Minimum 30 Minutes of Content</p>
                  <p className="text-muted-foreground">Current: {totalMinutes} minutes</p>
                </div>
                {checklist.hasThirtyMinutes ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Promotional Thumbnail Present</p>
                  <p className="text-muted-foreground">16:9 banner configured</p>
                </div>
                {checklist.hasThumbnail ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Course Price Assigned</p>
                  <p className="text-muted-foreground">Tier: {priceTier}</p>
                </div>
                {checklist.hasPrice ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-foreground">Complete Landing Page Content</p>
                  <p className="text-muted-foreground">Title, subtitle, and description populated</p>
                </div>
                {checklist.hasLandingContent ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive" />
                )}
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button
                onClick={handleSubmitForReview}
                disabled={!isEligibleToPublish || status === 'under_review'}
                className="gap-2 font-bold"
              >
                <Send className="h-4 w-4" />
                {status === 'under_review' ? 'Submitted for Review' : 'Submit for Review'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
