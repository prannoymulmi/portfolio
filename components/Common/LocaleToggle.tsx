'use client';

import { useLocale, useUi } from '@/components/Common/LocaleProvider';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import { format } from '@/lib/i18n/format';

/**
 * Advances to the next entry in `SUPPORTED_LOCALES` and wraps (research.md
 * R-010, ADR 0024). Renders nothing at all — not a disabled control — while
 * the registry holds fewer than two entries, matching the empty-render
 * treatment `ThemeToggle` uses for its own gated state.
 *
 * Deliberately mounted outside `StoryProgressNav` (rendered as its own
 * sibling in app/layout.tsx) rather than inside the nav bar's icon row —
 * the site owner didn't want it grouped with the navigation chrome at all,
 * not just restyled within it. A `fixed` pill in its own corner keeps FR-002's
 * "reachable from anywhere, one interaction" intact without living in the nav.
 *
 * The circular badge with a short mono label echoes the pitch's own player
 * markers (CareerPitch.tsx) — a 1-2 character label inside a circle is
 * already this site's way of identifying something compactly, so the toggle
 * borrows that rather than inventing a new shape. The glass material (blur +
 * translucent fill + hairline ring) matches StoryProgressNav's own pill, so
 * the two still read as one family of floating chrome despite living apart.
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
      className="fixed bottom-4 left-3 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-[#fffaf4]/55 text-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.6),0_10px_30px_-18px_rgb(17_28_56/0.45)] ring-1 ring-[#111c38]/10 backdrop-blur-xl backdrop-saturate-150 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:translate-y-0 dark:bg-[#0c101c]/55 dark:text-gray-100 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.10),0_10px_30px_-18px_rgb(0_0_0/0.6)] dark:ring-white/10 sm:bottom-6 sm:left-6"
    >
      <span className="label-mono text-xs">{next.shortLabel}</span>
    </button>
  );
}
