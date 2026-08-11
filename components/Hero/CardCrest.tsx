/**
 * The crest closing the composition at the foot of the card — a ball between
 * two laurel sprigs, as the reference has it.
 *
 * Drawn rather than placed as an image so it re-themes with the card: it takes
 * the foil and ink tokens, which flip under `.dark` with everything else.
 * Purely decorative, so it stays out of the accessibility tree.
 */
export function CardCrest() {
  return (
    <div aria-hidden="true" className="flex justify-center pt-1">
      <svg viewBox="0 0 120 40" className="h-9 w-28" fill="none">
        {/* Laurels */}
        <g className="stroke-card-foil" strokeWidth="1.6" strokeLinecap="round">
          <path d="M38 34 C 26 30, 20 22, 20 12" />
          <path d="M36 30c-5 1-8-1-9-4M33 25c-5 1-8-1-9-4M30 20c-4 0-7-2-7-5M28 15c-4 0-6-2-6-5" />
          <path d="M82 34 C 94 30, 100 22, 100 12" />
          <path d="M84 30c5 1 8-1 9-4M87 25c5 1 8-1 9-4M90 20c4 0 7-2 7-5M92 15c4 0 6-2 6-5" />
        </g>

        {/* Ball */}
        <circle cx="60" cy="20" r="11" className="fill-card-ink" />
        <g className="fill-card-ground">
          <path d="M60 12.5l4.2 3-1.6 4.9h-5.2L55.8 15.5z" />
          <path d="M60 9.2a10.8 10.8 0 0 0-4 .8l2.2 1.6zM66.5 12.1l-.8 2.6 2.6-.2a11 11 0 0 0-1.8-2.4M53.5 12.1a11 11 0 0 0-1.8 2.4l2.6.2zM55.2 27.9a10.8 10.8 0 0 0 9.6 0l-1.3-2.2h-7z" />
        </g>
      </svg>
    </div>
  );
}
