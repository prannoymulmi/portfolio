import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';
import { Footer } from '@/components/Navigation/Footer';
import { StructuredData } from '@/components/Common/StructuredData';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio.prannoy-mulmi.com';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Prannoy Mulmi | Senior Software Engineer',
    template: '%s | Prannoy Mulmi',
  },
  description:
    'Senior software engineer portfolio showcasing cloud architecture, full-stack development, and technical leadership.',
  authors: [{ name: 'Prannoy Mulmi' }],
  creator: 'Prannoy Mulmi',
  openGraph: {
    title: 'Prannoy Mulmi | Senior Software Engineer',
    description:
      'Senior software engineer portfolio showcasing cloud architecture, full-stack development, and technical leadership.',
    type: 'website',
    url: SITE_URL,
    siteName: 'Prannoy Mulmi Portfolio',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prannoy Mulmi | Senior Software Engineer',
    description:
      'Senior software engineer portfolio showcasing cloud architecture, full-stack development, and technical leadership.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#0a0a0a" media="(prefers-color-scheme: dark)" />
      </head>
      <body className="flex min-h-full flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <StructuredData />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <ContentProvider>
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
          </ContentProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
