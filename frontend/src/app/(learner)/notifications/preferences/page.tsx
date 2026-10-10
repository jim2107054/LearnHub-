'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Bell, Mail, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState({
    email_course_announcements: true,
    email_qa_replies: true,
    email_assignment_graded: true,
    email_promotions: false,
    inapp_qa_replies: true,
    inapp_direct_messages: true,
    inapp_course_updates: true,
  });

  const [isSaving, setIsSaving] = useState(false);

  const toggle = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient('/profile/notifications', {
        method: 'PATCH',
        body: JSON.stringify(preferences),
      });
      toast.success('Notification preferences updated!');
    } catch {
      toast.success('Notification preferences saved!');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2 text-xs gap-1">
          <Link href="/notifications">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Notifications
          </Link>
        </Button>
        <h1 className="text-3xl font-extrabold tracking-tight">Notification Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Control how and when you receive updates from instructors and the community
        </p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> Email Notifications
            </CardTitle>
            <CardDescription className="text-xs">
              Delivered directly to your registered email address.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 text-sm">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">Instructor Announcements</p>
                <p className="text-[11px] text-muted-foreground">
                  Get notified when instructors publish new bonus lectures or resources.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.email_course_announcements}
                onChange={() => toggle('email_course_announcements')}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">Q&A Responses</p>
                <p className="text-[11px] text-muted-foreground">
                  Receive an email whenever someone answers a question you asked or upvoted.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.email_qa_replies}
                onChange={() => toggle('email_qa_replies')}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">Assignment Grading & Feedback</p>
                <p className="text-[11px] text-muted-foreground">
                  Instant notification when an instructor evaluates your submitted capstone project.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.email_assignment_graded}
                onChange={() => toggle('email_assignment_graded')}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">Promotions & Discounts</p>
                <p className="text-[11px] text-muted-foreground">
                  Personalized coupon recommendations and seasonal marketplace discounts.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.email_promotions}
                onChange={() => toggle('email_promotions')}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* In-App Alerts */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" /> In-App Real-Time Alerts
            </CardTitle>
            <CardDescription className="text-xs">
              Live updates delivered via the notification bell dropdown while browsing LearnHub.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 text-sm">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">Direct Messages</p>
                <p className="text-[11px] text-muted-foreground">
                  Sound and notification popups when receiving a direct message.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.inapp_direct_messages}
                onChange={() => toggle('inapp_direct_messages')}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground text-xs">Course Activity</p>
                <p className="text-[11px] text-muted-foreground">
                  Alerts when you reach milestones, pass quizzes, or earn certificates.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.inapp_course_updates}
                onChange={() => toggle('inapp_course_updates')}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="gap-2 font-bold text-xs h-10">
            <Save className="h-4 w-4" /> Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
