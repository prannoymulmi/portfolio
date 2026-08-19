import fs from 'node:fs';
import path from 'node:path';
import { parseDateText, buildUsage } from '@/lib/utils/techDuration';
import { SUPPORTED_LOCALES } from '@/lib/i18n/locales';
import type { TechnologiesFile, ExperiencesFile } from '@/lib/types/portfolio';

/**
 * The site fetches its content from `/data/<locale>/*.json`, which resolves
 * from `public/`. A second, unserved set of the same files once existed
 * under `app/data/` and had drifted — it held the *correct* LinkedIn address
 * while the served copy held a wrong one, which is why the broken link
 * survived so long: anyone spot-checking a social.json had even odds of
 * opening the reassuring one.
 *
 * These tests hold the content sources to one place *per locale* — ADR 0024
 * moved the "one content source" invariant (ADR 0017) from one file to one
 * file per registered locale directory. Nothing in a Zod schema can express
 * "only one file may define this", so it is asserted here.
 */

const REPO_ROOT = process.cwd();
const SKIP_DIRS = new Set(['node_modules', '.git', '.next', 'coverage', 'out']);

/** Every path under `dir` whose basename is `filename`, repo-relative. */
function findByName(dir: string, filename: string): string[] {
  const found: string[] = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      found.push(...findByName(path.join(dir, entry.name), filename));
    } else if (entry.name === filename) {
      found.push(path.relative(REPO_ROOT, path.join(dir, entry.name)));
    }
  }

  return found;
}

describe('content sources', () => {
  it('serves the owner’s real LinkedIn profile', () => {
    const raw = fs.readFileSync(path.join(REPO_ROOT, 'public/data/en/social.json'), 'utf-8');
    const { social } = JSON.parse(raw);

    const linkedin = social.find(
      (link: { network: string }) => link.network.toLowerCase() === 'linkedin',
    );

    expect(linkedin).toBeDefined();
    expect(linkedin.href).toBe('https://www.linkedin.com/in/prannoy-mulmi-0617026b/');
  });

  it('keeps exactly one social.json per registered locale, so a link can only be edited in one place per language', () => {
    const found = findByName(REPO_ROOT, 'social.json');

    for (const { code } of SUPPORTED_LOCALES) {
      const expected = `public/data/${code}/social.json`;
      expect(found).toContain(expected);
    }

    // And nowhere else in the repo — the old single-file path in particular.
    const localeDirs = new Set(SUPPORTED_LOCALES.map(({ code }) => `public/data/${code}/social.json`));
    const unexpected = found.filter((entry) => !localeDirs.has(entry));
    expect(unexpected).toEqual([]);
  });

  it('carries the contact address beside the profile links, not inside them', () => {
    const raw = fs.readFileSync(path.join(REPO_ROOT, 'public/data/en/social.json'), 'utf-8');
    const { social, email } = JSON.parse(raw);

    expect(email).toBe('prannoy.mulmi@gmail.com');

    // Inside the array it would validate — the href validator accepts a
    // `mailto:` address — but the footer renders every member of that list,
    // and the address is not wanted there.
    const networks = social.map((link: { network: string }) => link.network.toLowerCase());
    expect(networks).not.toContain('email');
    expect(networks).not.toContain('mail');
  });

  // FR-006, research R-010: the featured "This Portfolio" entry must name
  // Claude Code explicitly, without being reordered or resized relative to
  // the other featured projects.
  it('names Claude Code and spec-driven development in "This Portfolio, Spec-Driven"', () => {
    const raw = fs.readFileSync(path.join(REPO_ROOT, 'public/data/en/projects.json'), 'utf-8');
    const { projects } = JSON.parse(raw);

    const index = projects.findIndex(
      (project: { title: string }) => project.title === 'This Portfolio, Spec-Driven',
    );

    expect(index).toBeGreaterThanOrEqual(0);
    // No elevation above the other featured projects — same position as
    // before this feature (third of three).
    expect(index).toBe(2);

    const entry = projects[index];
    expect(entry.bodyText).toMatch(/claude code/i);
    expect(entry.bodyText).toMatch(/spec-driven/i);
  });

  // SC-004 guard: 100% of displayed technology durations must trace to a
  // dated entry in experiences.json. Nothing in TechnologiesFileSchema can
  // see across files, so the cross-file invariants live here (research R-002,
  // R-004, data-model.md).
  describe('technologies.json traces to experiences.json (SC-004)', () => {
    const technologies = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'public/data/en/technologies.json'), 'utf-8'),
    ).technologies as { name: string; matches: string[] }[];
    const experiences = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'public/data/en/experiences.json'), 'utf-8'),
    ).experiences as { title: string; technologies?: string[]; dateText: string }[];

    const experienceTechs = new Set<string>();
    experiences.forEach((role) =>
      (role.technologies ?? []).forEach((t) => experienceTechs.add(t.trim().toLowerCase())),
    );

    it('has no orphaned alias — every matches[] string exists in experiences.json', () => {
      const orphans: string[] = [];
      technologies.forEach((tech) => {
        tech.matches.forEach((match) => {
          if (!experienceTechs.has(match.trim().toLowerCase())) {
            orphans.push(`${tech.name}: "${match}"`);
          }
        });
      });
      expect(orphans).toEqual([]);
    });

    it('resolves every technology to at least one role', () => {
      const unresolved = technologies.filter((tech) => {
        const matchSet = new Set(tech.matches.map((m) => m.trim().toLowerCase()));
        return !experiences.some((role) =>
          (role.technologies ?? []).some((t) => matchSet.has(t.trim().toLowerCase())),
        );
      });
      expect(unresolved.map((t) => t.name)).toEqual([]);
    });

    it('never lets two technologies claim the same source string', () => {
      const seen = new Map<string, string>();
      const collisions: string[] = [];
      technologies.forEach((tech) => {
        tech.matches.forEach((match) => {
          const key = match.trim().toLowerCase();
          if (seen.has(key) && seen.get(key) !== tech.name) {
            collisions.push(`"${match}" claimed by both ${seen.get(key)} and ${tech.name}`);
          }
          seen.set(key, tech.name);
        });
      });
      expect(collisions).toEqual([]);
    });

    it('parses every dateText in experiences.json', () => {
      const unparseable = experiences
        .filter((role) => parseDateText(role.dateText) === null)
        .map((role) => `${role.title}: "${role.dateText}"`);
      expect(unparseable).toEqual([]);
    });
  });

  // docs/adr/0023 amendment: Threat Modeling's real duration must reflect
  // only the AViV span from its sinceByEmployer date onward, plus the full
  // Statista span — never the full 11/2020 AViV start.
  it("clamps Threat Modeling's real duration to its sinceByEmployer date at AViV (docs/adr/0023)", () => {
    const technologiesFile: TechnologiesFile = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'public/data/en/technologies.json'), 'utf-8'),
    );
    const experiencesFile: ExperiencesFile = JSON.parse(
      fs.readFileSync(path.join(REPO_ROOT, 'public/data/en/experiences.json'), 'utf-8'),
    );

    const threatModelingEntry = technologiesFile.technologies.find(
      (tech) => tech.name === 'Threat Modeling',
    );
    expect(threatModelingEntry?.sinceByEmployer).toBeDefined();

    const usages = buildUsage(technologiesFile, experiencesFile.experiences);
    const threatModeling = usages.find((usage) => usage.name === 'Threat Modeling');
    expect(threatModeling).toBeDefined();
    expect(threatModeling!.totalMonths).not.toBeNull();

    // Expected: 01/2024 clamped-AViV-start unioned with Statista's full,
    // adjacent-or-overlapping span through the current month — the same
    // total a synthetic "01/2024 – Present" role would produce.
    const sinceMonth = Object.values(threatModelingEntry!.sinceByEmployer!)[0];
    const expected = parseDateText(`${sinceMonth} – Present`);
    expect(threatModeling!.totalMonths).toBe(expected!.end - expected!.start);

    // And explicitly not the full, unclamped AViV span (11/2020 onward),
    // which would be a larger number than the clamped total above.
    const fullAvivSpan = parseDateText('11/2020 – Present');
    expect(threatModeling!.totalMonths).toBeLessThan(fullAvivSpan!.end - fullAvivSpan!.start);
  });
});
