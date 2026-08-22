import { expect, test } from '@playwright/test';

/**
 * FR-003: selecting a career chapter advances the visible story content to
 * that chapter.
 *
 * `CareerPitch` starts on its most recent chapter (`chapters.length - 1`),
 * so the *last* company chip in its `<ol>` (CareerPitch.tsx:123-146) is
 * already the active one on load — clicking it still exercises the same
 * click-to-navigate wiring `ChapterDetail` reads from, without assuming
 * which employer that chip names. Its text is read from the DOM rather than
 * hard-coded (research.md D3) — content is editable JSON (ADR 0003) and a
 * rename should not fail this test for the wrong reason.
 */
test('selecting a career chapter shows that chapter in the detail panel', async ({ page }) => {
  await page.goto('/');

  // Scoped to CareerPitch's own <ol> (chapter.tsx:123) — the SVG pitch below
  // it also exposes a `role="button"` per player with an overlapping
  // "<order><abbreviation><name>" text shape, and an unscoped locator would
  // pick one of those instead.
  const companyChips = page.locator('ol').getByRole('button');
  const lastChip = companyChips.last();
  await expect(lastChip).toBeVisible();

  const chipText = (await lastChip.textContent())?.trim() ?? '';
  // The chip's own text is "<order><company>" (CareerPitch.tsx:141-142) —
  // strip the leading order number so the assertion below compares company
  // name to company name, not chip text to heading text.
  const company = chipText.replace(/^\d+/, '').trim();
  expect(company.length).toBeGreaterThan(0);

  await lastChip.click();

  await expect(page.getByRole('heading', { level: 3, name: company })).toBeVisible();
});
