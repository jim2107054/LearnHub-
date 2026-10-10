'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cookie, ShieldCheck, Check, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface CookiePreferences {
  strictly_necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export function CookieConsentBanner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    strictly_necessary: true,
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if consent has already been given
    const saved = localStorage.getItem('learnhub_cookie_consent');
    if (!saved) {
      // Delay showing by 1s for pleasant initial page load
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = async (prefs: CookiePreferences) => {
    localStorage.setItem('learnhub_cookie_consent', JSON.stringify(prefs));
    setIsOpen(false);
    setShowPreferences(false);

    // Dispatch privacy event to backend (PRV-02)
    try {
      await apiClient('/analytics/events', {
        method: 'POST',
        body: JSON.stringify({
          event_type: 'cookie_consent_updated',
          payload: prefs,
        }),
      });
    } catch {
      // Non-blocking
    }
  };

  const handleAcceptAll = () => {
    saveConsent({
      strictly_necessary: true,
      analytics: true,
      marketing: true,
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      strictly_necessary: true,
      analytics: false,
      marketing: false,
    });
  };

  const handleSaveCustom = () => {
    saveConsent(preferences);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
      <Card className="border-border shadow-2xl bg-card/95 backdrop-blur-md border">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1 flex-1">
              <h4 className="font-bold text-sm text-foreground">Your Privacy Choices (GDPR & CCPA)</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We use cookies to ensure reliable authentication, secure payment sessions, and measure learning engagement. You can customize your preferences anytime.
              </p>
            </div>
          </div>

          {/* Granular Preferences Accordion */}
          {showPreferences && (
            <div className="divide-y divide-border/60 rounded-xl border bg-muted/20 p-3.5 text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <span className="font-semibold text-foreground">Strictly Necessary</span>
                  <p className="text-[11px] text-muted-foreground">Required for authentication sessions and CSRF security.</p>
                </div>
                <span className="font-bold text-emerald-600 text-[10px] uppercase">Always Active</span>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <span className="font-semibold text-foreground">Analytics & Retention Metrics</span>
                  <p className="text-[11px] text-muted-foreground">Helps instructors identify lecture drop-off bottlenecks.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <span className="font-semibold text-foreground">Marketing & Personalization</span>
                  <p className="text-[11px] text-muted-foreground">Tailored course recommendations and seasonal coupons.</p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                  className="h-4 w-4 rounded accent-primary cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <Settings className="h-3 w-3" />
              <span>{showPreferences ? 'Hide Options' : 'Customize Preferences'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {showPreferences ? (
                <Button size="sm" onClick={handleSaveCustom} className="text-xs font-bold w-full sm:w-auto">
                  Save My Preferences
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRejectNonEssential}
                    className="text-xs w-full sm:w-auto"
                  >
                    Essential Only
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAcceptAll}
                    className="text-xs font-bold w-full sm:w-auto"
                  >
                    Accept All
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
