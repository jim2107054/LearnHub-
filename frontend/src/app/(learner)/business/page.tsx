'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  Users,
  UserPlus,
  BookOpen,
  Calendar,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  group: string;
  assigned_courses: number;
  progress_percent: number;
  status: 'active' | 'invited';
}

export default function BusinessOrgPortalPage() {
  const [totalSeats] = useState(25);
  const [usedSeats, setUsedSeats] = useState(18);

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 'm1',
      name: 'Emma Watson',
      email: 'emma@acme-corp.com',
      group: 'Backend Engineering',
      assigned_courses: 3,
      progress_percent: 85,
      status: 'active',
    },
    {
      id: 'm2',
      name: 'Lucas Silva',
      email: 'lucas@acme-corp.com',
      group: 'DevOps & SRE',
      assigned_courses: 2,
      progress_percent: 60,
      status: 'active',
    },
    {
      id: 'm3',
      name: 'Amina Al-Mansoor',
      email: 'amina@acme-corp.com',
      group: 'Cloud Architecture',
      assigned_courses: 4,
      progress_percent: 100,
      status: 'active',
    },
    {
      id: 'm4',
      name: 'Noah Bennett',
      email: 'noah@acme-corp.com',
      group: 'Backend Engineering',
      assigned_courses: 1,
      progress_percent: 20,
      status: 'invited',
    },
  ]);

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteGroup, setInviteGroup] = useState('Backend Engineering');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    if (usedSeats >= totalSeats) {
      toast.error('All purchased team seats are allocated. Upgrade your plan to invite more members.');
      return;
    }

    const newMember: TeamMember = {
      id: `m_${Date.now()}`,
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      group: inviteGroup,
      assigned_courses: 1,
      progress_percent: 0,
      status: 'invited',
    };

    setMembers([...members, newMember]);
    setUsedSeats(usedSeats + 1);
    setInviteEmail('');
    setShowInviteModal(false);
    toast.success(`Invitation email sent to ${newMember.email}`);
  };

  const handleExportCsv = () => {
    const csvContent =
      'Name,Email,Group,Assigned Courses,Progress %,Status\n' +
      members
        .map(
          (m) =>
            `"${m.name}","${m.email}","${m.group}",${m.assigned_courses},${m.progress_percent}%,${m.status}`
        )
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-learning-progress-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Team progress report downloaded');
  };

  return (
    <div className="container py-10 max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold tracking-tight">LearnHub for Business</h1>
            <Badge className="bg-primary text-primary-foreground font-bold text-xs">Enterprise Org</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage enterprise seat allocation, learner groups, deadline assignments, and SSO authentication
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleExportCsv} variant="outline" size="sm" className="text-xs gap-1.5 h-9">
            <Download className="h-3.5 w-3.5" /> Progress Report (CSV)
          </Button>

          <Button
            onClick={() => setShowInviteModal(true)}
            size="sm"
            className="text-xs font-bold gap-1.5 h-9 shadow-md"
          >
            <UserPlus className="h-4 w-4" /> Invite Team Member
          </Button>
        </div>
      </div>

      {/* Seat Allocation & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground uppercase font-semibold">
              <span>Seat Allocation</span>
              <span>{usedSeats} / {totalSeats}</span>
            </div>
            <h3 className="text-2xl font-extrabold text-foreground">
              {totalSeats - usedSeats} seats remaining
            </h3>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.round((usedSeats / totalSeats) * 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Average Team Completion</span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-foreground">66.2%</h3>
              <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">+9% this month</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">Across 10 assigned masterclasses</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="p-5 pb-0 flex flex-row items-center justify-between space-y-0">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Enterprise SSO</span>
            <Badge className="bg-emerald-600 text-white text-[10px]">SAML 2.0 Active</Badge>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <p className="text-xs text-foreground font-semibold">Okta Identity Provider</p>
            <p className="text-[11px] text-muted-foreground">Single Sign-On enforced for all team domains</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members & Progress Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Team Learners & Progress Roster</CardTitle>
            <CardDescription className="text-xs">
              Monitor individual course progress and certification status
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Learner</th>
                  <th className="p-4">Group / Dept</th>
                  <th className="p-4">Assigned</th>
                  <th className="p-4">Completion Progress</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-muted/10 transition">
                    <td className="p-4">
                      <div>
                        <p className="font-bold text-foreground text-sm">{m.name}</p>
                        <p className="text-muted-foreground">{m.email}</p>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">{m.group}</td>
                    <td className="p-4 text-muted-foreground">{m.assigned_courses} courses</td>
                    <td className="p-4 w-48">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              m.progress_percent >= 100 ? 'bg-emerald-500' : 'bg-primary'
                            }`}
                            style={{ width: `${m.progress_percent}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold w-10 text-right">
                          {m.progress_percent}%
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={m.status === 'active' ? 'default' : 'secondary'}
                        className={m.status === 'active' ? 'bg-emerald-600 text-white' : ''}
                      >
                        {m.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-lg">Invite New Learner</h3>
            <p className="text-xs text-muted-foreground">
              An invitation email will be dispatched immediately. A seat will be allocated from your team pool.
            </p>

            <form onSubmit={handleInviteMember} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="email">
                  Employee Corporate Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="employee@acme-corp.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="group">
                  Department / Learner Group
                </label>
                <select
                  id="group"
                  value={inviteGroup}
                  onChange={(e) => setInviteGroup(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="Backend Engineering">Backend Engineering</option>
                  <option value="DevOps & SRE">DevOps & SRE</option>
                  <option value="Cloud Architecture">Cloud Architecture</option>
                  <option value="Product & Design">Product & Design</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  Send Invitation
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
