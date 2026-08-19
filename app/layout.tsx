import type { Metadata } from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Backdrop } from '@/components/Common/Backdrop';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';
import { LocaleProvider } from '@/components/Common/LocaleProvider';
import { Footer } from '@/components/Navigation/Footer';
import { ThemeProvider } from '@/components/Common/ThemeProvider';
import { StoryProgressNav } from '@/components/Navigation/StoryProgressNav';
import { StructuredData } from '@/components/Common/StructuredData';
import { SkipToContentLink } from '@/components/Common/SkipToContentLink';
import './globals.css';

// next/font's own `variable` names deliberately differ from the Tailwind
// theme keys (`--font-display` / `--font-mono-ui`, registered in
// globals.css's `@theme inline`) — `@theme inline` resolves those keys via
// `var(--font-space-grotesk)` etc. at each usage site, so the loader variable
// and the theme key it feeds can't share a name without becoming circular.
const fontDisplay = Space_Grotesk({
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

const fontMonoUi = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://portfolio.prannoy-mulmi.com';

// Deliberately English-only, not translated: SEO/social metadata (title,
// description, openGraph.locale, twitter card) has no German URL to point
// at, so there is nothing for hreflang/alternate-locale metadata to name —
// ADR 0024, plan.md Decision 5.
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

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      // next-themes sets the theme class here before React hydrates, so the
      // server and client markup legitimately differ on this element.
      suppressHydrationWarning
      className={`${fontDisplay.variable} ${fontMonoUi.variable} h-full scroll-smooth antialiased`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* One value, not a pair keyed to prefers-color-scheme: the dark design
            is behind the experiment flag, so a visitor whose OS is dark still
            gets the light page and would otherwise see dark browser chrome
            framing it. */}
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground dark:bg-gray-900 dark:text-gray-100">
        {/* The photograph the whole story sits on. */}
        <Backdrop />
        <StructuredData />
        <ThemeProvider>
          <LocaleProvider>
            {/* Split into its own client component so its one string can
                follow the active locale — this file stays a server component
                and keeps its `metadata` export (research R-008, ADR 0024). */}
            <SkipToContentLink />
            <ErrorBoundary>
              <ContentProvider>
                <StoryProgressNav />
                <main id="main-content" className="flex-1">
                  {children}
                </main>
                <Footer />
              </ContentProvider>
            </ErrorBoundary>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
