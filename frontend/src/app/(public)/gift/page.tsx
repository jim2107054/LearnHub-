'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gift, Mail, ArrowRight, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

export default function GiftCoursePage() {
  const router = useRouter();
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [senderName, setSenderName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitGift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim() || !recipientEmail.trim()) {
      toast.error('Please specify recipient details');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Gift voucher configured! Proceeding to checkout.');
      router.push('/checkout');
    }, 600);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8 space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Gift className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">Gift a Course</h1>
        <p className="text-sm text-muted-foreground">
          Inspire someone you care about with high-impact skills and lifetime access.
        </p>
      </div>

      <Card className="border-border shadow-xl">
        <form onSubmit={handleSubmitGift}>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Recipient Information</CardTitle>
            <CardDescription className="text-xs">
              We will send an invitation email with a personalized voucher code on your chosen date.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="recipientName">
                  Recipient Name
                </label>
                <Input
                  id="recipientName"
                  placeholder="e.g. Alex Smith"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="recipientEmail">
                  Recipient Email
                </label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="alex@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="senderName">
                  Your Name
                </label>
                <Input
                  id="senderName"
                  placeholder="e.g. Jordan"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="deliveryDate">
                  Delivery Date (Optional)
                </label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" htmlFor="giftMessage">
                Personal Message (Optional)
              </label>
              <textarea
                id="giftMessage"
                rows={4}
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                placeholder="Wishing you the best on your learning journey! Have fun mastering new skills..."
                className="w-full rounded-md border border-input bg-background p-3 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/courses">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:flex-1 h-11 font-bold">
              Continue to Checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
