'use client';

import React, { useState } from 'react';
import { Tag, Plus, CheckCircle2, Clock, Trash2, Copy, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CouponItem {
  id: string;
  code: string;
  discount_percent: number;
  usage_count: number;
  max_uses: number;
  expires_at: string;
  is_active: boolean;
}

export default function InstructorCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>([
    {
      id: 'c1',
      code: 'SPRINGLAUNCH2026',
      discount_percent: 25,
      usage_count: 142,
      max_uses: 500,
      expires_at: '2026-04-30T23:59:59Z',
      is_active: true,
    },
    {
      id: 'c2',
      code: 'DEVCOMMUNITY50',
      discount_percent: 50,
      usage_count: 89,
      max_uses: 100,
      expires_at: '2026-04-15T23:59:59Z',
      is_active: true,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [maxUses, setMaxUses] = useState(100);
  const [expiryDate, setExpiryDate] = useState('2026-05-01');

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const newItem: CouponItem = {
      id: `c_${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      discount_percent: discountPercent,
      usage_count: 0,
      max_uses: maxUses,
      expires_at: `${expiryDate}T23:59:59Z`,
      is_active: true,
    };

    setCoupons([newItem, ...coupons]);
    setNewCode('');
    setShowCreateModal(false);
    toast.success(`Coupon ${newItem.code} created! You earn 97% on purchases with this code.`);
  };

  const handleToggleActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, is_active: !c.is_active } : c))
    );
    toast.info('Coupon status updated');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied coupon code ${code}`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Instructor Coupons</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create custom discount codes for your students. You earn 97% of net sales generated through your coupons!
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          className="text-xs font-bold gap-1.5 h-10 shadow-md"
        >
          <Plus className="h-4 w-4" /> Create Promotional Coupon
        </Button>
      </div>

      {/* 97% Revenue Share Callout */}
      <Card className="border-emerald-500/30 bg-emerald-500/5 shadow-sm">
        <CardContent className="p-5 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Tag className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
              Instructor Promotion Revenue Share: 97% Net Revenue
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              When students enroll using your instructor coupon links, you receive 97% of net receipts (LearnHub retains only a 3% platform payment processing fee).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount</th>
                <th className="p-4">Redemptions</th>
                <th className="p-4">Expires</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-muted/10 transition">
                  <td className="p-4 font-mono font-bold text-foreground">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(c.code)}
                      className="hover:underline flex items-center gap-1.5"
                    >
                      <span>{c.code}</span>
                      <Copy className="h-3 w-3 text-muted-foreground" />
                    </button>
                  </td>
                  <td className="p-4">
                    <Badge className="bg-primary/10 text-primary font-bold">
                      {c.discount_percent}% OFF
                    </Badge>
                  </td>
                  <td className="p-4 font-medium text-foreground">
                    {c.usage_count} / {c.max_uses} used
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(c.expires_at).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={c.is_active ? 'default' : 'secondary'}
                      className={c.is_active ? 'bg-emerald-600 text-white' : ''}
                    >
                      {c.is_active ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(c.id)}
                      className="text-xs h-7"
                    >
                      {c.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-card border p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-lg">Create New Promotion Coupon</h3>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="code">
                  Coupon Code
                </label>
                <Input
                  id="code"
                  placeholder="e.g. SUMMER2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="font-mono uppercase text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="discount">
                    Discount Percentage
                  </label>
                  <Input
                    id="discount"
                    type="number"
                    min={5}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="maxUses">
                    Usage Limit
                  </label>
                  <Input
                    id="maxUses"
                    type="number"
                    min={1}
                    value={maxUses}
                    onChange={(e) => setMaxUses(parseInt(e.target.value, 10))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground" htmlFor="expiry">
                  Expiration Date
                </label>
                <Input
                  id="expiry"
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="font-bold">
                  Create Coupon
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
