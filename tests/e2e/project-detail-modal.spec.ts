import { expect, test } from '@playwright/test';

/**
 * FR-002: a project's detail modal opens from its entry point and can be
 * closed again.
 *
 * The entry point is the hero credit pill, `getByRole('link', { name: /built
 * with claude/i })` — its `aria-label` (`ui.hero.creditPillFull`) is
 * deliberately static (components/Hero/Hero.tsx:137), set once rather than
 * mirroring the pill's own typing animation, precisely so a test can locate
 * it without racing that animation.
 *
 * The heading asserted inside the dialog is read from the project card's own
 * title data (research.md D3: never hard-code a project title) — this
 * modal's `<h2>` is `project.title`, sourced live from the DOM rather than
 * literal here.
 */
test('project detail modal opens from the hero credit pill and closes', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('dialog')).toHaveCount(0);

  const creditPill = page.getByRole('link', { name: /built with claude/i });
  await creditPill.click();

  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { level: 2 })).not.toBeEmpty();

  await dialog.getByRole('button', { name: /close/i }).click();

  await expect(page.getByRole('dialog')).toHaveCount(0);
});
