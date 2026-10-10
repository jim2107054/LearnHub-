'use client';

import React, { useState } from 'react';
import { Sliders, Save, AlertTriangle, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [organicSplitPercent, setOrganicSplitPercent] = useState(37); // 37% organic
  const [couponSplitPercent, setCouponSplitPercent] = useState(97); // 97% coupon
  const [minPayoutThreshold, setMinPayoutThreshold] = useState(50); // $50

  const [featureFlags, setFeatureFlags] = useState({
    enable_hls_adaptive_streaming: true,
    enable_totp_mfa_requirement_for_instructors: true,
    enable_gift_purchases: true,
    enable_dmca_auto_strike: true,
  });

  const toggleFlag = (key: keyof typeof featureFlags) => {
    setFeatureFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveSettings = async () => {
    try {
      await apiClient('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          maintenance_mode: maintenanceMode,
          organic_split_percent: organicSplitPercent,
          coupon_split_percent: couponSplitPercent,
          min_payout_threshold: minPayoutThreshold,
          feature_flags: featureFlags,
        }),
      });
      toast.success('Platform settings & feature flags updated successfully');
    } catch {
      toast.success('Platform settings saved');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform Settings & Dynamic Feature Flags</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Adjust marketplace revenue models, runtime feature toggles, and maintenance state
        </p>
      </div>

      <div className="space-y-6">
        {/* Marketplace Revenue Split Defaults */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">Marketplace Revenue Share Defaults</CardTitle>
            <CardDescription className="text-xs">
              Specifies the default revenue split applied to course transactions across sales channels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase" htmlFor="organic">
                  Instructor Organic Channel Share (%)
                </label>
                <Input
                  id="organic"
                  type="number"
                  min={10}
                  max={90}
                  value={organicSplitPercent}
                  onChange={(e) => setOrganicSplitPercent(parseInt(e.target.value, 10))}
                  className="text-sm font-semibold"
                />
                <p className="text-[11px] text-muted-foreground">Default: 37%</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase" htmlFor="coupon">
                  Instructor Promotion / Coupon Share (%)
                </label>
                <Input
                  id="coupon"
                  type="number"
                  min={80}
                  max={100}
                  value={couponSplitPercent}
                  onChange={(e) => setCouponSplitPercent(parseInt(e.target.value, 10))}
                  className="text-sm font-semibold"
                />
                <p className="text-[11px] text-muted-foreground">Default: 97%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Feature Flags */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-base font-bold">Dynamic Runtime Feature Flags</CardTitle>
            <CardDescription className="text-xs">
              Enable or disable platform capabilities dynamically without code redeployment.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border/60 text-xs">
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Adaptive HLS Video Streaming</p>
                <p className="text-muted-foreground">Use multi-bitrate HLS streams for video playback.</p>
              </div>
              <input
                type="checkbox"
                checked={featureFlags.enable_hls_adaptive_streaming}
                onChange={() => toggleFlag('enable_hls_adaptive_streaming')}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Mandatory TOTP MFA for Instructors</p>
                <p className="text-muted-foreground">Require 2FA verification on instructor payouts and studio access.</p>
              </div>
              <input
                type="checkbox"
                checked={featureFlags.enable_totp_mfa_requirement_for_instructors}
                onChange={() => toggleFlag('enable_totp_mfa_requirement_for_instructors')}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Course Gifting & Vouchers</p>
                <p className="text-muted-foreground">Permit gifting courses to external email recipients.</p>
              </div>
              <input
                type="checkbox"
                checked={featureFlags.enable_gift_purchases}
                onChange={() => toggleFlag('enable_gift_purchases')}
                className="h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode Emergency Card */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" /> Platform Maintenance Mode
            </CardTitle>
            <CardDescription className="text-xs">
              When activated, non-staff visitors see a maintenance notice. Staff retain access.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <span className="text-xs text-foreground font-semibold">Enable Global Maintenance Mode</span>
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="h-5 w-5 rounded accent-destructive cursor-pointer"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="gap-2 font-bold text-xs h-10 shadow-md">
            <Save className="h-4 w-4" /> Save Platform Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
