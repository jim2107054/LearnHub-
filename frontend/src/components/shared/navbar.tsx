'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, BookOpen, Sun, Moon, LogOut, User as UserIcon, LayoutDashboard } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { SearchAutocomplete } from './search-autocomplete';

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isInstructor = user?.roles?.some((r) => r.name === 'instructor');
  const isAdmin = user?.roles?.some((r) => r.name === 'admin' || r.name === 'super_admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-hairline bg-white/95 backdrop-blur dark:bg-[#0F0F10]/95 transition-colors">
      <div className="container flex h-[72px] items-center justify-between gap-4 md:gap-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-brand text-white font-bold transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-ink dark:text-white">
              Learn<span className="text-brand">Hub</span>
            </span>
          </Link>

          <Link
            href="/courses"
            className="hidden md:inline-flex text-sm font-medium text-ink/80 hover:text-link-hover hover:underline transition-colors"
          >
            Explore
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-lg hidden sm:block">
          <SearchAutocomplete />
        </div>

        {/* Actions & Navigation */}
        <div className="flex items-center gap-2 md:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                href="/my-learning"
                className="hidden lg:inline-flex text-sm font-medium text-ink/80 hover:text-link-hover hover:underline transition-colors px-2"
              >
                My Learning
              </Link>

              {isInstructor ? (
                <Link href="/instructor/courses">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5 h-10">
                    <LayoutDashboard className="h-4 w-4" />
                    Studio
                  </Button>
                </Link>
              ) : (
                <Link href="/instructor/onboard">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex h-10 text-sm">
                    Teach on LearnHub
                  </Button>
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="hidden md:inline-flex text-xs h-9">
                    Admin Console
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <Link href="/instructor/onboard">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex h-10 text-sm font-medium">
                Teach on LearnHub
              </Button>
            </Link>
          )}

          {/* Cart Icon */}
          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-full hover:bg-surface text-ink dark:text-white"
              aria-label="Shopping Cart"
            >
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full hover:bg-surface text-ink dark:text-white"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          )}

          {/* User Auth Buttons or Menu */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/profile">
                <Button variant="secondary" size="sm" className="gap-2 h-10 rounded-btn">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{user?.name}</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => logout()}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="outline" size="sm" className="h-10 px-4 text-sm font-bold border-ink text-ink hover:bg-black/5">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="default" size="sm" className="h-10 px-4 text-sm font-bold bg-ink text-white hover:bg-ink/90">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
