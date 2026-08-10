/**
 * Inline SVG flags rather than emoji: flag emoji don't render on Windows
 * Chrome (they fall back to letter pairs), which is a large share of the
 * audience this page is written for.
 *
 * Both are simplified for legibility at ~24px — recognisable silhouette and
 * emblems rather than exact official geometry.
 */

export function FlagGermany({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 5 3" className={className} role="img" aria-label="Germany">
      <rect width="5" height="1" y="0" fill="#000000" />
      <rect width="5" height="1" y="1" fill="#DD0000" />
      <rect width="5" height="1" y="2" fill="#FFCE00" />
    </svg>
  );
}

export function FlagNepal({ className }: { className?: string }) {
  // The only non-rectangular national flag: two stacked pennants, crimson
  // field with a blue border, white moon above and white sun below.
  return (
    <svg viewBox="0 0 75 91" className={className} role="img" aria-label="Nepal">
      <path
        d="M2.5 88.5V2.5l54 42H24l32.5 32z"
        fill="#DC143C"
        stroke="#003893"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Crescent moon, upper pennant */}
      <path d="M20 15a13 13 0 1 0 0 26 10.5 10.5 0 0 1 0-26z" fill="#FFFFFF" fillRule="evenodd" />
      {/* Twelve-rayed sun, lower pennant */}
      <g fill="#FFFFFF" transform="translate(20 62)">
        <circle r="7" />
        {Array.from({ length: 12 }).map((_, i) => (
          <polygon key={i} points="0,-15 2.6,-7 -2.6,-7" transform={`rotate(${i * 30})`} />
        ))}
      </g>
    </svg>
  );
}

export const FLAGS = {
  DE: FlagGermany,
  NP: FlagNepal,
} as const;

export type CountryCode = keyof typeof FLAGS;

/** Rendered aspect differs per flag, so each carries its own box. */
export const FLAG_CLASS: Record<CountryCode, string> = {
  DE: 'h-4 w-6',
  NP: 'h-6 w-5',
};
