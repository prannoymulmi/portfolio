'use client';

import { useLocale, useUi } from '@/components/Common/LocaleProvider';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import { format } from '@/lib/i18n/format';

/**
 * Advances to the next entry in `SUPPORTED_LOCALES` and wraps (research.md
 * R-010, ADR 0024). Renders nothing at all — not a disabled control — while
 * the registry holds fewer than two entries, matching the empty-render
 * treatment `ThemeToggle` uses for its own gated state.
 */
export function LocaleToggle() {
  const { locale, setLocale } = useLocale();
  const ui = useUi();

  if (SUPPORTED_LOCALES.length < 2) return null;

  const currentIndex = SUPPORTED_LOCALES.findIndex((entry) => entry.code === locale);
  const current = SUPPORTED_LOCALES[currentIndex];
  const next = SUPPORTED_LOCALES[(currentIndex + 1) % SUPPORTED_LOCALES.length];

  return (
    <button
      type="button"
      onClick={() => setLocale(next.code)}
      aria-label={format(ui.nav.switchLocale, { current: current.label, target: next.label })}
      className="inline-flex h-9 items-center justify-center rounded-lg bg-card px-2.5 text-xs font-semibold text-foreground hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
    >
      {next.shortLabel}
    </button>
  );
}
