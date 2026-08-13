'use client';

export interface HamburgerMenuSection {
  id: string;
  label: string;
}

interface HamburgerMenuProps {
  sections: HamburgerMenuSection[];
}

/**
 * Replaces the bar's inline, horizontally-scrolling section list with a
 * single toggle. The seven chapter links move here rather than disappearing —
 * only their presentation changes (spec 010-hamburger-nav).
 */
export function HamburgerMenu({ sections }: HamburgerMenuProps) {
  return (
    <button
      type="button"
      aria-label="Open menu"
      className="flex items-center rounded p-1.5 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-100 dark:hover:text-blue-400"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>
  );
}
