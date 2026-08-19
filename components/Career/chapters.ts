import type { Experience } from '@/lib/types/portfolio';

// Invariant keys, not English literals (research R-006, data-model.md
// §Derived-value keys) — components map these through
// `ui.career.positions[position]`, never branching on locale directly
// (ADR 0024).
export type CareerPosition =
  | 'goalkeeper'
  | 'centreBack'
  | 'leftBack'
  | 'defensiveMidfield'
  | 'playmaker'
  | 'rightWing'
  | 'striker';

export interface CareerChapter {
  id: string;
  /** Chronological chapter number, 1 = earliest. */
  order: number;
  /** Full, unshortened name — shown in the detail panel and the pill list. */
  company: string;
  /** Shortened company name for the pitch label, where space is tight (FR-005). */
  displayName: string;
  /** displayName's first word, capped at 4 characters, uppercased (FR-013). */
  abbreviation: string;
  role: string;
  years: string;
  /** First work-description line, read as a short "what I built" summary (FR-008). */
  builtSummary: string;
  achievements: string[];
  tech: string[];
  /** Football position this chapter occupies, from the formation below. */
  position: CareerPosition;
  /** Percent coordinates on the pitch. */
  x: number;
  y: number;
}

/**
 * Fallback tech list for any entry in `experiences.json` that omits its own
 * `technologies` array (FR-012, spec clarification 2). Most chapters still
 * rely on this default; entries with a role-specific stack (e.g. Statista,
 * AViV) set `technologies` explicitly and take precedence over it below.
 */
export const DEFAULT_TECH = ['AWS', 'Java', 'Terraform', 'TypeScript'];

/**
 * Legal-form tokens stripped from the end of a company name, repeatedly,
 * case-insensitively — "Otto GmbH & Co KG" needs four passes (KG, Co, &,
 * GmbH) before it reaches "Otto" (data-model.md §2).
 */
const LEGAL_FORM_SUFFIXES = [
  'GmbH',
  'mbH',
  'AG',
  'SE',
  'KG',
  'Co',
  '&',
  'Ltd.',
  'Ltd',
  'Limited',
  'Inc.',
  'Inc',
  'LLC',
  'BV',
  'NV',
];

/**
 * Shortens a company's full legal name for on-pitch display (FR-005, FR-013):
 * strips parentheticals, then repeatedly strips a trailing legal-form token,
 * then collapses whitespace. Falls back to the trimmed original if stripping
 * would otherwise leave nothing — the pitch always needs a name to show.
 */
export function toDisplayName(company: string): string {
  let name = company.replace(/\([^)]*\)/g, '');

  let stripped = true;
  while (stripped) {
    stripped = false;
    for (const suffix of LEGAL_FORM_SUFFIXES) {
      const pattern = new RegExp(`\\s+${suffix.replace('&', '&')}\\s*$`, 'i');
      if (pattern.test(name)) {
        name = name.replace(pattern, '');
        stripped = true;
      }
    }
  }

  name = name.replace(/\s+/g, ' ').trim();
  return name.length > 0 ? name : company.trim();
}

/** displayName's first word, capped at 4 characters, uppercased (FR-013). */
export function toAbbreviation(displayName: string): string {
  return displayName.split(/\s+/)[0].slice(0, 4).toUpperCase();
}

/**
 * Where a career chapter stands on the pitch, earliest first: the story starts
 * in goal and ends at the striker, so the build-up play runs left to right the
 * way a move does.
 *
 * Positions are assigned by chronological index rather than stored per
 * experience. Storing them would mean hand-maintaining coordinate geometry in
 * a content file every time a job is added — and the coordinates carry no
 * information a reader could recover, unlike the order they encode.
 */
const FORMATION: { position: CareerPosition; x: number; y: number }[] = [
  { position: 'goalkeeper', x: 8, y: 50 },
  { position: 'centreBack', x: 26, y: 26 },
  { position: 'leftBack', x: 26, y: 74 },
  { position: 'defensiveMidfield', x: 44, y: 50 },
  { position: 'playmaker', x: 60, y: 28 },
  { position: 'rightWing', x: 66, y: 72 },
  { position: 'striker', x: 84, y: 46 },
];

/**
 * A sortable MM/YYYY start date, as year*12+month — `dateText` is free-form
 * ("11/2020 – 03/2025", "08/2018 – 10/2020"), so this reads the leading
 * MM/YYYY rather than trying to parse a date range.
 *
 * Year alone is not enough: two chapters starting in the same year but
 * different months (Novomind 01/2018, Otto 08/2018) tied at "2018", and a
 * stable sort left them in whatever order the JSON happened to list them —
 * Otto ahead of Novomind, seven months out of order. Month is the fix, not
 * just a nicety.
 *
 * Anything with no leading MM/YYYY sorts last, which puts "Present"-style
 * current roles at the end where they belong.
 */
function startSortKey(dateText: string): number {
  const match = dateText.match(/(\d{1,2})\/(\d{4})/);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const [, month, year] = match;
  return Number(year) * 12 + Number(month);
}

/**
 * Most recent first, for the plain timeline.
 *
 * The previous implementation sorted on `new Date(a.dateText)`, but the
 * strings are ranges like "11/2020 – Present" — `Date` returns `Invalid Date`,
 * every comparison was `NaN`, and the sort silently did nothing. Extracting
 * the year is what the format actually supports.
 */
export function byMostRecentFirst(experiences: Experience[]): Experience[] {
  return [...experiences].sort((a, b) => startSortKey(b.dateText) - startSortKey(a.dateText));
}

/** Career chapters, oldest first, each with its pitch position. */
export function toChapters(experiences: Experience[]): CareerChapter[] {
  return [...experiences]
    .sort((a, b) => startSortKey(a.dateText) - startSortKey(b.dateText))
    .map((experience, index) => {
      const slot = FORMATION[index % FORMATION.length];
      const displayName = toDisplayName(experience.subtitle);
      const workDescription = experience.workDescription ?? [];
      return {
        id: experience.id ?? `${experience.subtitle}-${experience.dateText}`,
        order: index + 1,
        company: experience.subtitle,
        displayName,
        abbreviation: toAbbreviation(displayName),
        role: experience.title,
        years: experience.dateText,
        // First line reads as the "what I built" summary; the rest stay as
        // achievements, so every authored line still renders exactly once
        // (FR-008, FR-009) rather than the summary duplicating the list.
        builtSummary: workDescription[0] ?? '',
        achievements: workDescription.slice(1),
        tech: experience.technologies && experience.technologies.length > 0
          ? experience.technologies
          : DEFAULT_TECH,
        position: slot.position,
        x: slot.x,
        y: slot.y,
      };
    });
}
