'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  Search,
  Filter,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Answer {
  id: string;
  user_name: string;
  body: string;
  is_best_answer: boolean;
  upvotes: number;
  created_at: string;
}

interface Question {
  id: string;
  title: string;
  body: string;
  user_name: string;
  lecture_timestamp?: number;
  upvotes: number;
  answers_count: number;
  created_at: string;
  answers: Answer[];
}

interface QaBoardProps {
  courseSlug: string;
  lectureId?: string;
}

export function QaBoard({ courseSlug, lectureId }: QaBoardProps) {
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: 'q_1',
      title: 'How should connection pools be configured between Laravel and PostgreSQL pgpool-II?',
      body: 'When setting up 100 concurrent workers with Horizon, should the connection pool size match the worker count or be multiplexed through a transaction pooler?',
      user_name: 'David Chen',
      lecture_timestamp: 345,
      upvotes: 14,
      answers_count: 2,
      created_at: '2026-03-27T10:00:00Z',
      answers: [
        {
          id: 'ans_1',
          user_name: 'Alex Johnson (Instructor)',
          body: 'Use PgBouncer or pgpool in transaction pooling mode. This allows 100 Horizon workers to share 20 active PostgreSQL server backends without exhausting memory.',
          is_best_answer: true,
          upvotes: 18,
          created_at: '2026-03-27T12:00:00Z',
        },
      ],
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>('q_1');

  // Form states
  const [showAskForm, setShowAskForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [replyBody, setReplyBody] = useState<Record<string, string>>({});

  const handleUpvoteQuestion = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, upvotes: q.upvotes + 1 } : q))
    );
    toast.success('Upvoted question');
  };

  const handleUpvoteAnswer = (qId: string, ansId: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === ansId ? { ...a, upvotes: a.upvotes + 1 } : a
              ),
            }
          : q
      )
    );
    toast.success('Upvoted answer');
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;

    const newQ: Question = {
      id: `q_${Date.now()}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      user_name: 'You',
      upvotes: 1,
      answers_count: 0,
      created_at: new Date().toISOString(),
      answers: [],
    };

    setQuestions((prev) => [newQ, ...prev]);
    setNewTitle('');
    setNewBody('');
    setShowAskForm(false);
    toast.success('Question posted to Q&A discussion!');
  };

  const handlePostReply = (qId: string) => {
    const text = replyBody[qId];
    if (!text || !text.trim()) return;

    const newAns: Answer = {
      id: `ans_${Date.now()}`,
      user_name: 'You',
      body: text.trim(),
      is_best_answer: false,
      upvotes: 0,
      created_at: new Date().toISOString(),
    };

    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? {
              ...q,
              answers: [...q.answers, newAns],
              answers_count: q.answers_count + 1,
            }
          : q
      )
    );

    setReplyBody((prev) => ({ ...prev, [qId]: '' }));
    toast.success('Reply submitted!');
  };

  const filteredQuestions = questions.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search questions in this course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9"
          />
        </div>

        <Button
          onClick={() => setShowAskForm(!showAskForm)}
          size="sm"
          className="text-xs font-semibold gap-1.5"
        >
          <Plus className="h-4 w-4" /> Ask a New Question
        </Button>
      </div>

      {/* Ask Question Form */}
      {showAskForm && (
        <Card className="border-primary/40 bg-muted/20 animate-in fade-in duration-200">
          <CardContent className="p-6 space-y-4">
            <h4 className="font-bold text-sm">Ask a Question</h4>
            <form onSubmit={handleAskQuestion} className="space-y-3">
              <Input
                placeholder="Question title (e.g. Why does Redis TTL expire early?)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="text-xs font-semibold"
                required
              />
              <textarea
                rows={3}
                placeholder="Describe what you tried, the error message, and your environment setup..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                className="w-full rounded-md border border-input bg-background p-3 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAskForm(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="text-xs font-bold">
                  Post Question
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Questions Stream */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedQuestionId === q.id;

          return (
            <Card key={q.id} className="border-border overflow-hidden">
              <div className="p-4 sm:p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1">
                    <h5
                      onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                      className="font-bold text-sm text-foreground hover:text-primary cursor-pointer transition"
                    >
                      {q.title}
                    </h5>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {q.body}
                    </p>
                  </div>

                  {/* Upvote Button */}
                  <button
                    type="button"
                    onClick={() => handleUpvoteQuestion(q.id)}
                    className="flex flex-col items-center gap-0.5 rounded-lg border border-border px-2.5 py-1 text-xs hover:bg-muted transition"
                  >
                    <ThumbsUp className="h-3.5 w-3.5 text-primary" />
                    <span className="font-bold">{q.upvotes}</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                  <div className="flex items-center gap-3">
                    <span>Asked by {q.user_name}</span>
                    <span>•</span>
                    <span>{new Date(q.created_at).toLocaleDateString()}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className="text-primary font-semibold hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>{q.answers.length} {q.answers.length === 1 ? 'answer' : 'answers'}</span>
                  </button>
                </div>
              </div>

              {/* Expanded Answers Thread */}
              {isExpanded && (
                <div className="bg-muted/15 border-t p-4 sm:p-6 space-y-4">
                  {q.answers.map((ans) => (
                    <div
                      key={ans.id}
                      className={`p-4 rounded-xl border text-xs space-y-2 ${
                        ans.is_best_answer
                          ? 'border-emerald-500/40 bg-emerald-500/5'
                          : 'border-border/60 bg-card'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{ans.user_name}</span>
                          {ans.is_best_answer && (
                            <Badge className="bg-emerald-600 text-white text-[10px] gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Best Answer
                            </Badge>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleUpvoteAnswer(q.id, ans.id)}
                          className="flex items-center gap-1 text-muted-foreground hover:text-primary transition"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>{ans.upvotes}</span>
                        </button>
                      </div>

                      <p className="text-foreground/90 leading-relaxed">{ans.body}</p>
                    </div>
                  ))}

                  {/* Add Answer Box */}
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="Write your answer to help this student..."
                      value={replyBody[q.id] || ''}
                      onChange={(e) =>
                        setReplyBody((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      onClick={() => handlePostReply(q.id)}
                      className="text-xs font-semibold gap-1"
                    >
                      <Send className="h-3 w-3" /> Reply
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
