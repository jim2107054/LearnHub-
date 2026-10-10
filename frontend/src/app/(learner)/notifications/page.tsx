'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCircle2,
  MessageSquare,
  Award,
  BookOpen,
  Sparkles,
  Settings,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface NotificationItem {
  id: string;
  type: 'qa_reply' | 'announcement' | 'assignment_graded' | 'review_reply' | 'system';
  title: string;
  message: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'ntf_1',
      type: 'qa_reply',
      title: 'New Reply to Your Question',
      message: 'Alex Johnson replied: "Use PgBouncer in transaction pooling mode for 100 workers."',
      link_url: '/learn/cloud-architecture-masterclass',
      is_read: false,
      created_at: '2026-03-28T11:20:00Z',
    },
    {
      id: 'ntf_2',
      type: 'assignment_graded',
      title: 'Capstone Project Graded',
      message: 'Your project "Multi-Region High-Availability Architecture" scored 95/100.',
      link_url: '/learn/cloud-architecture-masterclass/assignment/assign_1',
      is_read: false,
      created_at: '2026-03-27T18:00:00Z',
    },
    {
      id: 'ntf_3',
      type: 'announcement',
      title: 'New Bonus Lecture Added!',
      message: 'Alex Johnson added a new module: "Zero-Downtime Database Migrations with Neon".',
      link_url: '/courses/cloud-architecture-masterclass',
      is_read: true,
      created_at: '2026-03-25T09:30:00Z',
    },
  ]);

  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success('All notifications marked as read');
  };

  const handleMarkSingleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const filtered = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'qa_reply':
        return <MessageSquare className="h-5 w-5 text-primary" />;
      case 'assignment_graded':
        return <Award className="h-5 w-5 text-emerald-500" />;
      case 'announcement':
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-amber-500" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-primary text-primary-foreground font-bold text-xs">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with course announcements, instructor replies, and grades
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="text-xs font-semibold gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}

          <Button asChild variant="ghost" size="sm" className="text-xs gap-1.5">
            <Link href="/notifications/preferences">
              <Settings className="h-3.5 w-3.5" /> Preferences
            </Link>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-3 py-1.5 rounded-full transition ${
            activeFilter === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/40 text-muted-foreground hover:bg-muted'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveFilter('unread')}
          className={`px-3 py-1.5 rounded-full transition ${
            activeFilter === 'unread'
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/40 text-muted-foreground hover:bg-muted'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <Card
              key={item.id}
              className={`border transition hover:shadow-md ${
                !item.is_read ? 'bg-primary/5 border-primary/20' : 'border-border/60'
              }`}
            >
              <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 rounded-full bg-muted/60 items-center justify-center flex-shrink-0">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm text-foreground truncate">{item.title}</h4>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(item.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>

                  {item.link_url && (
                    <div className="pt-2">
                      <Link
                        href={item.link_url}
                        onClick={() => handleMarkSingleRead(item.id)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>View details</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-16 text-center border rounded-2xl bg-muted/10 p-8 space-y-3">
            <Bell className="h-8 w-8 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-sm">No notifications</h3>
            <p className="text-xs text-muted-foreground">
              You are all caught up! When instructors reply or announcements drop, they will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
