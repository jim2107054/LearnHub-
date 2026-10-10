'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  HelpCircle,
  Download,
  MessageSquare,
  Bookmark,
  Share2,
  ChevronDown,
  Award,
  Clock,
  Send,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { VideoPlayer } from '@/components/player/video-player';
import { apiClient } from '@/lib/api-client';
import { Course, Section, Lecture } from '@/types/api';
import { formatDuration } from '@/lib/utils';
import { toast } from 'sonner';

interface NoteItem {
  id: string;
  timestamp_seconds: number;
  text: string;
  created_at: string;
}

interface LearnPageProps {
  params: Promise<{
    courseSlug: string;
    lectureId: string;
  }>;
}

export default function CourseLearnPage({ params }: LearnPageProps) {
  const router = useRouter();
  const { courseSlug, lectureId } = use(params);

  const [course, setCourse] = useState<Course | null>(null);
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [completedLectureIds, setCompletedLectureIds] = useState<Set<string>>(new Set());

  // Notes state
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'qa' | 'resources'>('overview');

  // Auto-advance countdown
  const [countdownNextLecture, setCountdownNextLecture] = useState<Lecture | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  // Load course and curriculum
  useEffect(() => {
    async function loadCourseData() {
      try {
        const res = await apiClient<Course>(`/catalog/courses/${courseSlug}`);
        setCourse(res.data);

        // Find active lecture
        const allLectures = res.data?.sections?.flatMap((s) => s.lectures) || [];
        const found = allLectures.find((l) => l.id === lectureId) || allLectures[0] || null;
        setCurrentLecture(found);
      } catch {
        setCourse(null);
        toast.error('Unable to load course data');
      }
    }

    loadCourseData();
  }, [courseSlug, lectureId]);

  // Handle video end and auto-advance
  const handleVideoEnded = () => {
    if (!currentLecture || !course) return;

    // Mark as completed
    setCompletedLectureIds((prev) => new Set([...prev, currentLecture.id]));

    // Find next lecture
    const allLectures = course.sections?.flatMap((s) => s.lectures) || [];
    const currentIndex = allLectures.findIndex((l) => l.id === currentLecture.id);
    if (currentIndex >= 0 && currentIndex < allLectures.length - 1) {
      const nextLecture = allLectures[currentIndex + 1];
      setCountdownNextLecture(nextLecture);
      setCountdownSeconds(5);
    }
  };

  // Countdown timer effect
  useEffect(() => {
    if (countdownSeconds === null || countdownSeconds <= 0) {
      if (countdownSeconds === 0 && countdownNextLecture) {
        router.push(`/learn/${courseSlug}/${countdownNextLecture.id}`);
        setCountdownNextLecture(null);
        setCountdownSeconds(null);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdownSeconds(countdownSeconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdownSeconds, countdownNextLecture, courseSlug, router]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote: NoteItem = {
      id: `note_${Date.now()}`,
      timestamp_seconds: Math.round(currentVideoTime),
      text: newNoteText.trim(),
      created_at: new Date().toISOString(),
    };

    setNotes((prev) => [newNote, ...prev]);
    setNewNoteText('');
    toast.success(`Note saved at ${formatSeconds(newNote.timestamp_seconds)}`);
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleExportNotes = () => {
    if (notes.length === 0) {
      toast.info('No notes to export');
      return;
    }
    const content = `# Study Notes: ${course?.title || 'LearnHub'}\nLecture: ${currentLecture?.title}\n\n` +
      notes.map((n) => `[${formatSeconds(n.timestamp_seconds)}] ${n.text}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${currentLecture?.title || 'lecture'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Notes exported as Markdown');
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const allLecturesList = course?.sections?.flatMap((s) => s.lectures) || [];
  const progressPercent = allLecturesList.length > 0
    ? Math.round((completedLectureIds.size / allLecturesList.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Learning Bar */}
      <header className="h-14 border-b bg-card px-4 flex items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
            <Link href="/my-learning">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to My Learning
            </Link>
          </Button>
          <span className="text-muted-foreground/40 hidden sm:inline">|</span>
          <h1 className="text-sm font-semibold truncate text-foreground hidden sm:block">
            {course?.title || 'Course Player'}
          </h1>
        </div>

        {/* Progress & Certificate Indicator */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Progress:</span>
            <span className="text-xs font-bold text-foreground">{progressPercent}%</span>
            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {progressPercent >= 90 && (
            <Badge className="bg-emerald-600 text-white gap-1 text-[11px] animate-pulse">
              <Award className="h-3 w-3" /> Certificate Ready
            </Badge>
          )}
        </div>
      </header>

      {/* Main Grid: Player on left, Curriculum Sidebar on right */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        {/* Left Column: Player & Tabs */}
        <div className="lg:col-span-3 flex flex-col overflow-y-auto">
          {/* Video or Article Player */}
          <div className="bg-black relative">
            {currentLecture?.lecture_type === 'video' ? (
              <VideoPlayer
                lectureId={currentLecture.id}
                courseSlug={courseSlug}
                videoSrc={(currentLecture as any).video_url || (currentLecture.preview_content as any)?.video_url || (currentLecture.content_payload as any)?.video_url}
                onTimeUpdate={(time) => setCurrentVideoTime(time)}
                onEnded={handleVideoEnded}
              />
            ) : (
              <div className="p-8 md:p-12 text-slate-100 max-w-3xl mx-auto space-y-6">
                <Badge variant="outline" className="text-primary border-primary">
                  Article Lecture
                </Badge>
                <h2 className="text-2xl md:text-3xl font-extrabold">{currentLecture?.title}</h2>
                <div className="prose dark:prose-invert text-slate-300 text-sm leading-relaxed space-y-4">
                  <p>
                    In distributed systems and large database architectures, selecting the correct replication and sharding topology dictates the long-term scalability of the application.
                  </p>
                  <p>
                    Read replicas allow scaling read-heavy query loads across multiple geographic zones while delegating write mutations to the primary database cluster.
                  </p>
                </div>
                <Button
                  onClick={handleVideoEnded}
                  className="gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Mark as Completed
                </Button>
              </div>
            )}

            {/* Cancelable Auto-Advance Overlay */}
            {countdownNextLecture && (
              <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="max-w-md rounded-2xl bg-card border p-6 text-center space-y-4 shadow-2xl">
                  <span className="text-xs font-semibold text-primary uppercase">Up Next</span>
                  <h3 className="text-lg font-bold">{countdownNextLecture.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Starting in <span className="font-bold text-foreground">{countdownSeconds}</span> seconds...
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCountdownNextLecture(null);
                        setCountdownSeconds(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        router.push(`/learn/${courseSlug}/${countdownNextLecture.id}`);
                        setCountdownNextLecture(null);
                        setCountdownSeconds(null);
                      }}
                    >
                      Play Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lecture Navigation Tabs */}
          <div className="p-6 space-y-6 flex-1">
            <div className="flex items-center gap-6 border-b text-sm font-medium">
              {(['overview', 'notes', 'qa', 'resources'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 capitalize transition border-b-2 -mb-[2px] ${
                    activeTab === tab
                      ? 'border-primary text-primary font-bold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'qa' ? 'Q&A' : tab}
                </button>
              ))}
            </div>

            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4 max-w-3xl">
                <div>
                  <h2 className="text-xl font-bold">{currentLecture?.title}</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Duration: {formatDuration(currentLecture?.duration_seconds || 0)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  In this lesson, we explore foundational concepts, practical code patterns, and debugging strategies. Follow along with the code repository and take notes at key concepts.
                </p>
              </div>
            )}

            {/* Tab: Timestamped Notes */}
            {activeTab === 'notes' && (
              <div className="space-y-6 max-w-3xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-primary" /> Timestamped Study Notes
                  </h3>
                  {notes.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportNotes}
                      className="text-xs gap-1 h-8"
                    >
                      <Download className="h-3.5 w-3.5" /> Export (.md)
                    </Button>
                  )}
                </div>

                <form onSubmit={handleAddNote} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-xs">
                      At {formatSeconds(currentVideoTime)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Current playback time</span>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Write your note for this moment..."
                      value={newNoteText}
                      onChange={(e) => setNewNoteText(e.target.value)}
                      className="text-sm"
                    />
                    <Button type="submit" size="sm" className="gap-1 font-semibold">
                      <Plus className="h-4 w-4" /> Save
                    </Button>
                  </div>
                </form>

                {notes.length > 0 ? (
                  <div className="space-y-3 divide-y divide-border/60">
                    {notes.map((note) => (
                      <div key={note.id} className="pt-3 flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              // Seek player
                              const video = document.querySelector('video');
                              if (video) video.currentTime = note.timestamp_seconds;
                            }}
                            className="text-xs font-mono font-bold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded"
                          >
                            {formatSeconds(note.timestamp_seconds)}
                          </button>
                          <p className="text-sm text-foreground">{note.text}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-muted-foreground hover:text-destructive p-1 transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No notes recorded yet. Add one at key insights to review later!
                  </p>
                )}
              </div>
            )}

            {/* Tab: Q&A */}
            {activeTab === 'qa' && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" /> Questions & Discussion
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ask a question related to &quot;{currentLecture?.title}&quot; or help other students.
                </p>
                <div className="flex gap-2">
                  <Input placeholder="Have a question? Search or post here..." className="text-sm" />
                  <Button size="sm" className="gap-1">
                    <Send className="h-4 w-4" /> Ask
                  </Button>
                </div>
              </div>
            )}

            {/* Tab: Resources */}
            {activeTab === 'resources' && (
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Download className="h-4 w-4 text-primary" /> Lecture Resources
                </h3>
                <div className="p-4 rounded-xl border bg-muted/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Architecture Cheatsheet & Code Patterns.pdf</p>
                      <p className="text-xs text-muted-foreground">2.4 MB • PDF Document</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs gap-1">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Curriculum Accordion Panel */}
        <aside className="lg:col-span-1 border-t lg:border-t-0 lg:border-l bg-card overflow-y-auto max-h-[85vh]">
          <div className="p-4 border-b font-bold text-sm flex items-center justify-between sticky top-0 bg-card z-10">
            <span>Course Content</span>
            <span className="text-xs text-muted-foreground font-normal">
              {completedLectureIds.size}/{allLecturesList.length} completed
            </span>
          </div>

          <div className="divide-y divide-border">
            {course?.sections?.map((section, sIdx) => (
              <div key={section.id}>
                <div className="p-3 bg-muted/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Section {sIdx + 1}: {section.title}
                </div>

                <div className="divide-y divide-border/40">
                  {section.lectures?.map((lecture) => {
                    const isActive = lecture.id === currentLecture?.id;
                    const isCompleted = completedLectureIds.has(lecture.id);

                    return (
                      <Link
                        key={lecture.id}
                        href={`/learn/${courseSlug}/${lecture.id}`}
                        className={`p-3.5 flex items-start gap-3 hover:bg-accent/50 transition text-xs block ${
                          isActive ? 'bg-primary/10 border-l-4 border-primary font-medium' : ''
                        }`}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCompletedLectureIds((prev) => {
                              const next = new Set(prev);
                              if (next.has(lecture.id)) next.delete(lecture.id);
                              else next.add(lecture.id);
                              return next;
                            });
                          }}
                          className="mt-0.5 text-muted-foreground hover:text-emerald-500 transition"
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                          ) : (
                            <Circle className="h-4 w-4" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1 space-y-1">
                          <p className={`line-clamp-2 ${isActive ? 'text-primary font-semibold' : 'text-foreground'}`}>
                            {lecture.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                            {lecture.lecture_type === 'video' ? (
                              <PlayCircle className="h-3 w-3" />
                            ) : lecture.lecture_type === 'quiz' ? (
                              <HelpCircle className="h-3 w-3" />
                            ) : (
                              <FileText className="h-3 w-3" />
                            )}
                            <span>{formatDuration(lecture.duration_seconds)}</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
