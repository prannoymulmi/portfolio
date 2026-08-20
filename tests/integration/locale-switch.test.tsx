import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { LocaleProvider } from '@/components/Common/LocaleProvider';
import { LocaleToggle } from '@/components/Common/LocaleToggle';
import { StoryProgressNav } from '@/components/Navigation/StoryProgressNav';

/**
 * US1's independent test (spec.md, tasks.md T026): load fresh -> English,
 * click the toggle -> every section is German, no mixed-language section
 * anywhere, click again -> English returns exactly as it was.
 *
 * The production registry (`lib/i18n/locales.ts`) ships `en` only until
 * T047, so `LocaleToggle` renders nothing and there is nothing to click —
 * this file mocks a second, `de`, entry onto the registry the same way
 * tests/unit/i18n/localeProvider.test.tsx and localeToggle.test.tsx already
 * do, WITHOUT also mocking the ui dictionary itself. `lib/i18n/index.ts`'s
 * `getUi('de')` therefore still falls back to the real `ui.en.json` (no
 * `ui.de.json` is registered there until T046) — so every chrome string
 * asserted here to have changed after the toggle is asserting against real
 * German content that does not exist yet. That is deliberate: this test is
 * written to fail for the whole of T031–T042 and pass once T044–T047 land
 * real German copy and flip the registry (tasks.md's own note on T026).
 */
jest.mock('@/lib/i18n/locales', () => {
  const actual = jest.requireActual('@/lib/i18n/locales');
  return {
    ...actual,
    SUPPORTED_LOCALES: [
      { code: 'en', label: 'English', shortLabel: 'EN', htmlLang: 'en' },
      { code: 'de', label: 'Deutsch', shortLabel: 'DE', htmlLang: 'de' },
    ],
    isLocale: (value: unknown) => value === 'en' || value === 'de',
  };
});

function renderStory() {
  // Mirrors app/layout.tsx: LocaleToggle is a sibling of StoryProgressNav,
  // not nested inside it — it floats in its own corner rather than living in
  // the nav bar's icon row (site owner's call; see LocaleToggle's own doc
  // comment).
  return render(
    <LocaleProvider>
      <ContentProvider>
        <StoryProgressNav />
        <LocaleToggle />
        <Home />
      </ContentProvider>
    </LocaleProvider>,
  );
}

describe('locale switch (US1, FR-003, SC-002)', () => {
  it('renders English on first load', async () => {
    renderStory();
    expect(document.documentElement.lang).toBe('en');
    // CareerJourneyLazy is a client-only dynamic import (ssr: false); findBy*
    // waits out its loading skeleton rather than racing it.
    expect(
      await screen.findByRole('heading', { name: /pass the ball to see where/i }),
    ).toBeInTheDocument();
  });

  it('flips every chrome area to German on one click, and back on the next — no mixed-language section', async () => {
    renderStory();

    // One landmark aria-label per chapter (nav, hero, work, career,
    // technologies, education, projects, contact), captured before the
    // toggle so the "did it actually change" assertion below never has to
    // hard-code speculative German copy that T044–T046 might phrase
    // differently — it only has to differ from what English said.
    const landmarkIds = ['hero', 'skills', 'career', 'technologies', 'education', 'projects', 'contact'];
    const englishLabels = landmarkIds.map((id) => document.getElementById(id)?.getAttribute('aria-label'));

    // The toggle's own aria-label is itself localized (FR-010), so its
    // wrapping words differ per locale ("Switch from ... to ..." in English,
    // "Von ... zu ... wechseln" in German) — only the two endonym labels
    // ("English"/"Deutsch") are locale-invariant. Matching on their order,
    // not on English sentence structure, keeps this assertion honest about
    // what's actually guaranteed to stay stable.
    const toggle = screen.getByRole('button', { name: /english.*deutsch/i });
    fireEvent.click(toggle);

    expect(document.documentElement.lang).toBe('de');

    // SC-002: 100% of user-facing chrome text updates — no section left in
    // the other language. Fails today because ui.de.json does not exist yet
    // (getUi('de') falls back to English) — passes once T046/T047 land.
    landmarkIds.forEach((id, index) => {
      const germanLabel = document.getElementById(id)?.getAttribute('aria-label');
      expect(germanLabel).not.toBe(englishLabels[index]);
    });

    // No navigation/reload occurred — the toggle is in-place client state.
    expect(window.location.pathname).toBe('/');

    // Toggling again restores English exactly as it was (US1 scenario 3).
    const toggleBack = screen.getByRole('button', { name: /deutsch.*english/i });
    fireEvent.click(toggleBack);

    expect(document.documentElement.lang).toBe('en');
    landmarkIds.forEach((id, index) => {
      expect(document.getElementById(id)?.getAttribute('aria-label')).toBe(englishLabels[index]);
    });
  });
});
