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
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-md">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              LearnHub
            </span>
          </Link>

          <Link href="/courses" className="hidden md:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Explore
          </Link>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block">
          <SearchAutocomplete />
        </div>

        {/* Actions & Navigation */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link href="/my-learning" className="hidden lg:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                My Learning
              </Link>

              {isInstructor ? (
                <Link href="/instructor/courses">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex gap-1.5">
                    <LayoutDashboard className="h-4 w-4" />
                    Studio
                  </Button>
                </Link>
              ) : (
                <Link href="/instructor/onboard">
                  <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                    Teach on LearnHub
                  </Button>
                </Link>
              )}

              {isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="hidden md:inline-flex text-xs">
                    Admin Console
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <Link href="/instructor/onboard">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                Teach on LearnHub
              </Button>
            </Link>
          )}

          {/* Cart Icon */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative" aria-label="Shopping Cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
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
                <Button variant="secondary" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{user?.name}</span>
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Log out">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
