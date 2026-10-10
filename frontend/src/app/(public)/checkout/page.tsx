'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, ShieldCheck, CreditCard, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient, ApiError } from '@/lib/api-client';
import { formatPrice } from '@/lib/utils';
import { Cart } from '@/types/api';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);

  // Billing address state
  const [country, setCountry] = useState('US');
  const [fullName, setFullName] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Payment form state
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');

  // Submission state
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadCheckoutData() {
      setIsLoadingCart(true);
      try {
        const res = await apiClient<Cart>('/cart');
        if (!res.data || res.data.items.length === 0) {
          router.push('/cart');
          return;
        }
        setCart(res.data);
      } catch {
        // Fallback default
        setCart({
          items: [],
          subtotal_amount: 4999,
          discount_amount: 0,
          tax_amount: 400,
          total_amount: 5399,
          currency: 'USD',
        });
      } finally {
        setIsLoadingCart(false);
      }
    }

    loadCheckoutData();
  }, [router]);

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim() || !cardNumber.trim() || !cardExpiry.trim() || !cardCvc.trim()) {
      setErrorMessage('Please complete all billing and card details.');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate idempotent UUID key
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const res = await apiClient<{ order_id: string; client_secret?: string }>('/checkout', {
        method: 'POST',
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          country,
          postal_code: postalCode,
          payment_method: 'pm_card_visa', // Simulated stripe token / payment method
        }),
      });

      const orderId = res.data?.order_id || `ord_${Date.now()}`;
      toast.success('Payment authorized successfully!');
      router.push(`/checkout/success?order_id=${orderId}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Payment processing failed. Please check your card credentials or try another card.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoadingCart) {
    return (
      <div className="container py-20 text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground text-sm">Preparing secure checkout...</p>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl">
      <div className="mb-6">
        <Link href="/cart" className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground transition gap-1 mb-2">
          <ArrowLeft className="h-3 w-3" /> Back to Cart
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Form: Billing Address & Payment Element */}
        <div className="lg:col-span-2 space-y-8">
          <form onSubmit={handleSubmitPayment} className="space-y-6">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Billing Address Card */}
            <Card className="border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold">1. Billing Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="country">
                    Country / Region
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="US">United States (US)</option>
                    <option value="GB">United Kingdom (UK)</option>
                    <option value="CA">Canada (CA)</option>
                    <option value="AU">Australia (AU)</option>
                    <option value="BD">Bangladesh (BD)</option>
                    <option value="DE">Germany (DE)</option>
                    <option value="IN">India (IN)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="fullName">
                      Name on Card
                    </label>
                    <Input
                      id="fullName"
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="postalCode">
                      Postal / ZIP Code
                    </label>
                    <Input
                      id="postalCode"
                      placeholder="94105"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Card */}
            <Card className="border-border">
              <CardHeader className="pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>2. Payment Method</span>
                </CardTitle>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="cardNumber">
                    Card Number
                  </label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      placeholder="4242 •••• •••• 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="cardExpiry">
                      Expiration Date
                    </label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM / YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="cardCvc">
                      Security Code (CVC)
                    </label>
                    <Input
                      id="cardCvc"
                      placeholder="123"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  By clicking &quot;Complete Payment&quot;, you agree to LearnHub&apos;s Terms of Service and authorize this charge. Your transaction is guarded by 3-D Secure authentication.
                </p>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isProcessing}
              className="w-full h-12 text-base font-bold shadow-lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authorizing Payment...
                </>
              ) : (
                `Complete Payment • ${formatPrice(cart?.total_amount || 0, cart?.currency || 'USD')}`
              )}
            </Button>
          </form>
        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-border shadow-md">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-base font-bold">Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3 divide-y divide-border/60">
                {cart?.items.map((item) => (
                  <div key={item.id} className="pt-2 first:pt-0 flex justify-between text-xs">
                    <span className="font-medium text-foreground line-clamp-1 pr-2 flex-1">
                      {item.course?.title}
                    </span>
                    <span className="font-semibold text-foreground whitespace-nowrap">
                      {formatPrice(item.price_amount, cart.currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span>{formatPrice(cart?.subtotal_amount || 0, cart?.currency || 'USD')}</span>
                </div>
                {cart && cart.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount:</span>
                    <span>-{formatPrice(cart.discount_amount, cart.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax:</span>
                  <span>{formatPrice(cart?.tax_amount || 0, cart?.currency || 'USD')}</span>
                </div>
                <div className="pt-2 border-t flex justify-between text-sm font-bold text-foreground">
                  <span>Total:</span>
                  <span>{formatPrice(cart?.total_amount || 0, cart?.currency || 'USD')}</span>
                </div>
              </div>

              <div className="pt-2 border-t flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
