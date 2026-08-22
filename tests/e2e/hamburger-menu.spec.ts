import { expect, test } from '@playwright/test';

/**
 * Deliberately shared between both viewport projects — NOT under
 * `tests/e2e/mobile/`. `components/Navigation/StoryProgressNav.tsx:113`
 * mounts `<HamburgerMenu />` unconditionally in the nav bar's icon row; there
 * is no `lg:hidden` on it and no separate desktop chapter list beside it
 * (spec 010-hamburger-nav moved the chapter list into the menu for every
 * width). `HamburgerMenu.tsx:178` sets the toggle's `aria-label` from
 * `open`/`closeMenu` with no responsive branch, and the portal-rendered
 * panel (`HamburgerMenu.tsx:216`) is `fixed inset-y-0 right-0` with the same
 * `aria-label={ui.nav.storySections}` at both 1440x900 and 390x844 — so one
 * test body genuinely covers both. The only width-dependent detail in the
 * whole component is the panel's max width (`max-w-xs` 320px vs
 * `sm:max-w-sm` 384px), which is exactly what this spec must NOT assert —
 * that is the one claim that is true on a phone and false on a desktop. Do
 * not move this file back under `tests/e2e/mobile/`: FR-006/FR-012 were
 * amended 2026-08-22 (spec Clarifications; research.md Finding 6) precisely
 * because the control renders at every width, and coverage should match
 * that, not an assumed mobile-only layout.
 *
 * Closed via Escape rather than re-clicking the toggle: the toggle sits
 * inside the nav bar's own icon row, positioned near the panel's right edge
 * at both viewport widths, and the portal-rendered panel (`z-50`, appended
 * later in `document.body`) paints over it while open — a real click there
 * is intercepted by the panel itself, not a test artifact. `HamburgerMenu.tsx`
 * wires `Escape` to the same `close()` the toggle calls
 * (`handleKeyDown`/`close`), so this exercises the identical close path
 * research.md documents as the toggle's own alternative.
 */
test('hamburger menu opens the story-sections panel and closes again', async ({ page }) => {
  await page.goto('/');

  const toggle = page.getByRole('button', { name: /open menu/i });
  await toggle.click();

  const panel = page.getByRole('navigation', { name: /story sections/i });
  await expect(panel).toBeVisible();
  const sectionLinks = panel.getByRole('link');
  await expect(sectionLinks.first()).toBeVisible();
  expect(await sectionLinks.count()).toBeGreaterThan(0);

  await expect(page.getByRole('button', { name: /close menu/i })).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(page.getByRole('navigation', { name: /story sections/i })).toHaveCount(0);
});
