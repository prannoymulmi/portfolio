import fs from 'node:fs';
import path from 'node:path';

/**
 * The site fetches its content from `/data/*.json`, which resolves from
 * `public/`. A second, unserved set of the same files once existed under
 * `app/data/` and had drifted — it held the *correct* LinkedIn address while
 * the served copy held a wrong one, which is why the broken link survived so
 * long: anyone spot-checking a social.json had even odds of opening the
 * reassuring one.
 *
 * These tests hold the content sources to one place. Nothing in a Zod schema
 * can express "only one file may define this", so it is asserted here.
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
    const raw = fs.readFileSync(path.join(REPO_ROOT, 'public/data/social.json'), 'utf-8');
    const { social } = JSON.parse(raw);

    const linkedin = social.find(
      (link: { network: string }) => link.network.toLowerCase() === 'linkedin',
    );

    expect(linkedin).toBeDefined();
    expect(linkedin.href).toBe('https://www.linkedin.com/in/prannoy-mulmi-0617026b/');
  });

  it('keeps exactly one social.json, so a link can only be edited in one place', () => {
    expect(findByName(REPO_ROOT, 'social.json')).toEqual(['public/data/social.json']);
  });
});
