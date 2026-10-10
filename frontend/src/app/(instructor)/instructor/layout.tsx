'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  DollarSign,
  Tag,
  MessageSquare,
  Settings,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';

export default function InstructorStudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  const navItems = [
    { href: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/instructor/courses', label: 'Courses', icon: BookOpen },
    { href: '/instructor/analytics', label: 'Analytics & Heatmap', icon: BarChart3 },
    { href: '/instructor/earnings', label: 'Earnings & Payouts', icon: DollarSign },
    { href: '/instructor/coupons', label: 'Coupons', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-muted/15 flex flex-col">
      {/* Top Studio Bar */}
      <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/instructor" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-foreground">
              LearnHub <span className="text-primary font-normal text-xs uppercase px-1.5 py-0.5 rounded bg-primary/10">Studio</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="text-xs h-8 gap-1.5">
            <Link href="/my-learning">
              <ArrowLeft className="h-3.5 w-3.5" /> Switch to Learner
            </Link>
          </Button>

          <div className="flex items-center gap-2 pl-2 border-l">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
              {user?.name?.charAt(0) || 'I'}
            </div>
            <span className="text-xs font-semibold text-foreground hidden sm:inline">
              {user?.name || 'Instructor'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 flex">
        {/* Studio Sidebar */}
        <aside className="w-64 border-r bg-card hidden md:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Instructor Studio
            </span>
            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/instructor' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="rounded-xl border bg-muted/30 p-3 space-y-2 text-xs">
            <p className="font-semibold text-foreground">Need help authoring?</p>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              Check out our best practices guide on high-retention video production.
            </p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
