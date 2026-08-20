import { gradeBadgeLabel, gradeValue } from '@/components/Education/grade';

describe('gradeBadgeLabel', () => {
  // data-model.md's behaviour contract table — this is the specification,
  // not just a regression check.
  it.each([
    ['Distinction', 'Distinction'],
    ['1.9 Grade', 'good'], // the live education.json value (research R4)
    ['1.9', 'good'],
    ['1,9', 'good'], // German-locale comma decimal (research R2)
    ['1.5', 'veryGood'], // band boundary
    ['2.5', 'good'], // band boundary
    ['2.6', 'satisfactory'], // band boundary
    ['4.0', 'sufficient'], // band boundary
    ['5.0', '5.0'], // outside the mapped 1.0–4.0 scale, returned as-is
  ])('maps %s -> %s', (input, expected) => {
    expect(gradeBadgeLabel(input)).toBe(expected);
  });

  it.each([
    ['   ', null],
    ['', null],
    [undefined, null],
  ])('treats %s as absent -> %s', (input, expected) => {
    expect(gradeBadgeLabel(input)).toBe(expected);
  });
});

describe('gradeValue', () => {
  // The raw digits behind a gradeBadgeLabel() band, in the source text's
  // own decimal notation — the companion half of the same specification
  // table above, not a separate contract.
  it.each([
    ['Distinction', null], // no leading numeric token — a passthrough classification, not a grade
    ['1.9 Grade', '1.9'], // the live English content
    ['1,9 Note', '1,9'], // the live German content — number-first, per docs/content-editing.md's gotcha note
    ['Note 1,9', null], // number-first is required — this natural German word order has no *leading* digit and doesn't match (the mistake docs/content-editing.md warns about)
    ['1.9', '1.9'],
    ['1,9', '1,9'], // German-locale comma decimal is preserved, not normalized to a period
    ['1.5', '1.5'], // band boundary
    ['4.0', '4.0'], // band boundary
    ['5.0', null], // outside the mapped 1.0–4.0 scale — gradeBadgeLabel returns it as-is, gradeValue has no band to attach it to
  ])('extracts %s -> %s', (input, expected) => {
    expect(gradeValue(input)).toBe(expected);
  });

  it.each([
    ['   ', null],
    ['', null],
    [undefined, null],
  ])('treats %s as absent -> %s', (input, expected) => {
    expect(gradeValue(input)).toBe(expected);
  });
});
