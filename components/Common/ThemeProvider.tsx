'use client';

import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';
import type { ReactNode } from 'react';
import { isExperimentEnabled, useExperimentEnabled } from '@/lib/utils/experiment';

/**
 * Puts a visitor back on the light design once they leave the experiment.
 *
 * The choice is persisted, and the toggle is the only way to reverse it — so
 * without this, anyone who tried dark mode under `?experiment=true` and came
 * back on a plain URL would be stuck in it with no control to escape.
 * Resetting on load makes the flag the whole story: no param, no dark.
 *
 * The decision reads the URL inside the effect rather than trusting the hook's
 * value. The hook reports `false` for the hydration render — it has to, so the
 * client's first pass matches the server's — and an effect firing in that same
 * commit would reset the theme of a visitor who *is* in the experiment, wiping
 * their stored choice on every load. The hook is still subscribed to, so a
 * history navigation out of the experiment re-runs this.
 */
function ThemeExperimentGuard() {
  const { theme, setTheme } = useTheme();
  const experimentEnabled = useExperimentEnabled();

  useEffect(() => {
    if (!isExperimentEnabled() && theme === 'dark') setTheme('light');
  }, [experimentEnabled, theme, setTheme]);

  return null;
}

/**
 * Owns theme state for the whole site.
 *
 * next-themes injects a script that sets the theme class before first paint,
 * which is the only way to avoid a flash of the wrong theme — a `useEffect`
 * runs after the first paint by definition.
 * See docs/adr/0010-next-themes-for-theme-state.md
 *
 * The default is `light` rather than `system`, and `enableSystem` is off: the
 * dark design is behind the experiment flag, and following the OS would hand
 * it to every visitor whose machine is set dark — the one group who never
 * asked for it and, with the toggle hidden, cannot leave.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      storageKey="theme"
      disableTransitionOnChange
    >
      <ThemeExperimentGuard />
      {children}
    </NextThemesProvider>
  );
}
