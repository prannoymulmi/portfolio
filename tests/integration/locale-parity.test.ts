import fs from 'node:fs';
import path from 'node:path';
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/i18n/locales';

/**
 * Enforces contracts/locale-content-set.md §Parity invariants: for every
 * non-English locale directory that ships a given file, array-valued
 * top-level content has the same length as English; every locale-invariant
 * field from research R-005 is byte-identical entry-for-entry (matched by
 * `id`); and every `technologies[].matches[]` value resolves inside that
 * same locale's `experiences[].technologies[]`.
 *
 * SUPPORTED_LOCALES holds only `en` until T047 (research.md, plan.md
 * Decision 4 ordering), so today this discovers zero non-English locale
 * directories and every `it` below is vacuously true — the same trivial-pass
 * shape as tests/unit/i18n/ui-parity.test.ts. It becomes load-bearing the
 * moment `public/data/de/` exists (T044–T046).
 */

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

function readJson(locale: string, file: string): Record<string, unknown> | null {
  const filePath = path.join(DATA_DIR, locale, file);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

/** Locales this repo actually ships a directory for, other than English. */
const nonEnglishLocales = SUPPORTED_LOCALES.map((entry) => entry.code).filter(
  (code) => code !== DEFAULT_LOCALE && fs.existsSync(path.join(DATA_DIR, code)),
);

interface ArrayFileSpec {
  file: string;
  /** The top-level array key holding the file's entries. */
  key: string;
  /** Fields that must be byte-identical to English, entry-matched by `id`
   * where present, otherwise by array index. */
  invariantFields: string[];
}

const ARRAY_FILES: ArrayFileSpec[] = [
  { file: 'experiences.json', key: 'experiences', invariantFields: ['id', 'dateText', 'subtitle', 'technologies'] },
  { file: 'education.json', key: 'education', invariantFields: ['url', 'media'] },
  { file: 'projects.json', key: 'projects', invariantFields: ['id', 'year', 'image', 'links'] },
  { file: 'systems.json', key: 'projects', invariantFields: ['id', 'year', 'image', 'links'] },
];

describe('locale content parity (contracts/locale-content-set.md)', () => {
  it('discovers the locale registry, even when it holds only English today', () => {
    expect(SUPPORTED_LOCALES.length).toBeGreaterThan(0);
  });

  // `describe.each` throws on an empty table rather than skipping quietly,
  // and today's registry (lib/i18n/locales.ts) ships `en` only — this guard
  // (rather than calling describe.each with an empty array) is what keeps
  // the suite passing trivially, the same shape tests/unit/i18n/ui-parity.test.ts
  // already has, until T044 adds a real `public/data/de/` directory.
  if (nonEnglishLocales.length === 0) {
    it.skip('has no non-English locale directory to check yet', () => {});
    return;
  }

  describe.each(nonEnglishLocales)('locale "%s"', (locale: string) => {
    describe.each(ARRAY_FILES)('$file', ({ file, key, invariantFields }) => {
      it('has the same entry count as the English file', () => {
        const localeData = readJson(locale, file);
        const enData = readJson(DEFAULT_LOCALE, file);
        if (!localeData || !enData) return; // locale may omit the file (FR-006)

        const localeArray = localeData[key] as unknown[];
        const enArray = enData[key] as unknown[];
        expect(localeArray.length).toBe(enArray.length);
      });

      it('keeps every locale-invariant field byte-identical to English, matched by id', () => {
        const localeData = readJson(locale, file);
        const enData = readJson(DEFAULT_LOCALE, file);
        if (!localeData || !enData) return;

        const localeArray = localeData[key] as Array<Record<string, unknown>>;
        const enArray = enData[key] as Array<Record<string, unknown>>;

        localeArray.forEach((entry, index) => {
          const match =
            typeof entry.id === 'string'
              ? enArray.find((enEntry) => enEntry.id === entry.id)
              : enArray[index];
          expect(match).toBeDefined();
          invariantFields.forEach((field) => {
            if (field in entry || (match && field in match)) {
              expect(entry[field]).toEqual(match?.[field]);
            }
          });
        });
      });
    });

    describe('technologies.json', () => {
      it('has the same entry count as the English file', () => {
        const localeData = readJson(locale, 'technologies.json');
        const enData = readJson(DEFAULT_LOCALE, 'technologies.json');
        if (!localeData || !enData) return;

        expect((localeData.technologies as unknown[]).length).toBe(
          (enData.technologies as unknown[]).length,
        );
      });

      it('keeps name, matches[] and sinceByEmployer byte-identical to English', () => {
        const localeData = readJson(locale, 'technologies.json');
        const enData = readJson(DEFAULT_LOCALE, 'technologies.json');
        if (!localeData || !enData) return;

        const localeTechs = localeData.technologies as Array<Record<string, unknown>>;
        const enTechs = enData.technologies as Array<Record<string, unknown>>;

        localeTechs.forEach((tech) => {
          const match = enTechs.find((enTech) => enTech.name === tech.name);
          expect(match).toBeDefined();
          expect(tech.matches).toEqual(match?.matches);
          expect(tech.sinceByEmployer).toEqual(match?.sinceByEmployer);
        });
      });

      it("resolves every technologies[].matches[] value inside this locale's own experiences[].technologies[]", () => {
        const techData = readJson(locale, 'technologies.json');
        const expData = readJson(locale, 'experiences.json');
        if (!techData || !expData) return;

        const experienceTechs = new Set(
          (expData.experiences as Array<{ technologies?: string[] }>).flatMap(
            (experience) => experience.technologies ?? [],
          ),
        );

        const technologies = techData.technologies as Array<{ name: string; matches: string[] }>;
        technologies.forEach((tech) => {
          tech.matches.forEach((matchValue) => {
            expect(experienceTechs.has(matchValue)).toBe(true);
          });
        });
      });
    });
  });
});
