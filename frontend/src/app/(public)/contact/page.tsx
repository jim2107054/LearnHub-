'use client';

import React, { useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Sparkles, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      toast.success('Your message has been sent. Our support team will reply within 24 hours!');
      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch {
      toast.error('Could not submit inquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-canvas min-h-screen text-ink dark:bg-[#0F0F10] dark:text-[#F5F5F5]">
      {/* Hero Banner */}
      <section className="bg-white dark:bg-[#1D1D1E] border-b border-hairline py-16 md:py-20">
        <div className="container max-w-4xl text-center space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-1 text-xs font-bold text-brand">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Support & Inquiries</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-ink dark:text-white">
            We’re here to help
          </h1>

          <p className="text-base md:text-lg font-light text-muted-foreground leading-relaxed max-w-xl mx-auto">
            Have a question about a course, enterprise plans, or technical billing? Get in touch with our team.
          </p>
        </div>
      </section>

      {/* Main Form & Contact Info */}
      <section className="container py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {/* Contact Details */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-ink dark:text-white">Get in touch</h3>
              <p className="text-sm font-light text-muted-foreground mt-1">
                Reach our team via message or explore our self-serve knowledge base.
              </p>
            </div>

            <div className="space-y-4 text-sm font-light">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-surface flex items-center justify-center flex-shrink-0 text-brand">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-ink dark:text-white">Email Us</p>
                  <p className="text-xs text-muted-foreground">support@learnhub.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-surface flex items-center justify-center flex-shrink-0 text-brand">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-ink dark:text-white">Live Chat</p>
                  <p className="text-xs text-muted-foreground">Available 24/7 for enrolled learners</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-full bg-surface flex items-center justify-center flex-shrink-0 text-brand">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-ink dark:text-white">Headquarters</p>
                  <p className="text-xs text-muted-foreground">600 Harrison St, 3rd Floor, San Francisco, CA 94107</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <Card className="p-8 rounded-card border border-hairline bg-white dark:bg-[#1D1D1E] shadow-none">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-ink dark:text-white">Full Name</label>
                    <Input
                      required
                      placeholder="Jane Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-11 rounded-btn bg-surface border-transparent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-ink dark:text-white">Email Address</label>
                    <Input
                      type="email"
                      required
                      placeholder="jane@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-11 rounded-btn bg-surface border-transparent"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-ink dark:text-white">Topic / Department</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-11 rounded-btn bg-surface border border-hairline px-4 text-sm font-light text-ink dark:text-white"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Course Support">Course Access & Playback Issue</option>
                    <option value="Billing & Refunds">Billing, Payments & 30-Day Refunds</option>
                    <option value="Teaching">Becoming an Instructor</option>
                    <option value="Enterprise">LearnHub for Business</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-bold text-ink dark:text-white">Your Message</label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Describe how we can assist you..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-card-sm bg-surface border border-hairline p-4 text-sm font-light text-ink dark:text-white focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="h-12 px-6 rounded-btn bg-ink text-white font-bold hover:bg-ink/90 active:bg-btn-active"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
