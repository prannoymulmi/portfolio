import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Prannoy Mulmi | Senior Software Engineer',
  description:
    'Senior software engineer portfolio showcasing cloud architecture, full-stack development, and technical leadership.',
  openGraph: {
    title: 'Prannoy Mulmi | Senior Software Engineer',
    description:
      'Senior software engineer portfolio showcasing cloud architecture, full-stack development, and technical leadership.',
    type: 'website',
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
        <meta name="theme-color" content="#ffffff" />
        {/* Preload fonts for hero section (reduces layout shift) */}
        <link
          rel="preload"
          href="/fonts/geist-sans.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/geist-mono.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <ErrorBoundary>
          <ContentProvider>{children}</ContentProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
