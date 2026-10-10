'use client';

import React, { useState, useEffect } from 'react';
import { User, Shield, KeyRound, Download, Trash2, Smartphone, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient, ApiError } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'privacy'>('profile');

  // Profile Form state
  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // MFA State
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaQrUrl, setMfaQrUrl] = useState<string | null>(null);
  const [mfaConfirmCode, setMfaConfirmCode] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [mfaLoading, setMfaLoading] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<Array<{ id: number; device_name: string; ip_address: string; last_active_at: string; is_current: boolean }>>([]);

  // Data Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.headline || '');
      setBio(user.bio || '');
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const res = await apiClient<any>('/profile/sessions');
      setSessions(res.data || []);
    } catch {
      // Ignore in mock/disconnected mode
    }
  };

  useEffect(() => {
    if (activeTab === 'security') {
      loadSessions();
    }
  }, [activeTab]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(false);

    try {
      await apiClient('/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, headline, bio }),
      });
      setProfileSuccess(true);
      await refreshUser();
    } finally {
      setProfileLoading(false);
    }
  };

  const handleEnableMfa = async () => {
    setMfaLoading(true);
    try {
      const res = await apiClient<{ secret: string; qr_code_url: string }>('/auth/mfa/enable', {
        method: 'POST',
      });
      setMfaSecret(res.data.secret);
      setMfaQrUrl(res.data.qr_code_url);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleConfirmMfa = async () => {
    setMfaLoading(true);
    try {
      const res = await apiClient<{ recovery_codes: string[] }>('/auth/mfa/confirm', {
        method: 'POST',
        body: JSON.stringify({ code: mfaConfirmCode }),
      });
      setRecoveryCodes(res.data.recovery_codes);
      setMfaSecret(null);
      await refreshUser();
    } finally {
      setMfaLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await apiClient<any>('/profile/export-data', { method: 'POST' });
      // Trigger browser download
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `learnhub_data_export_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setExportSuccess(true);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Account & Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your profile, security credentials, and data privacy</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex flex-row md:flex-col gap-2 border-b md:border-b-0 md:border-r pb-4 md:pb-0 md:pr-4">
          <Button
            variant={activeTab === 'profile' ? 'secondary' : 'ghost'}
            className="justify-start gap-2"
            onClick={() => setActiveTab('profile')}
          >
            <User className="h-4 w-4" />
            Profile Details
          </Button>

          <Button
            variant={activeTab === 'security' ? 'secondary' : 'ghost'}
            className="justify-start gap-2"
            onClick={() => setActiveTab('security')}
          >
            <Shield className="h-4 w-4" />
            Security & MFA
          </Button>

          <Button
            variant={activeTab === 'privacy' ? 'secondary' : 'ghost'}
            className="justify-start gap-2"
            onClick={() => setActiveTab('privacy')}
          >
            <Download className="h-4 w-4" />
            Data & Privacy
          </Button>
        </aside>

        {/* Content Area */}
        <main className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Public Profile</CardTitle>
                <CardDescription>This information will appear on your student or instructor profile</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {profileSuccess && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Check className="h-4 w-4" />
                      <span>Profile updated successfully!</span>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Professional Headline</label>
                    <Input
                      placeholder="e.g. Senior Software Architect at Cloud Corp"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Bio</label>
                    <textarea
                      className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={4}
                      placeholder="Tell the community about your background and interests..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>

                  <Button type="submit" disabled={profileLoading}>
                    {profileLoading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* MFA Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Two-Factor Authentication (TOTP MFA)</CardTitle>
                      <CardDescription>Add an extra layer of protection using Google Authenticator or 1Password</CardDescription>
                    </div>
                    {user?.mfa_enabled ? (
                      <Badge variant="success">Enabled</Badge>
                    ) : (
                      <Badge variant="outline">Disabled</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!user?.mfa_enabled && !mfaSecret && (
                    <Button onClick={handleEnableMfa} disabled={mfaLoading} className="gap-2">
                      <KeyRound className="h-4 w-4" />
                      Setup Authenticator App
                    </Button>
                  )}

                  {mfaSecret && (
                    <div className="space-y-4 rounded-xl border p-4 bg-muted/20">
                      <p className="text-sm font-medium">Scan this QR code or enter the manual secret key into your authenticator app:</p>
                      <div className="font-mono text-sm bg-background p-3 rounded border select-all tracking-wider font-bold">
                        {mfaSecret}
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold">Enter 6-digit verification code:</label>
                        <div className="flex gap-3">
                          <Input
                            placeholder="123456"
                            maxLength={6}
                            value={mfaConfirmCode}
                            onChange={(e) => setMfaConfirmCode(e.target.value)}
                            className="max-w-xs font-mono"
                          />
                          <Button onClick={handleConfirmMfa} disabled={mfaLoading || mfaConfirmCode.length !== 6}>
                            Verify & Activate
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {recoveryCodes.length > 0 && (
                    <div className="space-y-2 rounded-xl border p-4 bg-amber-500/10 border-amber-500/30">
                      <p className="font-bold text-sm text-amber-700 dark:text-amber-400">Save your recovery codes in a safe place!</p>
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs p-3 bg-background rounded">
                        {recoveryCodes.map((code) => (
                          <span key={code}>{code}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Device Sessions */}
              <Card>
                <CardHeader>
                  <CardTitle>Active Devices & Sessions</CardTitle>
                  <CardDescription>Sessions currently signed in to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium text-sm">Current Browser Session</p>
                          <p className="text-xs text-muted-foreground">Active now</p>
                        </div>
                      </div>
                      <Badge variant="outline">This Device</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>GDPR Data Portability (SRS 7.2)</CardTitle>
                  <CardDescription>Download a machine-readable JSON archive containing all your personal data, enrollments, and certificates</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {exportSuccess && (
                    <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Check className="h-4 w-4" />
                      <span>Data archive downloaded successfully!</span>
                    </div>
                  )}

                  <Button onClick={handleExportData} disabled={isExporting} variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    {isExporting ? 'Compiling Archive...' : 'Export My Personal Data'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/30">
                <CardHeader>
                  <CardTitle className="text-destructive flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription>Permanently erase your account and revoke all course enrollments</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive" className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
