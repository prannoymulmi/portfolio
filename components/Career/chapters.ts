import type { Experience } from '@/lib/types/portfolio';

export interface CareerChapter {
  id: string;
  /** Chronological chapter number, 1 = earliest. */
  order: number;
  company: string;
  role: string;
  years: string;
  achievements: string[];
  tech: string[];
  /** Football position this chapter occupies, from the formation below. */
  position: string;
  /** Percent coordinates on the pitch. */
  x: number;
  y: number;
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
const FORMATION = [
  { position: 'Goalkeeper', x: 8, y: 50 },
  { position: 'Centre back', x: 26, y: 26 },
  { position: 'Left back', x: 26, y: 74 },
  { position: 'Defensive midfield', x: 44, y: 50 },
  { position: 'Playmaker', x: 60, y: 28 },
  { position: 'Right wing', x: 66, y: 72 },
  { position: 'Striker', x: 84, y: 46 },
] as const;

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
      return {
        id: experience.id ?? `${experience.subtitle}-${experience.dateText}`,
        order: index + 1,
        company: experience.subtitle,
        role: experience.title,
        years: experience.dateText,
        achievements: experience.workDescription ?? [],
        tech: experience.technologies ?? [],
        position: slot.position,
        x: slot.x,
        y: slot.y,
      };
    });
}
