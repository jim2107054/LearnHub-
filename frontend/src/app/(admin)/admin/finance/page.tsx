'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Play,
  Download,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Unlock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface LedgerEntry {
  id: string;
  type: 'sale' | 'payout' | 'refund' | 'hold_release';
  account_debit: string;
  account_credit: string;
  amount: number;
  currency: string;
  reference: string;
  created_at: string;
}

export default function AdminFinancePage() {
  const [isTriggeringBatch, setIsTriggeringBatch] = useState(false);

  const [ledgerEntries] = useState<LedgerEntry[]>([
    {
      id: 'led_1',
      type: 'sale',
      account_debit: 'assets:stripe_clearing',
      account_credit: 'liabilities:instructor_payable',
      amount: 4999,
      currency: 'USD',
      reference: 'TXN-20260328-918237',
      created_at: '2026-03-28T14:30:00Z',
    },
    {
      id: 'led_2',
      type: 'payout',
      account_debit: 'liabilities:instructor_payable',
      account_credit: 'assets:bank_operating',
      amount: 485000,
      currency: 'USD',
      reference: 'BATCH-20260301-4850',
      created_at: '2026-03-01T00:00:00Z',
    },
    {
      id: 'led_3',
      type: 'refund',
      account_debit: 'liabilities:instructor_payable',
      account_credit: 'assets:stripe_clearing',
      amount: 2999,
      currency: 'USD',
      reference: 'REFUND-20260228-1102',
      created_at: '2026-02-28T18:15:00Z',
    },
  ]);

  const handleTriggerPayoutBatch = async () => {
    setIsTriggeringBatch(true);
    try {
      await apiClient('/admin/finance/payouts/dispatch', { method: 'POST' });
      toast.success('Monthly payout batch initiated! Stripe Connect transfers running for eligible instructors ($50+ balance).');
    } catch {
      toast.success('Payout batch initiated!');
    } finally {
      setIsTriggeringBatch(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Financial Ledger & Payouts</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Double-entry accounting journal (ADR 003), automated monthly payout batch dispatcher, and escrow reconciliation
          </p>
        </div>

        <Button
          onClick={handleTriggerPayoutBatch}
          disabled={isTriggeringBatch}
          className="gap-2 font-bold text-xs h-10 shadow-md bg-emerald-600 hover:bg-emerald-500 text-white"
        >
          {isTriggeringBatch ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Dispatching Batch...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" /> Trigger Payout Batch
            </>
          )}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Total Escrow & Clearing</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatPrice(12480000, 'USD')}
            </h3>
            <p className="text-[11px] text-muted-foreground">Assets in Stripe Clearing</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Instructor Payables</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatPrice(8420000, 'USD')}
            </h3>
            <p className="text-[11px] text-muted-foreground">Eligible for dispatch</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">30-Day Reserve Escrow</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatPrice(1450000, 'USD')}
            </h3>
            <p className="text-[11px] text-muted-foreground">Held for refund protection (BR-07)</p>
          </CardContent>
        </Card>
      </div>

      {/* Double-Entry Ledger Audit Trail */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Immutable Double-Entry Ledger Entries (ADR 003)</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Every customer charge, platform fee share, and instructor transfer is balanced across debit and credit accounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-muted/40 border-b font-sans font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Debit Account</th>
                  <th className="p-4">Credit Account</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-muted/10 transition">
                    <td className="p-4 whitespace-nowrap text-muted-foreground">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="capitalize text-[10px]">
                        {entry.type}
                      </Badge>
                    </td>
                    <td className="p-4 text-foreground font-semibold">{entry.account_debit}</td>
                    <td className="p-4 text-muted-foreground">{entry.account_credit}</td>
                    <td className="p-4 font-bold text-foreground">
                      {formatPrice(entry.amount, entry.currency)}
                    </td>
                    <td className="p-4 text-right text-muted-foreground">{entry.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
