import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookie from Laravel Sanctum / session
  const hasSession = request.cookies.has('learnhub_session') || request.cookies.has('laravel_session');

  // Protect student / learning routes
  if (pathname.startsWith('/my-learning') || pathname.startsWith('/learn/')) {
    if (!hasSession) {
      const url = new URL('/login', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect instructor routes
  if (pathname.startsWith('/instructor/courses') || pathname.startsWith('/instructor/earnings')) {
    if (!hasSession) {
      const url = new URL('/login', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!hasSession) {
      const url = new URL('/login', request.url);
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/my-learning/:path*', '/learn/:path*', '/instructor/:path*', '/admin/:path*'],
};
