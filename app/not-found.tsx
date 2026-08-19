import Link from 'next/link';
import type { Metadata } from 'next';

// Deliberately English-only, not translated: SEO metadata, same rationale as
// app/layout.tsx's `metadata` — no German URL exists for this to describe
// (ADR 0024, plan.md Decision 5).
export const metadata: Metadata = {
  title: 'Page Not Found | Prannoy Mulmi',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    // Opaque, like ErrorBoundary's fallback — this is page furniture, not a
    // chapter, so it isn't bound by ADR 0015's "no opaque background" rule.
    // Without it, `text-muted-foreground` below sits directly on the pinned
    // photo and measures 2.01:1 (research R1) — the same failure the old
    // `text-gray-600` had here per ADR 0015's own contrast table.
    <section className="bg-background flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="font-display text-6xl font-bold text-primary dark:text-blue-400">404</p>
      <h1 className="font-display mt-4 text-3xl font-bold text-foreground dark:text-white">
        Off the pitch
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground dark:text-gray-400">
        We couldn&apos;t find the page you were looking for. It may have been moved or never
        existed.
      </p>
      <Link
        href="/"
        // Text on the primary fill uses `foreground`, not `primary-foreground`
        // (research R1 — primary-foreground measures 3.26:1 against primary).
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-foreground shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        Return to home
      </Link>
    </section>
  );
}
