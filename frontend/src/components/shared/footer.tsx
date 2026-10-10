import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-muted/20">
      <div className="container py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-semibold text-sm mb-3">Learn</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/courses?category=development" className="hover:text-foreground">Development</Link></li>
              <li><Link href="/courses?category=business" className="hover:text-foreground">Business</Link></li>
              <li><Link href="/courses?category=it-and-software" className="hover:text-foreground">IT & Software</Link></li>
              <li><Link href="/courses?category=design" className="hover:text-foreground">Design</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Teach</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/instructor/onboard" className="hover:text-foreground">Become an Instructor</Link></li>
              <li><Link href="/instructor/courses" className="hover:text-foreground">Instructor Studio</Link></li>
              <li><Link href="/help/teaching" className="hover:text-foreground">Teaching Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">About LearnHub</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-foreground">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-foreground">Contact & Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-3">Legal & Trust</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/terms" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-foreground">Cookie Settings</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="font-semibold text-foreground">LearnHub Inc.</span>
            <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <span>English (US)</span>
            <span>USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
