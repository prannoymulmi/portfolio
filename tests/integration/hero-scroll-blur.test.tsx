import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { LocaleProvider } from '@/components/Common/LocaleProvider';
import { Hero } from '@/components/Hero/Hero';

// The unit tests in tests/unit/components/useHeroScrollBlur.test.tsx exercise
// the hook in isolation, against a synthetic <section ref={heroBlurRef} />
// double — they can never catch a regression in the actual wiring between
// Hero.tsx and the hook (e.g. the `ref` prop quietly dropped from the real
// <section>, or Hero.tsx's own render tree changing shape around it). This
// file renders the real Hero component, through the real ContentProvider
// data-loading path, so that seam is covered too.
jest.mock('gsap', () => ({
  __esModule: true,
  default: { registerPlugin: jest.fn() },
}));

jest.mock('@/lib/utils/animations', () => {
  const create = jest.fn((config: Record<string, unknown>) => {
    if (typeof config.onUpdate === 'function') {
      config.onUpdate = jest.fn(config.onUpdate as (...args: unknown[]) => void);
    }
    return { kill: jest.fn(), vars: config, progress: 0.4 };
  });

  return {
    __esModule: true,
    ScrollTrigger: { create },
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
});

import { ScrollTrigger } from '@/lib/utils/animations';

const mockCreate = ScrollTrigger.create as jest.Mock;

// Same two independent matchMedia queries the hook reads (reduced-motion and
// the `lg` desktop-layout breakpoint) — see useHeroScrollBlur.test.tsx.
function setMediaQueries({
  reducedMotion = false,
  desktopLayout = true,
}: { reducedMotion?: boolean; desktopLayout?: boolean } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('prefers-reduced-motion') ? reducedMotion : desktopLayout,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
}

async function renderRealHero() {
  render(
    <LocaleProvider>
      <ContentProvider>
        <Hero />
      </ContentProvider>
    </LocaleProvider>,
  );
  // Hero renders a loading skeleton until ContentProvider's fetch resolves;
  // waiting for the roles list is the same "content has landed" signal
  // tests/unit/components/Hero.test.tsx uses. The credit pill's own text
  // used to serve that purpose here, but it isn't a safe query target for
  // this: the pill can legitimately render already at rest on mount (e.g.
  // prefers-reduced-motion, or CreditPillText.tsx's hasPlayedIntroTyping on
  // a second mount within the same session), and at rest its live line
  // duplicates the always-present invisible sizer's text exactly — a
  // `findByText` on that string is ambiguous between the two whenever that
  // happens, unrelated to anything this file actually tests.
  await screen.findByRole('list', { name: /what i do/i });
}

describe('Hero scroll blur, wired through the real Hero component', () => {
  afterEach(() => {
    cleanup();
    mockCreate.mockClear();
  });

  it('blurs the real hero section on desktop (>=1024px)', async () => {
    setMediaQueries({ desktopLayout: true });

    await renderRealHero();

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const [config] = mockCreate.mock.calls[0];
    expect(config.trigger).toBeInstanceOf(HTMLElement);

    // The immediate onUpdate call (FR-006, research R2) already wrote the
    // blur for the given progress by the time create() returns.
    expect((config.trigger as HTMLElement).style.filter).toMatch(/^blur\(/);
  });

  it('does not blur the real hero section below the desktop breakpoint (<1024px)', async () => {
    setMediaQueries({ desktopLayout: false });

    await renderRealHero();

    expect(mockCreate).not.toHaveBeenCalled();
    const section = document.querySelector('section');
    expect(section).not.toBeNull();
    expect((section as HTMLElement).style.filter).toBe('');
  });
});
