'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ReactNode } from 'react';

/**
 * Owns theme state for the whole site.
 *
 * next-themes injects a script that sets the theme class before first paint,
 * which is the only way to avoid a flash of the wrong theme — a `useEffect`
 * runs after the first paint by definition.
 * See docs/adr/0010-next-themes-for-theme-state.md
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
