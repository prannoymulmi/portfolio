import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { LocaleProvider } from '@/components/Common/LocaleProvider';
import { LocaleToggle } from '@/components/Common/LocaleToggle';
import { Hero } from '@/components/Hero/Hero';
import { clearContentCache } from '@/lib/hooks/useContentLoader';
import { LOCALE_STORAGE_KEY } from '@/lib/i18n/locales';

// Mocked the same way tests/unit/components/Hero.test.tsx mocks them —
// jsdom has no layout/measurement engine for framer-motion or rough-notation
// to run against.
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

/**
 * US2 (FR-004, FR-005, SC-003, tasks.md T049): `LocaleProvider`'s
 * localStorage read-on-mount / write-on-set (T013) is the whole of this
 * story's production behaviour. `tests/unit/i18n/localeProvider.test.tsx`
 * already proves the provider's internals in isolation with a mocked
 * two-locale registry — this file instead proves the end-to-end, "close the
 * tab and come back" behaviour through the real toggle, the real content
 * pipeline, and a real unmount/remount, against the production registry
 * (`SUPPORTED_LOCALES` ships `de` for real as of T047, so no mock is
 * needed here).
 *
 * Deliberately renders `LocaleToggle` + `Hero` rather than the whole story
 * page: the full page also mounts components with their own, unrelated
 * `localStorage` reads (e.g. `TimelineToggle`'s career-view-mode
 * preference), and the "storage accessor throws" scenario below needs to
 * isolate `LocaleProvider`'s own resilience (FR-005) from those separate,
 * pre-existing reads, which are out of this feature's scope.
 */
function renderStory() {
  return render(
    <LocaleProvider>
      <ContentProvider>
        <LocaleToggle />
        <Hero />
      </ContentProvider>
    </LocaleProvider>,
  );
}

describe('locale persistence across a fresh render (US2)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('comes up German after a full unmount/remount when localStorage still holds the chosen locale (FR-004, SC-003, scenario 1)', async () => {
    const { unmount } = renderStory();
    await screen.findByRole('list', { name: /what i do/i });

    fireEvent.click(screen.getByRole('button', { name: /english.*deutsch/i }));
    expect(document.documentElement.lang).toBe('de');
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('de');

    // A returning visitor's browser has no in-memory React tree or content
    // cache left over — only localStorage survives. Unmounting and clearing
    // the module-level content cache (lib/hooks/useContentLoader.ts) before
    // the fresh render is what makes this a real "new session" rather than
    // an in-place state check.
    unmount();
    clearContentCache();

    renderStory();
    // "Was ich mache" — ui.de.json's hero.whatIDo, the list's aria-label.
    await screen.findByRole('list', { name: /was ich mache/i });
    expect(document.documentElement.lang).toBe('de');
  });

  it('comes up English after a fresh render when localStorage has no stored locale (US2 scenario 2)', async () => {
    const { unmount } = renderStory();
    await screen.findByRole('list', { name: /what i do/i });

    fireEvent.click(screen.getByRole('button', { name: /english.*deutsch/i }));
    expect(document.documentElement.lang).toBe('de');

    unmount();
    clearContentCache();
    window.localStorage.clear();

    renderStory();
    await screen.findByRole('list', { name: /what i do/i });
    expect(document.documentElement.lang).toBe('en');
  });

  it('falls back to English with no console error when localStorage holds an unrecognised locale (FR-005)', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'xx');
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderStory();
    await screen.findByRole('list', { name: /what i do/i });

    expect(document.documentElement.lang).toBe('en');
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('falls back to English without crashing when the localStorage accessor throws (private-mode simulation, FR-005)', async () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error('storage blocked');
      },
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };
    const original = window.localStorage;
    Object.defineProperty(window, 'localStorage', { configurable: true, value: throwingStorage });

    expect(() => renderStory()).not.toThrow();
    await screen.findByRole('list', { name: /what i do/i });
    expect(document.documentElement.lang).toBe('en');

    Object.defineProperty(window, 'localStorage', { configurable: true, value: original });
  });
});
