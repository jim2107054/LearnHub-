import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { RootProvider } from '@/components/providers/root-provider';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';

import { CookieConsentBanner } from '@/components/shared/cookie-consent-banner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LearnHub — Online Course Marketplace & LMS',
  description: 'Master new technical and business skills with top online video courses, quizzes, and verifiable industry certificates.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <RootProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieConsentBanner />
        </RootProvider>
      </body>
    </html>
  );
}
