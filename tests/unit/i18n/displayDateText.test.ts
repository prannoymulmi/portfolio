import { displayDateText } from '@/lib/i18n/displayDateText';

describe('displayDateText', () => {
  it('substitutes the trailing "Present" for the given label', () => {
    expect(displayDateText('11/2020 – Present', 'Heute')).toBe('11/2020 – Heute');
  });

  it('is case-insensitive, matching the same tolerance as DATE_RANGE_PATTERN', () => {
    expect(displayDateText('11/2020 – present', 'Heute')).toBe('11/2020 – Heute');
  });

  it('leaves a fully-dated range unchanged', () => {
    expect(displayDateText('01/2018 – 08/2018', 'Heute')).toBe('01/2018 – 08/2018');
  });

  it('never mutates the stored literal — only the returned display string changes', () => {
    const source = '11/2020 – Present';
    displayDateText(source, 'Heute');
    expect(source).toBe('11/2020 – Present');
  });
});
