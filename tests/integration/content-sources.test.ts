import fs from 'node:fs';
import path from 'node:path';

/**
 * The site fetches its content from `/data/*.json`, which resolves from
 * `public/`. These tests hold that content to what it claims to be.
 */

const REPO_ROOT = process.cwd();

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
});
