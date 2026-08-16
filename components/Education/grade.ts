/**
 * German university grades are decimals in a fixed 1.0–4.0 scale that reads
 * as meaningless (or backwards — lower is better) to a visitor outside that
 * system. This maps a numeric grade to its English qualitative band label,
 * and passes any non-numeric classification (e.g. "Distinction") through
 * unchanged. Presentation only — nothing here is stored in education.json
 * (data-model.md).
 */
export function gradeBadgeLabel(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  // Match a *leading* numeric token rather than parsing the whole string:
  // the live data is "1.9 Grade", not "1.9", so Number(trimmed) would be
  // NaN and miss the one value this mapping exists for (research R2/R4).
  // A comma decimal ("1,9") is accepted too, for the German-locale spelling.
  const match = /^([0-5])[.,](\d{1,2})/.exec(trimmed);
  if (!match) return trimmed;

  const grade = Number(`${match[1]}.${match[2]}`);
  if (grade < 1.0 || grade > 4.0) return trimmed;

  // An ascending upper-bound chain rather than four two-sided range checks:
  // the spec's bands (1.0–1.5, 1.6–2.5, …) leave gaps like 1.55 unreachable
  // in practice (grades are awarded in tenths), but a two-sided chain would
  // still need an unreachable "none matched" branch. This chain is total
  // over 1.0–4.0 and needs no fallback (research R3).
  if (grade <= 1.5) return 'Very Good';
  if (grade <= 2.5) return 'Good';
  if (grade <= 3.5) return 'Satisfactory';
  return 'Sufficient';
}
