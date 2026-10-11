'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CookiesPage() {
  const [preferences, setPreferences] = useState({
    strictlyNecessary: true,
    functional: true,
    performance: true,
    targeting: false,
  });

  const handleSave = () => {
    localStorage.setItem('learnhub_cookie_preferences', JSON.stringify(preferences));
    toast.success('Your cookie preferences have been saved.');
  };

  return (
    <div className="bg-canvas min-h-screen text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5] py-16">
      <div className="container max-w-4xl space-y-8">
        <div className="border-b border-hairline pb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink dark:text-white">
            Cookie Policy & Preferences
          </h1>
          <p className="text-sm font-light text-muted-foreground mt-2">
            Manage your cookie settings and understand how LearnHub uses cookies.
          </p>
        </div>

        <div className="space-y-6">
          <Card className="p-6 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-ink dark:text-white">Strictly Necessary Cookies</h3>
                <p className="text-xs text-muted-foreground font-light">
                  Required for user authentication, security, and cart session persistence.
                </p>
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase">Always Active</span>
            </div>
          </Card>

          <Card className="p-6 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-ink dark:text-white">Functional Cookies</h3>
                <p className="text-xs text-muted-foreground font-light">
                  Remember playback speed, volume preferences, and dark/light color themes.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.functional}
                onChange={(e) => setPreferences({ ...preferences, functional: e.target.checked })}
                className="h-5 w-5 accent-brand cursor-pointer"
              />
            </div>
          </Card>

          <Card className="p-6 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-ink dark:text-white">Performance & Analytics Cookies</h3>
                <p className="text-xs text-muted-foreground font-light">
                  Measure video loading latency, error crash reports, and catalog discovery.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.performance}
                onChange={(e) => setPreferences({ ...preferences, performance: e.target.checked })}
                className="h-5 w-5 accent-brand cursor-pointer"
              />
            </div>
          </Card>

          <Card className="p-6 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-ink dark:text-white">Marketing & Targeting Cookies</h3>
                <p className="text-xs text-muted-foreground font-light">
                  Used by our ad partners to display relevant course promotions on social media.
                </p>
              </div>
              <input
                type="checkbox"
                checked={preferences.targeting}
                onChange={(e) => setPreferences({ ...preferences, targeting: e.target.checked })}
                className="h-5 w-5 accent-brand cursor-pointer"
              />
            </div>
          </Card>

          <div className="pt-4 flex gap-4">
            <Button
              onClick={handleSave}
              size="lg"
              className="h-12 px-6 rounded-btn bg-ink text-white font-bold hover:bg-ink/90 active:bg-btn-active"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
