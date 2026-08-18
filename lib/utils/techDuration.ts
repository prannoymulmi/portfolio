import type { Experience, TechnologiesFile } from '@/lib/types/portfolio';

/**
 * Half-open month interval, `[start, end)`, counted in months since epoch
 * (`year * 12 + monthIndex`, `monthIndex` 0-based so January = 0). `end` is
 * exclusive: a role spanning January through August inclusive is
 * `[year*12+0, year*12+8)`, which is 8 months — the calendar span it actually
 * covers, not 7 (data-model.md).
 */
export interface MonthInterval {
  start: number;
  end: number;
}

export type Level = 'Daily driver' | 'Production' | 'Working knowledge';

/** The matched roles behind one technology's duration, most recent first —
 * feeds the detail panel's traceability line (User Story 3). */
export interface TechnologyUsageRole {
  title: string;
  employer: string;
  dateText: string;
}

export interface TechnologyUsage {
  name: string;
  category: string;
  note: string;
  /**
   * `null` when no matched role has a parsable `dateText`. `buildUsage` omits
   * any technology that ends up `null` here, or under a year, from its
   * result entirely — this field stays nullable on the type because it is
   * also the shape callers construct directly in tests, not because
   * `buildUsage` itself ever returns one.
   */
  totalMonths: number | null;
  /** `null` exactly when `totalMonths` is `null` — a level with no evidence
   * behind it would be the one unverifiable claim in this chapter. */
  level: Level | null;
  /** True when any matched role's range ends in `Present`. */
  isCurrent: boolean;
  roles: TechnologyUsageRole[];
}

/**
 * Threshold, in months, at and above which a technology no longer in current
 * use is labelled "Production" rather than "Working knowledge" (research
 * R-005). A presentation rule, not a claim about skill — the number is
 * chosen to read as "used long enough to matter", not as a certification.
 */
const PRODUCTION_MONTHS_THRESHOLD = 24;

/**
 * Below this many months, a duration is shown as "< 1 yr" rather than a
 * fractional year — "0.3 yrs" reads as more precise than it is.
 */
const MIN_MONTHS_FOR_YEAR_DISPLAY = 12;

/** `MM/YYYY [sep] MM/YYYY` or `MM/YYYY [sep] Present`, `sep` one of
 * en dash, em dash, or hyphen, with any amount of surrounding whitespace. */
const DATE_RANGE_PATTERN =
  /^\s*(\d{2})\/(\d{4})\s*[-–—]\s*(?:(\d{2})\/(\d{4})|present)\s*$/i;

/**
 * Parses `dateText` (e.g. `"11/2020 – 03/2026"` or `"04/2026 – Present"`)
 * into a half-open month interval. Never throws: an unrecognised shape
 * returns `null` so the caller can log and skip it rather than crash the
 * chapter (research R-004).
 */
export function parseDateText(dateText: string, now: Date = new Date()): MonthInterval | null {
  const match = DATE_RANGE_PATTERN.exec(dateText);
  if (!match) return null;

  const [, startMonthStr, startYearStr, endMonthStr, endYearStr] = match;
  const startMonth = Number(startMonthStr);
  const startYear = Number(startYearStr);
  if (startMonth < 1 || startMonth > 12) return null;

  const start = startYear * 12 + (startMonth - 1);

  if (endMonthStr && endYearStr) {
    const endMonth = Number(endMonthStr);
    const endYear = Number(endYearStr);
    if (endMonth < 1 || endMonth > 12) return null;
    // Exclusive end: one past the end month's own zero-based index, so the
    // end month itself is counted in the span.
    const end = endYear * 12 + endMonth;
    if (end <= start) return null;
    return { start, end };
  }

  // "Present": the current month, evaluated once per render.
  const end = now.getFullYear() * 12 + (now.getMonth() + 1);
  if (end <= start) return null;
  return { start, end };
}

/**
 * Parses a bare `"MM/YYYY"` value (as used by `Technology.sinceByEmployer`)
 * into the same month-index space `parseDateText` uses. `null` on anything
 * else — never throws.
 */
function parseMonthYear(value: string): number | null {
  const match = /^\s*(\d{2})\/(\d{4})\s*$/.exec(value);
  if (!match) return null;

  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return null;

  return year * 12 + (month - 1);
}

/**
 * Applies `Technology.sinceByEmployer` (docs/adr/0023) to one role's parsed
 * interval start. `employerSubtitle` is compared trimmed against the map's
 * keys, since `experiences.json` subtitles are not guaranteed to be
 * trim-clean. Returns `roleStart` unchanged when there is no override, the
 * override doesn't parse, or the override is actually earlier than the role
 * itself (a since-date cannot push a start earlier than the role's own).
 */
function clampIntervalStart(
  sinceByEmployer: Record<string, string> | undefined,
  employerSubtitle: string,
  roleStart: number,
): number {
  if (!sinceByEmployer) return roleStart;

  const since = sinceByEmployer[employerSubtitle.trim()];
  if (!since) return roleStart;

  const sinceMonth = parseMonthYear(since);
  if (sinceMonth === null) return roleStart;

  return Math.max(roleStart, sinceMonth);
}

/**
 * Total months covered by the union of `intervals` — overlapping and
 * adjacent ranges merge into one continuous span rather than being summed,
 * so a technology used across concurrent or back-to-back roles is not
 * double-counted (research R-003). Order-independent.
 */
export function unionMonths(intervals: MonthInterval[]): number {
  if (intervals.length === 0) return 0;

  const sorted = [...intervals].sort((a, b) => a.start - b.start);
  let total = 0;
  let currentStart = sorted[0].start;
  let currentEnd = sorted[0].end;

  for (const interval of sorted.slice(1)) {
    if (interval.start <= currentEnd) {
      // Overlapping or adjacent (interval.start === currentEnd): extend.
      currentEnd = Math.max(currentEnd, interval.end);
    } else {
      total += currentEnd - currentStart;
      currentStart = interval.start;
      currentEnd = interval.end;
    }
  }
  total += currentEnd - currentStart;

  return total;
}

/**
 * Derives a proficiency label from total months and current use. Pure lookup
 * against the named threshold above — never hand-authored (research R-005).
 */
export function deriveLevel(totalMonths: number, isCurrent: boolean): Level {
  if (isCurrent) return 'Daily driver';
  if (totalMonths >= PRODUCTION_MONTHS_THRESHOLD) return 'Production';
  return 'Working knowledge';
}

/**
 * Formats total months as a duration string. `null` in, `null` out. Below
 * twelve months renders `"< 1 yr"` rather than a fraction. At and above
 * twelve months, years are shown to one decimal, always rounded **down** —
 * an overstated duration is the specific failure this chapter exists to
 * avoid (research R-003).
 */
export function formatDuration(totalMonths: number | null): string | null {
  if (totalMonths === null) return null;
  if (totalMonths < MIN_MONTHS_FOR_YEAR_DISPLAY) return '< 1 yr';

  const years = Math.floor((totalMonths / 12) * 10) / 10;
  return `${years.toFixed(1)} yrs`;
}

/**
 * Composes `TechnologyUsage[]` from the stored content file and the site's
 * recorded work history. Matching is case-insensitive, trimmed, exact
 * equality between `Technology.matches` and a role's `technologies` (research
 * R-002) — no fuzzy or substring matching.
 *
 * Technologies whose usage cannot be traced to a dated role at all
 * (`totalMonths === null`), and technologies used for under a year
 * (`totalMonths < MIN_MONTHS_FOR_YEAR_DISPLAY`), are omitted from the result
 * entirely rather than rendered with no duration or with "< 1 yr" — the
 * chapter's claim is real, evidenced depth, not a complete inventory of
 * everything ever touched (spec Edge Cases, tightened per user feedback: a
 * technology below one year of real use does not belong in this list at all,
 * not merely without a number next to it).
 *
 * Deterministic ordering: category order (as given in `file.categories`),
 * then `totalMonths` descending, then `name` ascending — so a tie never
 * silently reorders between renders.
 */
export function buildUsage(file: TechnologiesFile, experiences: Experience[]): TechnologyUsage[] {
  const categoryOrder = new Map(file.categories.map((category, index) => [category, index]));

  const usages = file.technologies.map((tech): TechnologyUsage => {
    const matchSet = new Set(tech.matches.map((m) => m.trim().toLowerCase()));

    const matchedRoles = experiences.filter((experience) =>
      (experience.technologies ?? []).some((t) => matchSet.has(t.trim().toLowerCase())),
    );

    const intervals: MonthInterval[] = [];
    let anyParsed = false;

    for (const role of matchedRoles) {
      const interval = parseDateText(role.dateText);
      if (!interval) {
        console.error(
          `techDuration: could not parse dateText "${role.dateText}" for role "${role.title}" while computing duration for "${tech.name}"`,
        );
        continue;
      }

      // sinceByEmployer (docs/adr/0023): a technology can start partway
      // through an otherwise fully-matched role rather than at that role's
      // own start (e.g. threat modeling began partway through a still-
      // ongoing role). Compared trimmed — experiences.json subtitles are not
      // guaranteed to be trim-clean (AViV's carries a trailing space). Clamps
      // only this one role's contribution; every other role and technology
      // is unaffected.
      const clampedStart = clampIntervalStart(tech.sinceByEmployer, role.subtitle, interval.start);
      const clamped: MonthInterval = { start: clampedStart, end: interval.end };

      // The clamp can push the start past the role's own end (a since-date
      // typo, or a role that ended before the claimed start) — such a role
      // contributes nothing rather than a negative span.
      if (clamped.start >= clamped.end) continue;

      intervals.push(clamped);
      anyParsed = true;
    }

    const totalMonths = anyParsed ? unionMonths(intervals) : null;
    const isCurrent = matchedRoles.some((role) => /present\s*$/i.test(role.dateText.trim()));
    const level = totalMonths === null ? null : deriveLevel(totalMonths, isCurrent);

    // Most recent first: roles are already in that order in experiences.json
    // (see the file's own convention), but sort defensively by parsed start
    // so the panel is correct even if a future edit reorders the source file.
    const sortedRoles = [...matchedRoles].sort((a, b) => {
      const aStart = parseDateText(a.dateText)?.start ?? -Infinity;
      const bStart = parseDateText(b.dateText)?.start ?? -Infinity;
      return bStart - aStart;
    });

    return {
      name: tech.name,
      category: tech.category,
      note: tech.note,
      totalMonths,
      level,
      isCurrent,
      roles: sortedRoles.map((role) => ({
        title: role.title,
        employer: role.subtitle,
        dateText: role.dateText,
      })),
    };
  });

  // Omit anything untraceable or under a year of real use — see the
  // docstring above. Every remaining entry has a non-null totalMonths >= the
  // display threshold, so the comparator below never needs a null branch.
  const traceableUsages = usages.filter(
    (usage) => usage.totalMonths !== null && usage.totalMonths >= MIN_MONTHS_FOR_YEAR_DISPLAY,
  );

  return traceableUsages.sort((a, b) => {
    const categoryDiff = (categoryOrder.get(a.category) ?? 0) - (categoryOrder.get(b.category) ?? 0);
    if (categoryDiff !== 0) return categoryDiff;

    if (a.totalMonths !== b.totalMonths) {
      return (b.totalMonths as number) - (a.totalMonths as number);
    }

    return a.name.localeCompare(b.name);
  });
}

/**
 * The cap the depth bar treats as "full" — eight years covers the longest
 * real span in the data today (AWS, spanning three roles since 08/2018) with
 * room to grow.
 */
export const MAX_BAR_YEARS = 8;

/**
 * Literal, non-interpolated Tailwind arbitrary-value width classes, one per
 * 5% step from 0 to 100. Written out in full, as a fixed lookup, rather than
 * built from a template string (`` `w-[${pct}%]` ``) — Tailwind's static
 * scanner only emits CSS for class names it can see verbatim in the source,
 * and an interpolated string is invisible to it. Indexing into this literal
 * array at runtime is ordinary application logic, not a class name assembled
 * at runtime, so it stays inside the constitution's inline-style rule
 * (research R-006) while still drawing a continuous-looking, gradient-filled
 * bar rather than discrete cells.
 */
const BAR_WIDTH_CLASSES = [
  'w-[0%]',
  'w-[5%]',
  'w-[10%]',
  'w-[15%]',
  'w-[20%]',
  'w-[25%]',
  'w-[30%]',
  'w-[35%]',
  'w-[40%]',
  'w-[45%]',
  'w-[50%]',
  'w-[55%]',
  'w-[60%]',
  'w-[65%]',
  'w-[70%]',
  'w-[75%]',
  'w-[80%]',
  'w-[85%]',
  'w-[90%]',
  'w-[95%]',
  'w-[100%]',
] as const;

/**
 * Picks the closest of the fixed width steps above for `totalMonths`, as a
 * fraction of `MAX_BAR_YEARS`. `null` (untraceable) renders an empty bar —
 * in practice `buildUsage` never lets a `null` reach this function, since it
 * omits such technologies from its result before render, but the function
 * stays total so a direct caller (e.g. a test) never gets a crash.
 */
export function barWidthClass(totalMonths: number | null): string {
  if (totalMonths === null) return BAR_WIDTH_CLASSES[0];

  const years = totalMonths / 12;
  const percent = Math.min(years / MAX_BAR_YEARS, 1) * 100;
  const stepIndex = Math.round(percent / 5);
  return BAR_WIDTH_CLASSES[stepIndex];
}
