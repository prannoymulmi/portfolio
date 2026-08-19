// Display-only substitution for the literal "Present" kept in
// `experiences[].dateText` (research R-006). The raw value stays "Present"
// in every locale's content file so `DATE_RANGE_PATTERN`
// (lib/utils/techDuration.ts) keeps parsing it unchanged — this swaps in the
// active locale's word (`ui.career.present`) only at the point of display,
// never in the stored data (ADR 0024).
export function displayDateText(dateText: string, presentLabel: string): string {
  return dateText.replace(/present/i, presentLabel);
}
