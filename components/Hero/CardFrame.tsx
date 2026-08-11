import type { ReactNode } from 'react';

/**
 * The shield the card is printed on: outline, foil border, graded ground, and
 * the two decorative layers the reference carries — a paper texture and a
 * pitch diagram in the upper right.
 *
 * The outline is a rounded rectangle plus a separate crown, not a single
 * clipped SVG path. That is deliberate. The card stretches taller than the
 * reference's proportion on narrow screens (FR-020a), and an SVG clipPath in
 * `objectBoundingBox` units scales its geometry with the element's box — every
 * corner radius turns elliptical exactly where the card is most likely to be
 * read, on a phone. `border-radius` resolves per corner and does not distort.
 * See specs/006-hero-card-redesign/research.md §3.
 *
 * Colour comes from the card tokens in app/globals.css, which are re-declared
 * under `.dark`. That is what makes the dark edition a change of values rather
 * than a second set of components (research §1).
 */
export function CardFrame({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      {/* The crown, sitting above the card body and overlapping it so the two
          read as one silhouette rather than a box wearing a hat. */}
      <div aria-hidden="true" className="relative z-10 mx-auto -mb-px h-5 w-2/5 sm:h-6">
        <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="h-full w-full">
          <path
            d="M0 24 C 18 24, 26 2, 50 2 C 74 2, 82 24, 100 24 Z"
            className="fill-card-ground stroke-card-foil"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      <div className="border-card-foil bg-card-ground relative overflow-hidden rounded-[2rem] border">
        {/* Ground grade: ivory in the middle, sand at the rim, as the mock does. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_35%,var(--card-ground)_45%,var(--card-edge)_100%)]"
        />

        {/* Paper texture. Kept faint enough to be felt rather than seen —
            FR-003 says neither decorative layer may compete with the content. */}
        {/* fill-/stroke- rather than text- on these decorative SVGs: the foil
            fails AA for text (research §2), and the card asserts that
            `text-card-foil` appears nowhere so the rule cannot be broken by
            accident. Using the paint utilities directly keeps that assertion
            meaningful instead of carrying colour through currentColor. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.14]"
        >
          <defs>
            <pattern id="card-grain" width="7" height="7" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.6" className="fill-card-foil" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#card-grain)" />
        </svg>

        {/* The pitch diagram the reference tucks behind the portrait's shoulder. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 120 120"
          className="stroke-card-foil pointer-events-none absolute -right-6 top-10 h-40 w-40 opacity-25"
          fill="none"
          strokeWidth="1.5"
        >
          <path d="M10 4v112M10 30h40v60H10M10 48h18v24H10" />
          <circle cx="50" cy="60" r="16" />
          <circle cx="38" cy="60" r="2" className="fill-card-foil" stroke="none" />
        </svg>

        {/* Inner hairline: the second half of the reference's two-part border,
            inset from the outer foil edge. */}
        <div
          aria-hidden="true"
          className="border-card-foil/45 pointer-events-none absolute inset-2 rounded-[1.6rem] border"
        />

        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
