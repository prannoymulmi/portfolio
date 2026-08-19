'use client';

import { useUi } from '@/components/Common/LocaleProvider';

/**
 * Hamburg, Germany / Hamburg, Deutschland (US3, FR-008, SC-005, ADR 0024).
 * An inline pin path, not `react-icons` — Constitution IV (NON-NEGOTIABLE)
 * confines that package to the brand marks in SocialIcons.tsx alone (ADR
 * 0014), and this matches the round-cap/round-join, 1.75-stroke treatment
 * already used for HamburgerMenu's `SECTION_ICON_PATHS` and ThemeToggle's
 * glyphs. The pin is `aria-hidden` — the adjacent text already names the
 * place, so a screen reader would otherwise announce it twice.
 */
export function LocationTag() {
  const ui = useUi();

  return (
    <p className="text-on-photo mt-3 flex items-center gap-1.5 text-sm">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 21s-7-6.02-7-11a7 7 0 0 1 14 0c0 4.98-7 11-7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
      {ui.hero.location}
    </p>
  );
}
