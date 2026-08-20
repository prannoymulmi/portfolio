// Invariant keys, not English literals (research R-006, data-model.md
// §Derived-value keys) — `EducationSection` maps these through
// `ui.education.grades[band]`, never branching on locale directly (ADR 0024).
export type GradeBand = 'veryGood' | 'good' | 'satisfactory' | 'sufficient';

const GRADE_BANDS: readonly GradeBand[] = ['veryGood', 'good', 'satisfactory', 'sufficient'];

/** Narrows a `gradeBadgeLabel` result down to a `GradeBand` the dictionary
 * can map, as opposed to a passthrough classification like "Distinction". */
export function isGradeBand(value: string): value is GradeBand {
  return (GRADE_BANDS as string[]).includes(value);
}

/** Shared by gradeBadgeLabel and gradeValue below — matches a *leading*
 * numeric token rather than parsing the whole string: the live data is
 * "1.9 Grade", not "1.9", so Number(trimmed) would be NaN and miss the one
 * value this mapping exists for (research R2/R4). A comma decimal ("1,9")
 * is accepted too, for the German-locale spelling — the separator is
 * captured, not discarded, so a caller that wants the original digits back
 * (gradeValue) can preserve whichever mark the source text used instead of
 * normalizing it. */
function matchLeadingGrade(
  trimmed: string,
): { integer: string; separator: '.' | ','; decimal: string } | null {
  const match = /^([0-5])([.,])(\d{1,2})/.exec(trimmed);
  if (!match) return null;
  return { integer: match[1], separator: match[2] as '.' | ',', decimal: match[3] };
}

/**
 * German university grades are decimals in a fixed 1.0–4.0 scale that reads
 * as meaningless (or backwards — lower is better) to a visitor outside that
 * system. This maps a numeric grade to its qualitative band key, and passes
 * any non-numeric classification (e.g. "Distinction") through unchanged.
 * Presentation only — nothing here is stored in education.json
 * (data-model.md).
 */
export function gradeBadgeLabel(value?: string): GradeBand | string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const parsed = matchLeadingGrade(trimmed);
  if (!parsed) return trimmed;

  const grade = Number(`${parsed.integer}.${parsed.decimal}`);
  if (grade < 1.0 || grade > 4.0) return trimmed;

  // An ascending upper-bound chain rather than four two-sided range checks:
  // the spec's bands (1.0–1.5, 1.6–2.5, …) leave gaps like 1.55 unreachable
  // in practice (grades are awarded in tenths), but a two-sided chain would
  // still need an unreachable "none matched" branch. This chain is total
  // over 1.0–4.0 and needs no fallback (research R3).
  if (grade <= 1.5) return 'veryGood';
  if (grade <= 2.5) return 'good';
  if (grade <= 3.5) return 'satisfactory';
  return 'sufficient';
}

/**
 * The raw grade digits behind a gradeBadgeLabel() band, in the source
 * text's own decimal notation ("1.9" for the English content, "1,9" for the
 * German) rather than renormalized to a fixed separator — so a badge can
 * read "Good (1.9)" / "Gut (1,9)" without the number looking translated
 * when the label beside it is. Returns null for anything gradeBadgeLabel
 * doesn't map to a band (a passthrough classification like "Distinction",
 * or no leading numeric token at all): there is no raw value to show
 * alongside those, only the classification itself.
 */
export function gradeValue(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const parsed = matchLeadingGrade(trimmed);
  if (!parsed) return null;

  const grade = Number(`${parsed.integer}.${parsed.decimal}`);
  if (grade < 1.0 || grade > 4.0) return null;

  return `${parsed.integer}${parsed.separator}${parsed.decimal}`;
}
