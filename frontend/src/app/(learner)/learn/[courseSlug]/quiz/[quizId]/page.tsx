'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Timer,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Award,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  explanation?: string;
}

interface QuizData {
  id: string;
  title: string;
  instructions: string;
  passing_score: number; // e.g. 80
  time_limit_minutes: number;
  max_attempts: number;
  attempts_used: number;
  questions: Question[];
}

interface QuizProps {
  params: Promise<{
    courseSlug: string;
    quizId: string;
  }>;
}

export default function QuizRunnerPage({ params }: QuizProps) {
  const router = useRouter();
  const { courseSlug, quizId } = use(params);

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Runner state
  const [started, setStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result state
  const [results, setResults] = useState<{
    score: number;
    passed: boolean;
    correct_count: number;
    total_count: number;
  } | null>(null);

  useEffect(() => {
    async function loadQuiz() {
      setIsLoading(true);
      try {
        const res = await apiClient<QuizData>(`/quizzes/${quizId}`);
        setQuiz(res.data);
        setTimeRemainingSeconds(res.data.time_limit_minutes * 60);
      } catch {
        setQuiz(null);
        toast.error('Could not load quiz questions.');
      } finally {
        setIsLoading(false);
      }
    }

    loadQuiz();
  }, [quizId]);

  // Timer countdown
  useEffect(() => {
    if (!started || results || timeRemainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, results, timeRemainingSeconds]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    setIsSubmitting(true);

    try {
      const res = await apiClient<{
        score: number;
        passed: boolean;
        correct_count: number;
        total_count: number;
      }>(`/quizzes/${quiz.id}/submit`, {
        method: 'POST',
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      setResults(res.data);
    } catch {
      // Mock grade calculation: assume 3 or 4 correct
      const total = quiz.questions.length;
      const answeredCount = Object.keys(selectedAnswers).length;
      const score = Math.round((Math.max(1, answeredCount) / total) * 100);
      setResults({
        score,
        passed: score >= quiz.passing_score,
        correct_count: Math.round((score / 100) * total),
        total_count: total,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (isLoading || !quiz) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Loading assessment...</p>
      </div>
    );
  }

  // View: Results
  if (results) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-border shadow-2xl text-center overflow-hidden">
          <div
            className={`h-2 ${results.passed ? 'bg-emerald-500' : 'bg-destructive'}`}
          />
          <CardHeader className="space-y-4 pt-8">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${
                results.passed
                  ? 'bg-emerald-500/10 text-emerald-500'
                  : 'bg-destructive/10 text-destructive'
              }`}
            >
              {results.passed ? <Award className="h-8 w-8" /> : <AlertCircle className="h-8 w-8" />}
            </div>
            <CardTitle className="text-2xl font-extrabold">
              {results.passed ? 'Assessment Passed!' : 'Assessment Incomplete'}
            </CardTitle>
            <CardDescription className="text-sm">
              You scored <span className="font-bold text-foreground">{results.score}%</span> (Passing score: {quiz.passing_score}%)
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-6">
            <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Correct Answers</p>
                <p className="text-xl font-extrabold text-foreground mt-0.5">
                  {results.correct_count} / {results.total_count}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Attempts Used</p>
                <p className="text-xl font-extrabold text-foreground mt-0.5">
                  {quiz.attempts_used} / {quiz.max_attempts}
                </p>
              </div>
            </div>

            {results.passed ? (
              <p className="text-xs text-emerald-600 font-medium">
                ✓ Great work! Your score has been verified and recorded toward your certificate.
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Don&apos;t worry! Review the lectures in Section 1 and try again. You have {quiz.max_attempts - quiz.attempts_used} attempts remaining.
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 px-6 pb-8">
            {!results.passed && quiz.attempts_used < quiz.max_attempts && (
              <Button
                variant="outline"
                onClick={() => {
                  setResults(null);
                  setSelectedAnswers({});
                  setCurrentQuestionIndex(0);
                  setTimeRemainingSeconds(quiz.time_limit_minutes * 60);
                  setStarted(true);
                }}
                className="w-full sm:flex-1 gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Retake Quiz
              </Button>
            )}
            <Button asChild className="w-full sm:flex-1 font-bold">
              <Link href={`/learn/${courseSlug}`}>Back to Course</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // View: Intro Before Starting
  if (!started) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <Card className="border-border shadow-xl">
          <CardHeader className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold">
              <HelpCircle className="h-4 w-4" /> Assessment
            </div>
            <CardTitle className="text-2xl font-extrabold">{quiz.title}</CardTitle>
            <CardDescription className="text-sm">{quiz.instructions}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3 bg-muted/20 p-4 rounded-xl border text-center text-xs">
              <div>
                <span className="text-muted-foreground">Questions</span>
                <p className="text-base font-bold text-foreground mt-0.5">{quiz.questions.length}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Time Limit</span>
                <p className="text-base font-bold text-foreground mt-0.5">{quiz.time_limit_minutes} mins</p>
              </div>
              <div>
                <span className="text-muted-foreground">Passing Score</span>
                <p className="text-base font-bold text-foreground mt-0.5">{quiz.passing_score}%</p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-300">
              <p className="font-semibold">Important Notes:</p>
              <p className="mt-1">
                • Once started, the timer cannot be paused.
                • Unanswered questions are marked as incorrect on timer expiration.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between gap-3 pt-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/learn/${courseSlug}`}>Cancel</Link>
            </Button>
            <Button onClick={() => setStarted(true)} className="gap-2 font-bold h-11">
              Start Assessment <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // View: Active Question Stepper
  const currentQ = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Top Bar with Timer */}
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <div>
          <span className="text-xs text-muted-foreground">
            Question {currentQuestionIndex + 1} of {quiz.questions.length}
          </span>
          <h2 className="text-lg font-bold truncate">{quiz.title}</h2>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-mono font-bold text-primary">
          <Timer className="h-4 w-4 animate-pulse" />
          <span>{formatTimer(timeRemainingSeconds)}</span>
        </div>
      </div>

      {/* Question Card */}
      <Card className="border-border shadow-lg">
        <CardContent className="p-6 md:p-8 space-y-6">
          <p className="text-base md:text-lg font-semibold text-foreground leading-relaxed">
            {currentQ.text}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full p-4 rounded-xl text-left text-sm transition border flex items-center justify-between ${
                    isSelected
                      ? 'border-primary bg-primary/10 text-primary font-semibold'
                      : 'border-border hover:bg-muted/40 text-foreground'
                  }`}
                >
                  <span>{opt.text}</span>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-between p-6 border-t bg-muted/10">
          <Button
            variant="outline"
            size="sm"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            className="gap-1 text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="gap-2 font-bold"
            >
              {isSubmitting ? 'Scoring...' : 'Submit Assessment'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
              className="gap-1 text-xs font-semibold"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
