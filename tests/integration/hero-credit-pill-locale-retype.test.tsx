import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Hero } from '@/components/Hero/Hero';
import { LocaleProvider, useLocale } from '@/components/Common/LocaleProvider';

// Mocks mirror tests/unit/components/Hero.test.tsx.
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
  useScroll: () => ({ scrollY: 0 }),
  useTransform: () => 0,
}));

jest.mock('rough-notation', () => ({
  annotate: () => ({ show: jest.fn(), hide: jest.fn(), remove: jest.fn() }),
}));

const mockHome = {
  loading: false,
  error: null as Error | null,
  data: {
    name: 'Prannoy Mulmi',
    intro: 'Intro line.',
    roles: ['Software Engineer'],
    imageSource: '/images/portrait.png',
    cv: { href: 'https://example.com/cv.pdf', label: 'View CV' },
  },
};

// Hero always sees already-loaded, unchanging home content here — the point
// of this file is to isolate the locale-driven retype from content-loading
// remounts, which are a separate, already-covered path (a fresh
// CreditPillText mount always types by default; see CreditPillText.tsx).
// Real ContentProvider caches per locale (useContentLoader) and only shows
// Hero's loading skeleton for an as-yet-uncached locale, so switching back
// to one already fetched never remounts Hero at all — the scenario this
// file exists to cover.
jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => ({ home: mockHome }),
}));

function LocaleSwitchButton() {
  const { setLocale } = useLocale();
  return (
    <button type="button" onClick={() => setLocale('de')}>
      switch locale
    </button>
  );
}

/** The live typed line — see the identical helper in CreditPillText.test.tsx
 * for why this reads the DOM structurally rather than via `getByText`. */
function getLiveText(): string {
  const frame = document.querySelector('.relative.inline-block.overflow-hidden');
  return frame?.lastElementChild?.textContent ?? '';
}

const TYPE_INTERVAL_MS = 70;
const HOLD_MS = 2000;

describe('credit pill retypes on every language switch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Regression test: switching language used to only retype the pill by
  // accident, when the switch happened to trigger a Hero remount (fetching
  // an as-yet-uncached locale's home.json). A same-session switch back to an
  // already-cached locale never remounts Hero, so it never retyped. Hero
  // now bumps CreditPillText's own retrigger cue directly on every locale
  // change (Hero.tsx), independent of whether a remount happens — this test
  // holds Hero mounted throughout (useContent mocked to never report
  // loading), so only that cue-bump path can be responsible for a retype.
  it('restarts the type-in cycle when locale changes, with no remount involved', () => {
    render(
      <LocaleProvider>
        <LocaleSwitchButton />
        <Hero />
      </LocaleProvider>,
    );

    // Let the intro finish typing and settle at rest.
    act(() => {
      jest.advanceTimersByTime(TYPE_INTERVAL_MS * 40);
    });
    act(() => {
      jest.advanceTimersByTime(HOLD_MS + 1);
    });
    expect(getLiveText().length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /switch locale/i }));

    // Immediately after the switch, before any further timer tick, the
    // cycle has already restarted from empty rather than still sitting at
    // rest — Hero's locale effect bumped the cue synchronously with the
    // locale change, not on some later, separate content-load remount.
    expect(getLiveText()).toBe('');
  });
});
