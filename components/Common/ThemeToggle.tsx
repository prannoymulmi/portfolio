'use client';

import { useTheme } from 'next-themes';
import { useExperimentEnabled } from '@/lib/utils/experiment';

/**
 * Switches the theme — behind the experiment flag.
 *
 * The dark design is not finished, so the control is absent for everyone who
 * has not asked for it with `?experiment=true`. It renders nothing at all
 * rather than a spacer: the nav should close up around the missing button, not
 * hold a 36px gap open for a control nobody can see.
 *
 * The flag also settles what used to need a separate hydration guard here.
 * next-themes' pre-paint script means `resolvedTheme` is already set on the
 * client's *first* render, so branching on it would render a button where the
 * server rendered nothing — a hydration mismatch. `useExperimentEnabled` reads
 * `false` on the server and on the hydration render for the same reason, so
 * both sides agree on the first pass and the button swaps in on the next.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const experimentEnabled = useExperimentEnabled();

  if (!experimentEnabled) return null;

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
    >
      {isDark ? (
        // Sun — click to go light
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.36a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.41-1.41l.7-.71zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zm-3.07 5.52a1 1 0 011.41 1.41l-.7.71a1 1 0 01-1.42-1.42l.71-.7zM10 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-4.93-1.48a1 1 0 011.41 1.42l-.7.7a1 1 0 01-1.42-1.41l.71-.71zM4 9a1 1 0 110 2H3a1 1 0 110-2h1zm1.78-4.64a1 1 0 011.41 0l.71.71A1 1 0 016.49 6.5l-.71-.71a1 1 0 010-1.42zM10 6a4 4 0 100 8 4 4 0 000-8z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        // Moon — click to go dark
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
}
