import React from 'react';
import Link from 'next/link';
import { BookOpen, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-[#1F1F2E] text-white py-12 md:py-16">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-12 border-b border-white/10">
          <div>
            <h4 className="font-bold text-sm mb-4 text-white">Learn</h4>
            <ul className="space-y-2.5 text-sm font-light text-white/70">
              <li><Link href="/courses?category=development" className="hover:text-white hover:underline transition-colors">Development</Link></li>
              <li><Link href="/courses?category=business" className="hover:text-white hover:underline transition-colors">Business</Link></li>
              <li><Link href="/courses?category=it-and-software" className="hover:text-white hover:underline transition-colors">IT & Software</Link></li>
              <li><Link href="/courses?category=design" className="hover:text-white hover:underline transition-colors">Design</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 text-white">Teach</h4>
            <ul className="space-y-2.5 text-sm font-light text-white/70">
              <li><Link href="/instructor/onboard" className="hover:text-white hover:underline transition-colors">Become an Instructor</Link></li>
              <li><Link href="/instructor/courses" className="hover:text-white hover:underline transition-colors">Instructor Studio</Link></li>
              <li><Link href="/help/teaching" className="hover:text-white hover:underline transition-colors">Teaching Guidelines</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 text-white">About LearnHub</h4>
            <ul className="space-y-2.5 text-sm font-light text-white/70">
              <li><Link href="/about" className="hover:text-white hover:underline transition-colors">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-white hover:underline transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white hover:underline transition-colors">Contact & Support</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-4 text-white">Legal & Trust</h4>
            <ul className="space-y-2.5 text-sm font-light text-white/70">
              <li><Link href="/terms" className="hover:text-white hover:underline transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white hover:underline transition-colors">Privacy Policy</Link></li>
              <li><Link href="/cookies" className="hover:text-white hover:underline transition-colors">Cookie Settings</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Udemy style language button and logo */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-light text-white/60">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-btn bg-brand text-white font-bold">
              <BookOpen className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">Learn<span className="text-brand">Hub</span></span>
            <span className="ml-2">&copy; {new Date().getFullYear()} LearnHub, Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              className="inline-flex items-center gap-2 border border-white/30 px-3.5 py-2 rounded-btn text-white hover:bg-white/10 transition-colors text-xs font-medium"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>English</span>
            </button>
            <span className="text-white/60">USD ($)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
