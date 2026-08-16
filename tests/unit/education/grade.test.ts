import { gradeBadgeLabel } from '@/components/Education/grade';

describe('gradeBadgeLabel', () => {
  // data-model.md's behaviour contract table — this is the specification,
  // not just a regression check.
  it.each([
    ['Distinction', 'Distinction'],
    ['1.9 Grade', 'Good'], // the live education.json value (research R4)
    ['1.9', 'Good'],
    ['1,9', 'Good'], // German-locale comma decimal (research R2)
    ['1.5', 'Very Good'], // band boundary
    ['2.5', 'Good'], // band boundary
    ['2.6', 'Satisfactory'], // band boundary
    ['4.0', 'Sufficient'], // band boundary
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
