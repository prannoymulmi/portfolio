'use client';

import Link from 'next/link';

/**
 * Colours are the hero palette written out as literals — Tailwind scans class
 * strings, so they can't be interpolated from ./palette.ts. Ink on the sunset
 * in light mode; in dark mode the page goes near-black, so the primary flips
 * to the card's orange to stay the brightest thing in the section.
 */
export function ValueProp() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
      {/* View Work Button */}
      <Link
        href="/#projects"
        className="inline-flex items-center justify-center rounded-lg bg-[#111c38] px-8 py-4 text-lg font-semibold text-[#fff5ec] transition-all hover:bg-[#1d2f5c] hover:shadow-lg active:scale-95 dark:bg-[#ffa62b] dark:text-[#1a1005] dark:hover:bg-[#ffb851]"
      >
        View Work
        <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>

      {/* Play Career Button */}
      <Link
        href="/#career"
        className="inline-flex items-center justify-center rounded-lg border-2 border-[#3d2318]/35 px-8 py-4 text-lg font-semibold text-[#3d2318] transition-all hover:border-[#3d2318]/60 hover:bg-white/55 active:scale-95 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
      >
        <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        Play Career
      </Link>
    </div>
  );
}
