/**
 * Inline SVG flags rather than emoji: flag emoji don't render on Windows
 * Chrome (they fall back to letter pairs), which is a large share of the
 * audience this page is written for.
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

/**
 * Nepal — the only non-rectangular national flag, so the silhouette is the
 * whole recognisability of it and worth getting right.
 *
 * Laid out from the construction in Schedule 1 of Nepal's constitution, with
 * the bottom edge AB as the unit: the left edge runs the full height (4/3 of
 * AB), the lower pennant ends in a point at the bottom-right corner so its
 * bottom edge is horizontal, and the upper pennant's lower edge is horizontal
 * too, meeting the lower pennant's hypotenuse at a concave notch a little
 * under a third of the way in.
 *
 * Both emblems are white and rayed: the moon is a crescent with its horns up
 * under a fan of eight rays, the sun a disc with twelve.
 */
export function FlagNepal({ className }: { className?: string }) {
  // Rays are drawn as triangles rotated about the emblem's centre.
  const ray = (inner: number, outer: number, halfWidth: number) =>
    `0,${-outer} ${halfWidth},${-inner} ${-halfWidth},${-inner}`;

  return (
    <svg viewBox="0 0 316 416" className={className} role="img" aria-label="Nepal">
      {/* Crimson field with a deep blue border. The stroke is centred on the
          path, so the path is inset by half its width to stay in the box, and
          mitred rather than rounded so the two pennants keep their points —
          every join here is wide enough to stay inside the default 4x limit. */}
      <path
        d="M8 408V8l246 188H96l212 212z"
        fill="#DC143C"
        stroke="#003893"
        strokeWidth="16"
        strokeLinejoin="miter"
      />

      {/* Moon, upper pennant: horns up, eight rays fanned over the top. The
          rays stay short so the crescent, not the fan, is what carries it. */}
      <g fill="#FFFFFF" transform="translate(78 143)">
        {[-78.75, -56.25, -33.75, -11.25, 11.25, 33.75, 56.25, 78.75].map((angle) => (
          <polygon key={angle} points={ray(27, 41, 6.5)} transform={`rotate(${angle})`} />
        ))}
        {/* A disc with a second disc lifted out of its top. */}
        <path
          d="M-24 0a24 24 0 0 0 48 0 24 24 0 0 0-48 0zM-21 -11a21 21 0 0 0 42 0 21 21 0 0 0-42 0z"
          fillRule="evenodd"
        />
      </g>

      {/* Sun, lower pennant: twelve rays */}
      <g fill="#FFFFFF" transform="translate(110 311)">
        {Array.from({ length: 12 }).map((_, i) => (
          <polygon key={i} points={ray(28, 58, 8)} transform={`rotate(${i * 30})`} />
        ))}
        <circle r="25" />
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
  DE: 'h-6 w-10',
  NP: 'h-9 w-7',
};
