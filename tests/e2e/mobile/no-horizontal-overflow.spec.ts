import { expect, test } from '@playwright/test';

/**
 * FR-007, mobile-only: no horizontal overflow at a mobile-sized viewport.
 * Lives under `tests/e2e/mobile/` — the `desktop` project's `testIgnore`
 * (playwright.config.ts) skips this file entirely, so the check that is
 * meaningless above the 1024px breakpoint can never run there by accident.
 *
 * `tests/integration/mobile-overflow.test.tsx` already guards this in
 * jsdom, but jsdom has no layout engine — `scrollWidth`/`clientWidth` return
 * zero regardless of CSS, so that test can only assert the *fix is still
 * written into the page source* (the `overflow-x-clip` utility on the
 * contact chapter). This test asserts the thing that integration test
 * structurally cannot: that the page does not actually scroll sideways in a
 * real browser. Both stay — different claims, both worth having.
 *
 * Checked after load and again after scrolling to the bottom, because the
 * known historical offender (specs/012-mobile-layout-fixes) is the contact
 * chapter's decorative glow, and the chapters below the fold
 * (`ProjectGalleryLazy`, `CareerJourneyLazy`) are client-only dynamic
 * imports that are not even in the DOM until they mount. Measured against
 * `documentElement`, never `body` — `body` can report a narrower width and
 * miss the overflow entirely.
 */
test('the page never scrolls horizontally on a mobile-sized viewport', async ({ page }) => {
  await page.goto('/');

  const hasNoHorizontalOverflow = () =>
    page.evaluate(
      () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    );

  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await hasNoHorizontalOverflow()).toBe(true);

  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const steps = 4;
  for (let step = 1; step <= steps; step += 1) {
    await page.evaluate(
      (position) => window.scrollTo(0, position),
      Math.round((scrollHeight / steps) * step),
    );
    expect(await hasNoHorizontalOverflow()).toBe(true);
  }

  // The contact chapter's glow (specs/012-mobile-layout-fixes) is the
  // historical offender, so the bottom of the page is checked explicitly
  // rather than only relying on the last proportional step above. Scoped to
  // `#contact` (app/page.tsx) — the nav bar's own EmailLink shares the same
  // "contains @" accessible name and would otherwise make this locator
  // ambiguous.
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect(page.locator('#contact').getByRole('link', { name: /@/ })).toBeVisible();
  expect(await hasNoHorizontalOverflow()).toBe(true);
});
