/**
 * The player card's glyphs, drawn rather than imported.
 *
 * ADR 0014 scopes `react-icons` to brand marks in
 * components/Navigation/SocialIcons.tsx. Seven simple shapes do not justify
 * widening that scope, and drawn inline they inherit `currentColor`, so they
 * re-theme with the card for free — which an icon font or a sprite sheet would
 * not.
 *
 * All are decorative: each sits beside text that already says what it means, so
 * they carry aria-hidden and stay out of the accessibility tree.
 */

interface IconProps {
  className?: string;
}

/** Shared across every glyph: same box, same stroke weight, same joins. */
const STROKE_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function PinIcon({ className }: IconProps) {
  return (
    <svg {...STROKE_PROPS} className={className}>
      <path d="M20 10c0 4.4-8 12-8 12s-8-7.6-8-12a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <svg {...STROKE_PROPS} className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function TrophyIcon({ className }: IconProps) {
  return (
    <svg {...STROKE_PROPS} className={className}>
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />
      <path d="M12 14v4M9 20h6" />
    </svg>
  );
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <svg {...STROKE_PROPS} className={className}>
      <path d="M12 3l7 3v5c0 4.4-3 8.4-7 10-4-1.6-7-5.6-7-10V6l7-3Z" />
      <path d="M12 11v3" />
      <circle cx="12" cy="9.5" r="1.4" />
    </svg>
  );
}

export function CodeIcon({ className }: IconProps) {
  return (
    <svg {...STROKE_PROPS} className={className}>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9.5 9.5 7 12l2.5 2.5M14.5 9.5 17 12l-2.5 2.5" />
    </svg>
  );
}

export function CloudIcon({ className }: IconProps) {
  return (
    <svg {...STROKE_PROPS} className={className}>
      <path d="M7 18a4 4 0 0 1 0-8 5.5 5.5 0 0 1 10.5 1.5A3.5 3.5 0 0 1 17 18H7Z" />
    </svg>
  );
}

export function PeopleIcon({ className }: IconProps) {
  return (
    <svg {...STROKE_PROPS} className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 19a6 6 0 0 1 12 0" />
      <path d="M16 5.5a3 3 0 0 1 0 5.8M17 14.2A5.5 5.5 0 0 1 21 19" />
    </svg>
  );
}

/** The AWS certification, which used to be its own badge on the card. */
export function CertIcon({ className }: IconProps) {
  return (
    <svg {...STROKE_PROPS} className={className}>
      <circle cx="12" cy="9" r="5.5" />
      <path d="M8.5 13.5 7 21l5-2.2L17 21l-1.5-7.5" />
    </svg>
  );
}

/**
 * The names content is allowed to use. Content picks which glyph; this module
 * owns what it looks like. A closed map rather than a lookup by string means a
 * typo in home.json fails at the schema (see lib/utils/validation.ts) instead of
 * rendering nothing.
 */
export const ACHIEVEMENT_ICONS = {
  trophy: TrophyIcon,
  shield: ShieldIcon,
  code: CodeIcon,
  cloud: CloudIcon,
  people: PeopleIcon,
  cert: CertIcon,
} as const;

export type AchievementIconName = keyof typeof ACHIEVEMENT_ICONS;
