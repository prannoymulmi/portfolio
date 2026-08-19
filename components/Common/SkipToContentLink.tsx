'use client';

import { useUi } from '@/components/Common/LocaleProvider';

/**
 * The keyboard/screen-reader "Skip to main content" link. Split out of
 * app/layout.tsx (a server component, so it cannot call `useUi()` itself)
 * so its one string can still follow the active locale (ADR 0024) — mirrors
 * the reasoning behind `components/Common/Chapter.tsx` (research R-008).
 * Visually hidden until focused; renders no wrapper element of its own
 * beyond the link, so its position in the document does not change.
 */
export function SkipToContentLink() {
  const ui = useUi();

  return (
    <a
      href="#main-content"
      // Text on the primary fill uses `foreground`, not `primary-foreground` —
      // research R1 (specs/009-typography-color-refresh) measured
      // primary-foreground at 3.26:1 against primary, which fails AA.
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {ui.a11y.skipToMainContent}
    </a>
  );
}
