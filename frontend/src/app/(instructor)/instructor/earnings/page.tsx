'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Download,
  CreditCard,
  FileCheck,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function InstructorEarningsPage() {
  const earningsData = {
    grossSales: 3840000, // $38,400.00
    platformFees: 1351000, // Platform split
    refundReserve: 120000, // 30-day hold ($1,200.00)
    availableForPayout: 2369000, // $23,690.00
    totalPaidOut: 1845000, // $18,450.00
    taxStatus: 'verified' as const, // W-9 verified
    payoutMethod: 'Stripe Connect (Bank •••• 5678)',
  };

  const payoutHistory = [
    {
      id: 'po_1',
      date: '2026-03-01T00:00:00Z',
      amount: 485000,
      currency: 'USD',
      status: 'completed',
      method: 'Direct Deposit •••• 5678',
      reference: 'LH-PAYOUT-20260301-4850',
    },
    {
      id: 'po_2',
      date: '2026-02-01T00:00:00Z',
      amount: 420000,
      currency: 'USD',
      status: 'completed',
      method: 'Direct Deposit •••• 5678',
      reference: 'LH-PAYOUT-20260201-4200',
    },
    {
      id: 'po_3',
      date: '2026-01-01T00:00:00Z',
      amount: 390000,
      currency: 'USD',
      status: 'completed',
      method: 'Direct Deposit •••• 5678',
      reference: 'LH-PAYOUT-20260101-3900',
    },
  ];

  const handleDownloadStatement = (reference: string) => {
    toast.success(`Statement ${reference}.pdf downloaded`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Earnings & Payouts</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Track revenue shares, 30-day refund hold reserves, tax profile, and payout batches
          </p>
        </div>

        <Button
          onClick={() => toast.success('Payout statements archive generated')}
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 h-9"
        >
          <Download className="h-3.5 w-3.5" /> Download Tax Statements
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Available for Payout</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatPrice(earningsData.availableForPayout, 'USD')}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium">Scheduled for next payout cycle (1st)</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Total Paid Out</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatPrice(earningsData.totalPaidOut, 'USD')}
            </h3>
            <p className="text-[11px] text-muted-foreground">3 completed payout cycles</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Refund Reserve (30-Day Hold)</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatPrice(earningsData.refundReserve, 'USD')}
            </h3>
            <p className="text-[11px] text-muted-foreground">Matures after 30 days per policy</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-5 space-y-1">
            <span className="text-xs text-muted-foreground uppercase font-semibold">Lifetime Gross Sales</span>
            <h3 className="text-2xl font-extrabold text-foreground">
              {formatPrice(earningsData.grossSales, 'USD')}
            </h3>
            <p className="text-[11px] text-muted-foreground">Combined organic + coupon sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Profile & Payout Method Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-emerald-500" />
              <span>Tax Profile Status</span>
            </CardTitle>
            <Badge className="bg-emerald-600 text-white text-[10px]">W-9 Verified</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-muted-foreground">
              Your Form W-9 (US Taxpayer) is fully verified and compliant for calendar year 2026.
            </p>
            <div className="pt-2 border-t flex items-center justify-between">
              <span className="text-muted-foreground">Withholding Rate:</span>
              <span className="font-mono font-bold text-foreground">0% (US Citizen/Entity)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <span>Payout Destination</span>
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">Stripe Express</Badge>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <p className="text-foreground font-semibold">{earningsData.payoutMethod}</p>
            <p className="text-muted-foreground">
              Automatic transfers run on the 1st of every month for balances exceeding $50.00.
            </p>
            <div className="pt-2 border-t">
              <Button
                variant="link"
                size="sm"
                onClick={() => toast.info('Redirecting to Stripe Express Dashboard...')}
                className="text-xs p-0 h-auto gap-1 text-primary hover:underline"
              >
                <span>Manage banking in Stripe Dashboard</span>
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Payout Statements Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-base font-bold">Payout Statement History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b font-semibold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-4">Payout Date</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Destination</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payoutHistory.map((po) => (
                  <tr key={po.id} className="hover:bg-muted/10 transition">
                    <td className="p-4 font-medium text-foreground">
                      {new Date(po.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="p-4 font-mono text-muted-foreground">{po.reference}</td>
                    <td className="p-4 text-muted-foreground">{po.method}</td>
                    <td className="p-4 font-bold text-foreground">
                      {formatPrice(po.amount, po.currency)}
                    </td>
                    <td className="p-4">
                      <Badge className="bg-emerald-600 text-white text-[10px] capitalize">
                        {po.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadStatement(po.reference)}
                        className="text-xs gap-1 h-7"
                      >
                        <Download className="h-3 w-3" /> PDF
                      </Button>
                    </td>
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
