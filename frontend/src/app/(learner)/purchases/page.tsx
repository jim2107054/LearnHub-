'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Receipt,
  Download,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient, ApiError } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  price_amount: number;
  progress_percent?: number;
}

interface OrderRecord {
  id: string;
  reference: string;
  created_at: string;
  total_amount: number;
  currency: string;
  payment_method: string;
  status: 'paid' | 'refunded' | 'partially_refunded' | 'failed';
  items: OrderItem[];
  is_refund_eligible: boolean;
  refund_ineligible_reason?: string;
}

export default function PurchasesPage() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refund Modal State
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [refundReason, setRefundReason] = useState('not_what_expected');
  const [refundNotes, setRefundNotes] = useState('');
  const [isSubmittingRefund, setIsSubmittingRefund] = useState(false);
  const [refundError, setRefundError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true);
      try {
        const res = await apiClient<OrderRecord[]>('/orders');
        setOrders(res.data || []);
      } catch {
        // Mock fallback for preview
        setOrders([
          {
            id: 'ord_918237',
            reference: 'LH-ORD-2026-918237',
            created_at: '2026-03-28T14:30:00Z',
            total_amount: 4999,
            currency: 'USD',
            payment_method: 'Visa •••• 4242',
            status: 'paid',
            is_refund_eligible: true,
            items: [
              {
                id: 'item_1',
                course_id: 'crs_1',
                course_title: 'Complete Cloud Architecture Masterclass',
                course_slug: 'cloud-architecture-masterclass',
                price_amount: 4999,
                progress_percent: 4,
              },
            ],
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  const handleOpenRefundModal = (order: OrderRecord) => {
    setSelectedOrder(order);
    setRefundError(null);
    setRefundNotes('');
  };

  const handleCloseRefundModal = () => {
    setSelectedOrder(null);
    setRefundError(null);
  };

  const handleSubmitRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsSubmittingRefund(true);
    setRefundError(null);

    try {
      await apiClient(`/orders/${selectedOrder.id}/refund`, {
        method: 'POST',
        body: JSON.stringify({
          reason: refundReason,
          notes: refundNotes,
        }),
      });

      toast.success('Refund request submitted successfully. Processing via financial ledger.');
      // Update local status
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, status: 'refunded', is_refund_eligible: false }
            : o
        )
      );
      handleCloseRefundModal();
    } catch (err) {
      if (err instanceof ApiError) {
        setRefundError(err.message);
      } else {
        setRefundError('Unable to process refund. Eligibility rule requirement: Within 30 days and <10% course progress.');
      }
    } finally {
      setIsSubmittingRefund(false);
    }
  };

  const handleDownloadInvoice = (order: OrderRecord) => {
    // Generate text invoice data
    const content = `LEARNHUB OFFICIAL RECEIPT\nReference: ${order.reference}\nDate: ${new Date(order.created_at).toLocaleDateString()}\nStatus: ${order.status.toUpperCase()}\nPayment: ${order.payment_method}\nAmount: ${formatPrice(order.total_amount, order.currency)}\n\nThank you for choosing LearnHub.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${order.reference}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Invoice downloaded');
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Purchase History</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your enrolled orders, receipts, and 30-day money-back guarantee requests
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-xs text-muted-foreground">Loading purchase records...</p>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-6">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/40 border-b text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Courses</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Payment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/10 transition">
                      <td className="p-4 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <Link
                              key={item.id}
                              href={`/courses/${item.course_slug}`}
                              className="font-medium text-foreground hover:text-primary transition line-clamp-1 block text-xs"
                            >
                              {item.course_title}
                            </Link>
                          ))}
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap font-bold text-foreground">
                        {formatPrice(order.total_amount, order.currency)}
                      </td>

                      <td className="p-4 whitespace-nowrap text-xs text-muted-foreground">
                        {order.payment_method}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <Badge
                          variant={
                            order.status === 'paid'
                              ? 'default'
                              : order.status === 'refunded'
                              ? 'destructive'
                              : 'secondary'
                          }
                          className="capitalize text-[10px]"
                        >
                          {order.status}
                        </Badge>
                      </td>

                      <td className="p-4 whitespace-nowrap text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadInvoice(order)}
                          className="h-8 text-xs gap-1"
                        >
                          <Download className="h-3.5 w-3.5" /> Invoice
                        </Button>

                        {order.status === 'paid' && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!order.is_refund_eligible}
                            onClick={() => handleOpenRefundModal(order)}
                            title={order.refund_ineligible_reason || 'Request refund'}
                            className="h-8 text-xs gap-1"
                          >
                            <RotateCcw className="h-3.5 w-3.5" /> Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      ) : (
        <div className="py-20 text-center border rounded-2xl bg-muted/10 p-8 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Receipt className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold">No purchase history found</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t enrolled in any paid courses yet. When you complete an order, your invoice and refund management will appear here.
          </p>
          <Button asChild>
            <Link href="/courses">Explore Marketplace</Link>
          </Button>
        </div>
      )}

      {/* Refund Request Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md rounded-2xl bg-card border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-bold">Request a Refund</h3>
                <p className="text-xs text-muted-foreground">
                  Order {selectedOrder.reference}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCloseRefundModal}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitRefund} className="p-6 space-y-4">
              {refundError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{refundError}</span>
                </div>
              )}

              <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground space-y-1 border">
                <p className="font-semibold text-foreground">Refund Policy (BR-07):</p>
                <p>• Must be requested within 30 days of purchase.</p>
                <p>• Course watch progress must be under 10%.</p>
                <p>• Funds are reversed to original payment method.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="reason">
                  Reason for Refund
                </label>
                <select
                  id="reason"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="not_what_expected">Course content was not what I expected</option>
                  <option value="technical_issue">Technical issues preventing video playback</option>
                  <option value="purchased_by_accident">Purchased by accident / duplicate order</option>
                  <option value="instructor_quality">Poor audio/video quality or delivery</option>
                  <option value="other">Other reason</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="notes">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  placeholder="Tell us what we can improve..."
                  className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseRefundModal}
                  className="w-1/2"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmittingRefund}
                  className="w-1/2"
                >
                  {isSubmittingRefund ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    'Confirm Refund'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
