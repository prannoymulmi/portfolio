import type { Experience } from '@/lib/types/portfolio';
import { toChapters, toDisplayName, toAbbreviation, DEFAULT_TECH } from '@/components/Career/chapters';

describe('toDisplayName', () => {
  // The five shipped companies (data-model.md §2) — this table is the
  // specification of the derivation rule, not just a regression check.
  it.each([
    ['Clansweb.de', 'Clansweb.de'],
    ['Lustita Limited', 'Lustita'],
    ['Novomind AG', 'Novomind'],
    ['Otto GmbH & Co KG', 'Otto'],
    ['AViV GmbH (Formerly Immowelt GmbH) ', 'AViV'],
  ])('strips legal suffixes and parentheticals: %s -> %s', (company, expected) => {
    expect(toDisplayName(company)).toBe(expected);
  });

  it('never returns an empty string, even if suffix-stripping would consume everything', () => {
    expect(toDisplayName('GmbH & Co KG')).not.toBe('');
  });
});

describe('toAbbreviation', () => {
  it.each([
    ['Clansweb.de', 'CLAN'],
    ['Lustita', 'LUST'],
    ['Novomind', 'NOVO'],
    ['Otto', 'OTTO'],
    ['AViV', 'AVIV'],
  ])('takes the first word, capped at 4 chars, uppercased: %s -> %s', (displayName, expected) => {
    expect(toAbbreviation(displayName)).toBe(expected);
  });

  it('is always 1-4 uppercase characters', () => {
    const abbreviation = toAbbreviation('a');
    expect(abbreviation.length).toBeGreaterThanOrEqual(1);
    expect(abbreviation.length).toBeLessThanOrEqual(4);
    expect(abbreviation).toBe(abbreviation.toUpperCase());
  });
});

describe('toChapters field derivation', () => {
  const baseExperience: Experience = {
    id: 'test',
    title: 'Senior Software Engineer',
    subtitle: 'Otto GmbH & Co KG',
    workType: 'Full-time',
    workDescription: [
      'Led the migration to the new platform.',
      'Cut deployment time from an hour to five minutes.',
      'Mentored two junior engineers onto the team.',
    ],
    dateText: '08/2018 – 10/2020',
  };

  it('takes the first work-description line as builtSummary and the rest as achievements', () => {
    const [chapter] = toChapters([baseExperience]);
    expect(chapter.builtSummary).toBe(baseExperience.workDescription[0]);
    expect(chapter.achievements).toEqual(baseExperience.workDescription.slice(1));
  });

  it('falls back to DEFAULT_TECH when technologies is absent', () => {
    const [chapter] = toChapters([baseExperience]);
    expect(chapter.tech).toEqual(DEFAULT_TECH);
  });

  it('falls back to DEFAULT_TECH when technologies is an empty array', () => {
    const [chapter] = toChapters([{ ...baseExperience, technologies: [] }]);
    expect(chapter.tech).toEqual(DEFAULT_TECH);
  });

  it('keeps the recorded technologies when present, instead of the fallback', () => {
    const [chapter] = toChapters([{ ...baseExperience, technologies: ['Kotlin', 'GCP'] }]);
    expect(chapter.tech).toEqual(['Kotlin', 'GCP']);
  });

  it('derives displayName and abbreviation onto the chapter', () => {
    const [chapter] = toChapters([baseExperience]);
    expect(chapter.displayName).toBe('Otto');
    expect(chapter.abbreviation).toBe('OTTO');
  });

  it('keeps the full company name unshortened', () => {
    const [chapter] = toChapters([baseExperience]);
    expect(chapter.company).toBe('Otto GmbH & Co KG');
  });

  // research R-006, data-model.md §Derived-value keys: `position` is a
  // CareerPosition key (mapped through ui.career.positions at render time),
  // never an English literal like 'Goalkeeper'.
  it('assigns the formation position as an invariant key, not an English literal', () => {
    const [chapter] = toChapters([baseExperience]);
    expect(chapter.position).toBe('goalkeeper');
    expect(chapter.position).not.toBe('Goalkeeper');
  });

  it('cycles through the formation in order for successive chapters', () => {
    const second: Experience = {
      ...baseExperience,
      id: 'test-2',
      subtitle: 'Novomind AG',
      dateText: '10/2020 – 01/2022',
    };
    const [first, secondChapter] = toChapters([baseExperience, second]);
    expect(first.position).toBe('goalkeeper');
    expect(secondChapter.position).toBe('centreBack');
  });
});
