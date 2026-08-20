import { expect, test } from '@playwright/test';

/**
 * The site fetches its content client-side (`fetch('/data/en/*.json')`, ADR
 * 0003) — page.goto() resolving only means the shell has landed, not that
 * the hero's real content has. Asserting on `page.getByRole('heading', ...)`
 * with `toBeVisible()` auto-waits and retries until that fetch has actually
 * finished, rather than racing it. Single locale only — no language-toggle
 * interaction here (FR-001, FR-007, Clarifications Session 2026-08-20).
 */
test('homepage renders the hero once client-fetched content lands', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Prannoy Mulmi | Senior Software Engineer');

  // The page's only <h1> (StoryProgressNav's wordmark) carries the site
  // owner's name as its accessible name once home.json has loaded — a real
  // piece of client-fetched content, not something present in the initial
  // HTML shell (public/data/en/home.json).
  await expect(page.getByRole('heading', { level: 1, name: 'Someone Else Entirely' })).toBeVisible();
});
