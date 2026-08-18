import { useState } from 'react';
import { render, cleanup, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// jsdom has no layout, so a real ScrollTrigger cannot compute progress. gsap
// is mocked so importing it never touches the real plugin; the ScrollTrigger
// export from '@/lib/utils/animations' is mocked so the hook's calls to
// ScrollTrigger.create can be captured and its config inspected directly.
jest.mock('gsap', () => ({
  __esModule: true,
  default: { registerPlugin: jest.fn() },
}));

jest.mock('@/lib/utils/animations', () => {
  // Wrapping config.onUpdate in a jest.fn before returning lets a test assert
  // it was invoked, including the explicit "call it once immediately after
  // create" (research R2) — the hook re-invokes the same function through the
  // returned instance's `vars`, GSAP's own record of the config it was
  // created with, so the wrapper here is the one the hook actually calls.
  const create = jest.fn((config: Record<string, unknown>) => {
    if (typeof config.onUpdate === 'function') {
      config.onUpdate = jest.fn(config.onUpdate as (...args: unknown[]) => void);
    }
    return {
      kill: jest.fn(),
      vars: config,
      progress: 0,
    };
  });

  return {
    __esModule: true,
    ScrollTrigger: { create },
    prefersReducedMotion: () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
});

import { ScrollTrigger } from '@/lib/utils/animations';
import { blurPxAt, MAX_BLUR_PX, useHeroScrollBlur } from '@/components/Hero/useHeroScrollBlur';

const mockCreate = ScrollTrigger.create as jest.Mock;

function setReducedMotion(reduced: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: reduced && query.includes('prefers-reduced-motion'),
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

function TestHero() {
  const heroBlurRef = useHeroScrollBlur();
  return <section ref={heroBlurRef} data-testid="hero" />;
}

// Mirrors Hero.tsx: the real component renders a loading skeleton (no
// hero <section> at all) before swapping in the real markup on a later
// render of the same component instance — the exact sequence that broke
// the original RefObject-based version of this hook (the effect ran once
// while the ref was still null and never re-fired once the section mounted).
function TestHeroWithLoadingSkeleton() {
  const heroBlurRef = useHeroScrollBlur();
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div data-testid="skeleton">
        <button type="button" onClick={() => setLoading(false)}>
          finish loading
        </button>
      </div>
    );
  }

  return <section ref={heroBlurRef} data-testid="hero" />;
}

describe('useHeroScrollBlur test harness', () => {
  beforeEach(() => {
    mockCreate.mockClear();
    setReducedMotion(false);
  });

  afterEach(() => {
    cleanup();
  });

  it('is wired up and ready for assertions', () => {
    expect(mockCreate).toBeDefined();
    expect(blurPxAt).toBeInstanceOf(Function);
    expect(MAX_BLUR_PX).toBe(8);
  });
});

describe('blurPxAt', () => {
  it('is zero at the top of the page (FR-001)', () => {
    expect(blurPxAt(0)).toBe(0);
  });

  it('is monotonically non-decreasing as progress increases (FR-002)', () => {
    const samples = [0, 0.1, 0.25, 0.5, 0.75, 1].map(blurPxAt);
    for (let i = 1; i < samples.length; i += 1) {
      expect(samples[i]).toBeGreaterThanOrEqual(samples[i - 1]);
    }
  });

  it('caps at MAX_BLUR_PX however far past 1 progress goes (FR-003)', () => {
    expect(blurPxAt(1)).toBe(MAX_BLUR_PX);
    expect(blurPxAt(5)).toBe(MAX_BLUR_PX);
  });

  it('clamps negative progress to zero (FR-003)', () => {
    expect(blurPxAt(-1)).toBe(0);
  });
});

describe('useHeroScrollBlur ScrollTrigger wiring', () => {
  beforeEach(() => {
    mockCreate.mockClear();
    setReducedMotion(false);
  });

  afterEach(() => {
    cleanup();
  });

  it('creates exactly one ScrollTrigger, pinned to the hero element, with no scrub and an immediate onUpdate call (FR-006, research R2)', () => {
    render(<TestHero />);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const [config] = mockCreate.mock.calls[0];
    expect(config.start).toBe('top top');
    expect(config.trigger).toBeInstanceOf(HTMLElement);
    expect(config).not.toHaveProperty('scrub');

    // The wrapped onUpdate (see the harness mock above) records every call the
    // hook makes to it, including the one immediately after creation.
    expect(config.onUpdate).toHaveBeenCalledTimes(1);
  });

  it('kills the trigger and clears the inline filter and willChange on unmount (constitution: cleanup, research R6)', () => {
    const { unmount } = render(<TestHero />);

    const created = mockCreate.mock.results[0].value;
    const element = document.querySelector('[data-testid="hero"]') as HTMLElement;

    unmount();

    expect(created.kill).toHaveBeenCalledTimes(1);
    expect(element.style.filter).toBe('');
    expect(element.style.willChange).toBe('');
  });

  it('uses a viewport-relative end, not a hero-height-relative one, so the cap is reachable within one screen on any viewport (SC-002, research R4)', () => {
    render(<TestHero />);

    const [config] = mockCreate.mock.calls[0];
    expect(config.end).toBe('+=100%');
  });

  it('creates the ScrollTrigger once the hero section mounts, even when it is absent on the first render (loading skeleton regression)', () => {
    const { getByRole, queryByTestId } = render(<TestHeroWithLoadingSkeleton />);

    // No hero section yet — a RefObject-based version of this hook would
    // already be past its one-shot effect at this point, with ref.current
    // permanently null.
    expect(queryByTestId('hero')).not.toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();

    fireEvent.click(getByRole('button', { name: 'finish loading' }));

    expect(queryByTestId('hero')).toBeInTheDocument();
    expect(mockCreate).toHaveBeenCalledTimes(1);
    const [config] = mockCreate.mock.calls[0];
    expect(config.trigger).toBe(queryByTestId('hero'));
  });
});

describe('useHeroScrollBlur under prefers-reduced-motion', () => {
  beforeEach(() => {
    mockCreate.mockClear();
    setReducedMotion(true);
  });

  afterEach(() => {
    cleanup();
  });

  it('creates no ScrollTrigger and writes no inline filter (FR-005, SC-004)', () => {
    render(<TestHero />);

    expect(mockCreate).not.toHaveBeenCalled();
    const element = document.querySelector('[data-testid="hero"]') as HTMLElement;
    expect(element.style.filter).toBe('');
  });

  it('unmounts without throwing, since there is no trigger to kill', () => {
    const { unmount } = render(<TestHero />);
    expect(() => unmount()).not.toThrow();
  });
});
