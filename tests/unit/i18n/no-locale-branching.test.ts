import fs from 'node:fs';
import path from 'node:path';

/**
 * US4 (SC-004, FR-007, tasks.md T057): no component should ever branch on
 * a specific language literal — the whole point of the dictionary/registry
 * design (ADR 0024) is that adding a third locale is a data change, not a
 * code change. This scans every source file under `components/` and `lib/`
 * (excluding `lib/i18n/`, which legitimately owns the registry and the
 * `isLocale()` guard) for a handful of locale-literal comparison shapes.
 *
 * This is a heuristic grep, not a proof. It catches the specific regression
 * shape it's written for — a stray `locale === 'de'` or a `{ de: ... }`
 * lookup table hand-rolled outside `lib/i18n/` — and nothing more. A
 * differently-shaped branch (e.g. through an intermediate variable) would
 * slip past it. Kept deliberately simple to read at a glance (Constitution
 * Principle II) rather than trying to be a real static analyzer.
 */

const ROOTS = ['components', 'lib'];
const EXCLUDED_DIRS = [path.join('lib', 'i18n')];
const FILE_EXTENSIONS = ['.ts', '.tsx'];

const LOCALE_BRANCH_PATTERNS = [
  // `locale === 'de'` / `locale === 'en'` (either quote style, either side).
  /locale\s*===\s*['"](en|de)['"]/,
  /['"](en|de)['"]\s*===\s*locale/,
  // A hand-rolled lookup table keyed by a locale code, e.g. `{ de: ... }`
  // or `{ 'de': ... }`, distinct from the dictionary's own group keys.
  /[{,]\s*['"]?de['"]?\s*:/,
];

function collectSourceFiles(root: string): string[] {
  const absoluteRoot = path.join(process.cwd(), root);
  const files: string[] = [];

  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(process.cwd(), fullPath);

      if (EXCLUDED_DIRS.some((excluded) => relativePath.startsWith(excluded))) continue;

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (FILE_EXTENSIONS.includes(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  };

  walk(absoluteRoot);
  return files;
}

describe('no component branches on a specific locale literal (US4, SC-004)', () => {
  it('contains no locale-literal comparison or hand-rolled locale lookup outside lib/i18n', () => {
    const offenders: string[] = [];

    for (const root of ROOTS) {
      for (const file of collectSourceFiles(root)) {
        // Skip test files — this guard is about production code shape.
        if (file.includes('.test.')) continue;

        const source = fs.readFileSync(file, 'utf-8');
        const lines = source.split('\n');

        lines.forEach((line, index) => {
          if (LOCALE_BRANCH_PATTERNS.some((pattern) => pattern.test(line))) {
            offenders.push(`${path.relative(process.cwd(), file)}:${index + 1}: ${line.trim()}`);
          }
        });
      }
    }

    expect(offenders).toEqual([]);
  });
});
