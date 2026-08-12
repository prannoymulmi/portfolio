'use client';

import Link from 'next/link';

/**
 * Colours are the hero palette written out as literals — Tailwind scans class
 * strings, so they can't be interpolated from ./palette.ts. Ink on the sunset.
 *
 * The two buttons are kept to one box on purpose. The primary carries a
 * transparent border it does not visually need, because the secondary's
 * `border-2` is inside the border box: without a matching border the primary
 * computed 60px against the secondary's 64px. Side by side `align-items:
 * stretch` hid that, but stacked it equalises widths rather than heights and
 * the 4px showed. Matching the borders fixes the cause; setting a height would
 * only have hidden it again.
 *
 * Both glyphs lead, so the labels sit on one axis — a leading icon on one and
 * a trailing icon on the other offsets the text even when the boxes match.
 * The primary keeps a second, trailing arrow as a hierarchy cue; that is the
 * difference between the two buttons, and it is deliberate.
 */
export function ValueProp() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
      {/* View Work Button */}
      <Link
        href="/#projects"
        className="inline-flex items-center justify-center rounded-lg border-2 border-transparent bg-[#111c38] px-8 py-4 text-lg font-semibold text-[#fff5ec] transition-all hover:bg-[#1d2f5c] hover:shadow-lg active:scale-95"
      >
        {/* A folder of work, matching the leading position of the play glyph
            on the button beside it. */}
        <svg
          aria-hidden="true"
          className="mr-2 h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7.5h6l2 2.5h10v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 19z" />
          <path d="M3 7.5v-2A1.5 1.5 0 014.5 4h4L10 6" />
        </svg>
        View Work
        <svg
          aria-hidden="true"
          className="ml-2 h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
        className="inline-flex items-center justify-center rounded-lg border-2 border-[#3d2318]/35 px-8 py-4 text-lg font-semibold text-[#3d2318] transition-all hover:border-[#3d2318]/60 hover:bg-white/55 active:scale-95"
      >
        <svg
          aria-hidden="true"
          className="mr-2 h-5 w-5 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
        Play Career
      </Link>
    </div>
  );
}
