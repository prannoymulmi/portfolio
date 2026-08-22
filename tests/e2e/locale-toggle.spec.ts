import { expect, test } from '@playwright/test';

/**
 * FR-001: the locale toggle (EN <-> DE) updates the site's visible chrome
 * and content, and toggling back returns it to English.
 *
 * The toggle's own `aria-label` is itself localized ("Switch from {current}
 * to {target}" / "Wechsel von {current} zu {target}" — LocaleToggle.tsx),
 * but the endonyms `English`/`Deutsch` are locale-invariant and appear in
 * both, so matching on the whole phrase (the same trick tests/integration/
 * locale-switch.test.tsx already uses) locates the same button regardless
 * of which locale is currently active. Matching on the full "from X to Y"
 * phrase, not a single bare endonym, avoids colliding with unrelated page
 * content that happens to mention the same word — the project gallery's
 * German copy, for one, describes its own translation process using the
 * word "Deutsch".
 *
 * The contact heading (`ui.contact.headingLead`) is the visible chrome
 * string asserted here — "Got a gnarly system?" in English, "Hast du ein
 * kniffliges System?" in German (lib/i18n/ui.en.json / ui.de.json) — chosen
 * because the two locales genuinely differ (research.md R3); a key whose
 * copy happened to be identical in both languages would make this
 * assertion vacuous.
 *
 * Activated via focus + Enter rather than `.click()`: `LocaleToggle`'s own
 * fixed position (`bottom-4 left-3`) coincides with the corner Next.js's dev
 * server renders its own "Open Next.js Dev Tools" indicator in, which
 * intercepts pointer events there for the local `next dev` target this
 * suite drives outside CI (playwright.config.ts's `webServer`). The
 * indicator is dev-only chrome, absent from the built preview CI actually
 * tests against; keyboard activation exercises the exact same button
 * without depending on which overlay happens to sit on top of it.
 */
test('locale toggle switches the site to German and back to English', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: /got a gnarly system\?/i })).toBeVisible();

  const toggleToGerman = page.getByRole('button', { name: /english.*deutsch/i });
  await toggleToGerman.focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(
    page.getByRole('heading', { name: /hast du ein kniffliges system\?/i }),
  ).toBeVisible();

  const toggleToEnglish = page.getByRole('button', { name: /deutsch.*english/i });
  await toggleToEnglish.focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: /got a gnarly system\?/i })).toBeVisible();
});
