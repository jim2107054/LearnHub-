'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldAlert,
  Users,
  CheckSquare,
  Flag,
  DollarSign,
  Sliders,
  Scale,
  LayoutDashboard,
  LogOut,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AdminConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [impersonatingUser, setImpersonatingUser] = useState<string | null>(null);

  const navItems = [
    { href: '/admin', label: 'Platform KPIs', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users & Roles', icon: Users },
    { href: '/admin/course-reviews', label: 'Course Review Queue', icon: CheckSquare },
    { href: '/admin/moderation', label: 'Moderation Reports', icon: Flag },
    { href: '/admin/finance', label: 'Ledger & Payouts', icon: DollarSign },
    { href: '/admin/settings', label: 'Settings & Flags', icon: Sliders },
    { href: '/admin/dmca', label: 'DMCA 3-Strikes', icon: Scale },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col">
      {/* Impersonation Banner if active */}
      {impersonatingUser && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>
              AUDITED SESSION: Currently impersonating <strong>{impersonatingUser}</strong>. All API mutations are immutably logged.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setImpersonatingUser(null)}
            className="h-6 text-[10px] bg-slate-950 text-white hover:bg-slate-900 border-none"
          >
            Exit Impersonation
          </Button>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="h-16 border-b bg-card px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive text-destructive-foreground font-bold shadow">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-foreground">
              LearnHub <span className="text-destructive font-bold text-xs uppercase px-1.5 py-0.5 rounded bg-destructive/10">Staff Admin</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="text-xs h-8 gap-1.5">
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Storefront
            </Link>
          </Button>

          <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">
            Super Admin
          </Badge>
        </div>
      </header>

      {/* Admin Body */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card hidden md:flex flex-col justify-between p-4 sticky top-16 h-[calc(100vh-4rem)]">
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Staff Navigation
            </span>
            <nav className="mt-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      isActive
                        ? 'bg-destructive text-destructive-foreground shadow-sm'
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

          <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Compliance & Audit</p>
            <p className="text-[11px]">All administrative actions are sealed with HMAC audit logging.</p>
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
