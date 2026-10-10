'use client';

import React, { useState } from 'react';
import {
  Scale,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  FileText,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface DmcaCase {
  id: string;
  claimant: string;
  course_id: string;
  course_title: string;
  instructor_name: string;
  strike_number: number;
  status: 'notice_received' | 'taken_down' | 'counter_notice_filed' | 'resolved';
  created_at: string;
}

export default function AdminDmcaPage() {
  const [cases, setCases] = useState<DmcaCase[]>([
    {
      id: 'dmca_1',
      claimant: 'TechMedia Copyright Group LLC',
      course_id: 'crs_89',
      course_title: 'Stolen Code Base & Leaked Architecture',
      instructor_name: 'UnverifiedInstructor42',
      strike_number: 2,
      status: 'taken_down',
      created_at: '2026-03-24T10:00:00Z',
    },
    {
      id: 'dmca_2',
      claimant: 'Cloud Authors Guild',
      course_id: 'crs_92',
      course_title: 'Mirror: Full System Design',
      instructor_name: 'PirateDev',
      strike_number: 3,
      status: 'taken_down',
      created_at: '2026-03-27T15:20:00Z',
    },
  ]);

  const handleIssueStrike = (dmcaCase: DmcaCase) => {
    const nextStrike = dmcaCase.strike_number + 1;
    if (nextStrike >= 3) {
      toast.error(`3 Strikes Reached! Account ${dmcaCase.instructor_name} automatically banned and courses purged.`);
    } else {
      toast.warning(`Strike ${nextStrike} issued to ${dmcaCase.instructor_name}.`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">DMCA & 3-Strike Copyright Enforcement</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Review legal infringement takedown notices, counter-notices, and enforce automatic 3-strike account termination
        </p>
      </div>

      {/* 3-Strikes Policy Rule Alert */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="p-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-500/20 text-amber-600 flex items-center justify-center flex-shrink-0">
            <Scale className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 text-xs">
            <h3 className="font-bold text-sm text-foreground">
              Statutory 3-Strike Copyright Policy (ADM-04)
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              When a verified DMCA takedown notice is upheld, the infringing course is immediately unlisted. Instructors who accumulate 3 verified strikes suffer permanent account termination, forfeiture of pending balances, and marketplace expulsion.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4">Claimant</th>
                <th className="p-4">Target Course</th>
                <th className="p-4">Instructor</th>
                <th className="p-4">Strike Tier</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {cases.map((c) => (
                <tr key={c.id} className="hover:bg-muted/10 transition">
                  <td className="p-4 font-semibold text-foreground">{c.claimant}</td>
                  <td className="p-4 max-w-xs truncate">{c.course_title}</td>
                  <td className="p-4 font-medium text-foreground">{c.instructor_name}</td>
                  <td className="p-4">
                    <Badge
                      variant={c.strike_number >= 3 ? 'destructive' : 'secondary'}
                      className={c.strike_number >= 3 ? 'bg-destructive text-white font-bold' : ''}
                    >
                      {c.strike_number} of 3 Strikes
                    </Badge>
                  </td>
                  <td className="p-4">
                    <Badge variant="outline" className="capitalize text-[10px]">
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleIssueStrike(c)}
                      className="text-xs h-7 text-destructive border-destructive/30 hover:bg-destructive/10"
                    >
                      Process Strike
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
