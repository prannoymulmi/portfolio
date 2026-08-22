import { expect, test } from '@playwright/test';

/**
 * FR-004: the contact section's contact links are present and correctly
 * targeted.
 *
 * Asserts the *shape* of each href, not the address itself (research.md D3):
 * the email address and social handles are editable JSON content (ADR
 * 0003), so a content edit must not fail this test for the wrong reason.
 *
 * Scoped to the `#contact` chapter (app/page.tsx) rather than the whole
 * page — `components/Navigation/SocialIcons.tsx` renders its own
 * "LinkedIn"/"GitHub" links in the nav bar with the same accessible names,
 * and this test cares about the contact chapter's links specifically.
 */
test('contact section exposes a mailto email link and absolute social links', async ({ page }) => {
  await page.goto('/');

  const contactChapter = page.locator('#contact');
  const emailLink = contactChapter.getByRole('link', { name: /@/ });
  await expect(emailLink).toBeVisible();
  await expect(emailLink).toHaveAttribute('href', /^mailto:/);

  const socialLinks = contactChapter.getByRole('link', { name: /linkedin|github/i });
  const count = await socialLinks.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const link = socialLinks.nth(index);
    await expect(link).toHaveAttribute('href', /^https:/);
    await expect(link).toHaveAttribute('target', '_blank');
  }
});
