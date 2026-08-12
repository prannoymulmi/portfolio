import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Backdrop } from '@/components/Common/Backdrop';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';
import { Footer } from '@/components/Navigation/Footer';
import { StoryProgressNav } from '@/components/Navigation/StoryProgressNav';
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
  description: 'Senior software engineer and cloud architect, with a focus on AI and security.',
  authors: [{ name: 'Prannoy Mulmi' }],
  creator: 'Prannoy Mulmi',
  openGraph: {
    title: 'Prannoy Mulmi | Senior Software Engineer',
    description: 'Senior software engineer and cloud architect, with a focus on AI and security.',
    type: 'website',
    url: SITE_URL,
    siteName: 'Prannoy Mulmi Portfolio',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prannoy Mulmi | Senior Software Engineer',
    description: 'Senior software engineer and cloud architect, with a focus on AI and security.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  // The site has one theme (docs/adr/0019-one-theme.md). Both of these pin a
  // browser-level signal that no stylesheet controls: without `colorScheme`,
  // scrollbars and form controls the browser draws itself would still follow
  // the OS and go dark on a light page. Not redundant — do not remove.
  colorScheme: 'light',
  themeColor: '#ffffff',
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
      <body className="flex min-h-full flex-col bg-white text-gray-900">
        {/* The photograph the whole story sits on. */}
        <Backdrop />
        <StructuredData />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <ContentProvider>
            <StoryProgressNav />
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
