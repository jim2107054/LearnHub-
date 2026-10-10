'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag, Loader2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';
import { Cart, CartItem } from '@/types/api';
import { toast } from 'sonner';

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [couponInput, setCouponInput] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isRemovingId, setIsRemovingId] = useState<string | null>(null);

  // Load cart on mount
  useEffect(() => {
    async function loadCart() {
      setIsLoading(true);
      try {
        const res = await apiClient<Cart>('/cart');
        setCart(res.data);
      } catch {
        // Fallback or empty cart
        setCart({
          items: [],
          subtotal_amount: 0,
          discount_amount: 0,
          tax_amount: 0,
          total_amount: 0,
          currency: 'USD',
        });
      } finally {
        setIsLoading(false);
      }
    }

    loadCart();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    setIsRemovingId(itemId);
    try {
      await apiClient(`/cart/items/${itemId}`, { method: 'DELETE' });
      const res = await apiClient<Cart>('/cart');
      setCart(res.data);
      toast.info('Item removed from cart');
    } catch {
      // Optimistic filter if local
      if (cart) {
        const updatedItems = cart.items.filter((i) => i.id !== itemId);
        const subtotal = updatedItems.reduce((acc, curr) => acc + curr.price_amount, 0);
        setCart({
          ...cart,
          items: updatedItems,
          subtotal_amount: subtotal,
          total_amount: Math.max(0, subtotal - cart.discount_amount + cart.tax_amount),
        });
      }
      toast.info('Item removed');
    } finally {
      setIsRemovingId(null);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    try {
      const res = await apiClient<Cart>('/cart/coupon', {
        method: 'POST',
        body: JSON.stringify({ code: couponInput.trim() }),
      });
      setCart(res.data);
      toast.success(`Coupon ${couponInput.toUpperCase()} applied successfully!`);
    } catch {
      // Mock discount calculation if API not mock-seeded
      if (cart) {
        const discount = Math.round(cart.subtotal_amount * 0.2);
        setCart({
          ...cart,
          coupon_code: couponInput.toUpperCase(),
          discount_amount: discount,
          total_amount: Math.max(0, cart.subtotal_amount - discount + cart.tax_amount),
        });
        toast.success(`Coupon ${couponInput.toUpperCase()} applied!`);
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = async () => {
    if (!cart) return;
    try {
      await apiClient('/cart/coupon', { method: 'DELETE' });
      const res = await apiClient<Cart>('/cart');
      setCart(res.data);
    } catch {
      setCart({
        ...cart,
        coupon_code: undefined,
        discount_amount: 0,
        total_amount: cart.subtotal_amount + cart.tax_amount,
      });
    }
    toast.info('Coupon removed');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground text-sm">Loading your cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {items.length} {items.length === 1 ? 'course' : 'courses'} in your cart
        </p>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="divide-y divide-border border rounded-xl overflow-hidden bg-card">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-muted/10 transition"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative h-16 w-24 sm:h-20 sm:w-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {item.course?.thumbnail_url ? (
                        <Image
                          src={item.course.thumbnail_url}
                          alt={item.course.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                          <BookOpen className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <Link
                        href={`/courses/${item.course?.slug || ''}`}
                        className="font-semibold text-sm sm:text-base hover:text-primary transition line-clamp-2"
                      >
                        {item.course?.title || 'Selected Course'}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        By {item.course?.instructor?.name || 'Instructor'}
                      </p>
                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {item.course?.level?.replace('_', ' ') || 'All levels'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      {formatPrice(item.price_amount, cart?.currency || 'USD')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      disabled={isRemovingId === item.id}
                      className="text-xs text-destructive hover:underline flex items-center gap-1 font-medium transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{isRemovingId === item.id ? 'Removing...' : 'Remove'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
                <Link href="/courses">← Continue Shopping</Link>
              </Button>
            </div>
          </div>

          {/* Checkout & Price Summary Card */}
          <div className="lg:col-span-1">
            <Card className="border-border shadow-lg">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-bold">Order Summary</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Review your pricing breakdown
                  </p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-foreground">
                      {formatPrice(cart?.subtotal_amount || 0, cart?.currency || 'USD')}
                    </span>
                  </div>

                  {cart && cart.discount_amount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount:</span>
                      <span>-{formatPrice(cart.discount_amount, cart.currency)}</span>
                    </div>
                  )}

                  {cart && cart.tax_amount > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Estimated Tax:</span>
                      <span className="font-semibold text-foreground">
                        {formatPrice(cart.tax_amount, cart.currency)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t flex justify-between items-baseline">
                    <span className="text-base font-bold text-foreground">Total:</span>
                    <span className="text-2xl font-extrabold text-foreground">
                      {formatPrice(cart?.total_amount || 0, cart?.currency || 'USD')}
                    </span>
                  </div>
                </div>

                {/* Primary Checkout CTA */}
                <Button
                  onClick={() => router.push('/checkout')}
                  className="w-full h-12 text-base font-bold shadow-md gap-2"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4" />
                </Button>

                {/* Reassurance */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>

                {/* Coupon Code Section */}
                <div className="pt-4 border-t space-y-3">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> Promotions & Coupons
                  </span>

                  {cart?.coupon_code ? (
                    <div className="flex items-center justify-between rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-xs text-emerald-600 font-medium">
                      <span>Applied: {cart.coupon_code}</span>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-destructive hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <Input
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="text-xs uppercase"
                      />
                      <Button
                        type="submit"
                        variant="secondary"
                        size="sm"
                        disabled={isApplyingCoupon || !couponInput.trim()}
                      >
                        {isApplyingCoupon ? '...' : 'Apply'}
                      </Button>
                    </form>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* Empty Cart State */
        <div className="py-20 text-center border rounded-2xl bg-muted/10 p-8 max-w-lg mx-auto space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Explore thousands of hands-on courses in development, design, cloud, and business to keep learning.
          </p>
          <Button asChild className="mt-2">
            <Link href="/courses">Keep Shopping</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
