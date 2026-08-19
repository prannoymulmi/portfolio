import {
  parseDateText,
  unionMonths,
  deriveLevel,
  formatDuration,
  barWidthClass,
  buildUsage,
  MAX_BAR_YEARS,
} from '@/lib/utils/techDuration';
import type { Experience, TechnologiesFile } from '@/lib/types/portfolio';
import type { Locale } from '@/lib/i18n/locales';

// SUPPORTED_LOCALES (and therefore the Locale type) is `en`-only in
// production until T047 (research.md, plan.md Decision 4 ordering), but
// formatDuration's Intl.NumberFormat behaviour is locale-generic — this
// bridges the type gap for the German-comma case the same way
// tests/unit/i18n/localeProvider.test.tsx does for its mocked `de` locale.
const TEST_LOCALE_DE = 'de' as unknown as Locale;

describe('parseDateText', () => {
  it('parses an en-dash range like "11/2020 – 03/2026"', () => {
    const result = parseDateText('11/2020 – 03/2026');
    expect(result).not.toBeNull();
    // November 2020 through (not including) April 2026, half-open [start, end).
    expect(result).toEqual({ start: 2020 * 12 + 10, end: 2026 * 12 + 3 });
  });

  it('parses a range ending in "Present" as running to the current month', () => {
    const now = new Date();
    const result = parseDateText('04/2026 – Present');
    expect(result).not.toBeNull();
    expect(result!.start).toBe(2026 * 12 + 3);
    expect(result!.end).toBe(now.getFullYear() * 12 + now.getMonth() + 1);
  });

  it('accepts an em dash separator', () => {
    const result = parseDateText('01/2018 — 08/2018');
    expect(result).toEqual({ start: 2018 * 12 + 0, end: 2018 * 12 + 8 });
  });

  it('accepts a plain hyphen separator', () => {
    const result = parseDateText('01/2018 - 08/2018');
    expect(result).toEqual({ start: 2018 * 12 + 0, end: 2018 * 12 + 8 });
  });

  it('tolerates extra whitespace around the separator and values', () => {
    const result = parseDateText('  01/2018   –   08/2018  ');
    expect(result).toEqual({ start: 2018 * 12 + 0, end: 2018 * 12 + 8 });
  });

  it('is case-insensitive for "Present"', () => {
    const result = parseDateText('04/2026 – present');
    expect(result).not.toBeNull();
  });

  it('returns null, not a throw, for a malformed string', () => {
    expect(parseDateText('not a date range')).toBeNull();
    expect(parseDateText('')).toBeNull();
    expect(() => parseDateText('garbage')).not.toThrow();
  });
});

describe('unionMonths', () => {
  it('sums non-overlapping intervals', () => {
    // Jan-Mar 2020 (2 months) + Jun-Aug 2020 (2 months) = 4 months.
    const total = unionMonths([
      { start: 2020 * 12 + 0, end: 2020 * 12 + 2 },
      { start: 2020 * 12 + 5, end: 2020 * 12 + 7 },
    ]);
    expect(total).toBe(4);
  });

  it('merges overlapping intervals rather than double-counting', () => {
    const total = unionMonths([
      { start: 2020 * 12 + 0, end: 2020 * 12 + 6 },
      { start: 2020 * 12 + 3, end: 2020 * 12 + 9 },
    ]);
    // Union is Jan-Sep 2020 = 9 months, not 6 + 6 = 12.
    expect(total).toBe(9);
  });

  it('merges adjacent intervals (one ends exactly where the next begins)', () => {
    const total = unionMonths([
      { start: 2020 * 12 + 0, end: 2020 * 12 + 6 },
      { start: 2020 * 12 + 6, end: 2020 * 12 + 12 },
    ]);
    expect(total).toBe(12);
  });

  it('is order-independent', () => {
    const forward = unionMonths([
      { start: 2020 * 12 + 0, end: 2020 * 12 + 6 },
      { start: 2020 * 12 + 3, end: 2020 * 12 + 9 },
    ]);
    const backward = unionMonths([
      { start: 2020 * 12 + 3, end: 2020 * 12 + 9 },
      { start: 2020 * 12 + 0, end: 2020 * 12 + 6 },
    ]);
    expect(forward).toBe(backward);
  });

  it('returns 0 for an empty list', () => {
    expect(unionMonths([])).toBe(0);
  });
});

describe('deriveLevel', () => {
  // Invariant keys, not English literals (research R-006) — components map
  // these through ui.technologies.levels[level].
  it('is "dailyDriver" whenever the technology is currently in use', () => {
    expect(deriveLevel(1, true)).toBe('dailyDriver');
    expect(deriveLevel(100, true)).toBe('dailyDriver');
  });

  it('is "production" at and above the 24-month boundary when not current', () => {
    expect(deriveLevel(24, false)).toBe('production');
    expect(deriveLevel(48, false)).toBe('production');
  });

  it('is "workingKnowledge" below the 24-month boundary when not current', () => {
    expect(deriveLevel(23, false)).toBe('workingKnowledge');
    expect(deriveLevel(0, false)).toBe('workingKnowledge');
  });
});

describe('formatDuration', () => {
  // Stand-in for ui.technologies.units.* — this module has no dictionary
  // access of its own, so the caller (a component) supplies these.
  const units = { underOneYear: '< 1 yr', years: '{value} yrs' };

  it('returns null for null input', () => {
    expect(formatDuration(null, 'en', units)).toBeNull();
  });

  it('returns the under-one-year label under twelve months', () => {
    expect(formatDuration(0, 'en', units)).toBe('< 1 yr');
    expect(formatDuration(11, 'en', units)).toBe('< 1 yr');
  });

  it('rounds down to one decimal at and above twelve months', () => {
    // 30 months = 2.5 years exactly.
    expect(formatDuration(30, 'en', units)).toBe('2.5 yrs');
    // 35 months = 2.9166... years, must round DOWN to 2.9, never up to 3.0.
    expect(formatDuration(35, 'en', units)).toBe('2.9 yrs');
    // 12 months = 1.0 years exactly.
    expect(formatDuration(12, 'en', units)).toBe('1.0 yrs');
  });

  it('renders a German decimal comma through Intl.NumberFormat (research R-006)', () => {
    expect(formatDuration(35, TEST_LOCALE_DE, units)).toBe('2,9 yrs');
  });
});

describe('barWidthClass', () => {
  it('returns the empty-track class for null (untraceable)', () => {
    expect(barWidthClass(null)).toBe('w-[0%]');
  });

  it('returns the empty-track class for zero months', () => {
    expect(barWidthClass(0)).toBe('w-[0%]');
  });

  it('returns a literal, non-interpolated Tailwind arbitrary-width class', () => {
    // Every returned value must be one of the fixed 5%-step classes, never a
    // computed string containing anything but a multiple of 5.
    const result = barWidthClass(24);
    expect(result).toMatch(/^w-\[\d+%\]$/);
    expect(Number(result.match(/\d+/)![0]) % 5).toBe(0);
  });

  it('caps at the full-track class once usage reaches MAX_BAR_YEARS', () => {
    expect(barWidthClass(MAX_BAR_YEARS * 12)).toBe('w-[100%]');
    // Longer than the cap never overflows past 100%.
    expect(barWidthClass(MAX_BAR_YEARS * 12 * 2)).toBe('w-[100%]');
  });

  it('scales proportionally between empty and full', () => {
    // Half of MAX_BAR_YEARS should land at (or very near) the 50% step.
    const halfMonths = (MAX_BAR_YEARS * 12) / 2;
    expect(barWidthClass(halfMonths)).toBe('w-[50%]');
  });
});

describe('buildUsage', () => {
  const file: TechnologiesFile = {
    intro: 'Every technology below is tied to a real role and date range from the career history.',
    builtWithNote:
      'This site itself was designed and built with Claude Code, using spec-driven development.',
    categories: ['Cloud & Infrastructure', 'Languages'],
    technologies: [
      {
        name: 'AWS',
        category: 'Cloud & Infrastructure',
        matches: ['AWS'],
        note: 'Architected cloud infrastructure across two roles, from junior backend to senior IAM work.',
      },
      {
        name: 'Cordova',
        category: 'Languages',
        matches: ['Cordova'],
        note: 'Briefly wrapped one web app for a mobile release during a short-lived contract.',
      },
      {
        name: 'Rust',
        category: 'Languages',
        matches: ['Rust'],
        note: 'A technology with no matching role at all in the recorded work history.',
      },
    ],
  };

  const experiences: Experience[] = [
    {
      title: 'Senior Software Engineer',
      subtitle: 'AVIV GmbH',
      workType: 'Full-time',
      workDescription: ['Built authentication services.'],
      technologies: ['AWS'],
      dateText: '11/2020 – 03/2026',
    },
    {
      title: 'Contractor',
      subtitle: 'Short Gig Ltd',
      workType: 'Contract',
      workDescription: ['A brief mobile-wrapping engagement.'],
      technologies: ['Cordova'],
      // Six months — real, dated, but under the one-year floor.
      dateText: '01/2019 – 06/2019',
    },
  ];

  it('omits technologies with no traceable role at all', () => {
    const result = buildUsage(file, experiences);
    expect(result.find((u) => u.name === 'Rust')).toBeUndefined();
  });

  it('omits technologies whose real, traceable usage totals under a year', () => {
    const result = buildUsage(file, experiences);
    expect(result.find((u) => u.name === 'Cordova')).toBeUndefined();
  });

  it('keeps technologies whose traceable usage is a year or more', () => {
    const result = buildUsage(file, experiences);
    const aws = result.find((u) => u.name === 'AWS');
    expect(aws).toBeDefined();
    expect(aws!.totalMonths).not.toBeNull();
    expect(aws!.totalMonths!).toBeGreaterThanOrEqual(12);
  });
});

describe('buildUsage — sinceByEmployer clamp (docs/adr/0023)', () => {
  // Mirrors the real data's shape: a role whose full dateText range would
  // overstate a technology that only started partway through it, plus a
  // second, unclamped role for the same technology that should union in
  // untouched.
  const file: TechnologiesFile = {
    intro: 'Every technology below is tied to a real role and date range from the career history.',
    builtWithNote:
      'This site itself was designed and built with Claude Code, using spec-driven development.',
    categories: ['Security'],
    technologies: [
      {
        name: 'Threat Modeling',
        category: 'Security',
        matches: ['Threat Modeling'],
        // Note: no trailing space, unlike the role's own subtitle below —
        // the whole point of the clamp is that it must still match.
        sinceByEmployer: { 'AViV GmbH (Formerly Immowelt GmbH)': '01/2024' },
        note: 'Identified and mitigated security risks early in design for major features.',
      },
    ],
  };

  it('clamps a matched role start to the since-date rather than the role start', () => {
    const experiences: Experience[] = [
      {
        title: 'Senior Software Engineer',
        // Trailing space, exactly as the real experiences.json has it — the
        // clamp must compare trimmed, not literal, or this silently fails
        // to match and the role's full span leaks through unclamped.
        subtitle: 'AViV GmbH (Formerly Immowelt GmbH) ',
        workType: 'Full-time',
        workDescription: ['Conducted threat modeling on major features.'],
        technologies: ['Threat Modeling'],
        dateText: '11/2020 – 03/2026',
      },
    ];

    const [threatModeling] = buildUsage(file, experiences);
    expect(threatModeling).toBeDefined();

    // 01/2024 through (not including) 04/2026 = 27 months. Not the full
    // 11/2020–03/2026 span (64 months), which the un-clamped role would give.
    expect(threatModeling.totalMonths).toBe(27);
  });

  it('unions the clamped role with an unrelated, unclamped role for the same technology', () => {
    const experiences: Experience[] = [
      {
        title: 'Senior Software Engineer',
        subtitle: 'Statista GmbH',
        workType: 'Full-time',
        workDescription: ['Conducted threat modeling for major features.'],
        technologies: ['Threat Modeling'],
        // Adjacent to the clamped AViV role's end (04/2026 start), and
        // ongoing — this role has no sinceByEmployer entry, so it is
        // unioned in at its own full, unclamped start.
        dateText: '04/2026 – Present',
      },
      {
        title: 'Senior Software Engineer',
        subtitle: 'AViV GmbH (Formerly Immowelt GmbH) ',
        workType: 'Full-time',
        workDescription: ['Conducted threat modeling on major features.'],
        technologies: ['Threat Modeling'],
        dateText: '11/2020 – 03/2026',
      },
    ];

    const [threatModeling] = buildUsage(file, experiences);

    // Clamped AViV (01/2024–04/2026) merges with Statista (04/2026–Present)
    // into one continuous span from 01/2024 to now — the same total a
    // synthetic "01/2024 – Present" role would produce.
    const expected = parseDateText('01/2024 – Present');
    expect(threatModeling.totalMonths).toBe(expected!.end - expected!.start);
  });

  it('leaves a role with no matching sinceByEmployer key fully unclamped', () => {
    const experiences: Experience[] = [
      {
        title: 'Senior Software Engineer',
        // A different employer name — no key for this in sinceByEmployer,
        // so the role's own full start applies.
        subtitle: 'Somewhere Else GmbH',
        workType: 'Full-time',
        workDescription: ['Conducted threat modeling on major features.'],
        technologies: ['Threat Modeling'],
        dateText: '11/2020 – 03/2026',
      },
    ];

    const [threatModeling] = buildUsage(file, experiences);
    // Full 11/2020–03/2026 span = 65 months, not clamped to 27.
    expect(threatModeling.totalMonths).toBe(65);
  });
});
