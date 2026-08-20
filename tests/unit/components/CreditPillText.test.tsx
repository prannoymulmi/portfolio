import { StrictMode } from 'react';
import { act, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CreditPillText } from '@/components/Hero/CreditPillText';

jest.mock('@/components/Common/LocaleProvider', () => ({
  useUi: () => ({
    hero: {
      creditPillBase: 'Built with Claude',
      creditPillFull: 'Built with Claude Code',
    },
  }),
}));

jest.mock('@/lib/utils/animations', () => ({
  prefersReducedMotion: jest.fn(() => false),
}));

const TYPE_INTERVAL_MS = 70;
const HOLD_MS = 2000;
const BASE_TEXT = 'Built with Claude';
const FULL_TEXT = 'Built with Claude Code';

/**
 * The live typed line, read directly off the DOM rather than through
 * `getByText`: the frame also holds an always-present invisible sizer with
 * the same resting label, and the two elements' combined textContent can
 * equal the query too once the live line reaches rest — a query-by-text
 * assertion would either be ambiguous or accidentally pass for the wrong
 * reason. Structural lookup (sizer first, live line second, per the JSX in
 * CreditPillText.tsx) sidesteps that entirely.
 */
function getLiveText(container: HTMLElement): string {
  const frame = container.querySelector('.relative.inline-block.overflow-hidden');
  return frame?.lastElementChild?.textContent ?? '';
}

describe('CreditPillText', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Rendered under StrictMode deliberately, not incidentally — this app's
  // dev server runs with it on by default (Next.js app router since
  // 13.5.1), and Strict Mode calls render-phase code (component bodies,
  // useState initializers) twice on every mount specifically to catch code
  // that isn't safe to call more than once. The type-in state here is a
  // plain per-mount useState with no side effects in its initializer, so
  // it's unaffected — this just locks that in.
  it('types out the full intro on mount', () => {
    const { container } = render(<CreditPillText triggerCue={0} />, { wrapper: StrictMode });

    // Nothing has typed yet — the interval hasn't ticked.
    expect(getLiveText(container)).toBe('');

    act(() => {
      jest.advanceTimersByTime(TYPE_INTERVAL_MS * FULL_TEXT.length);
    });
    expect(getLiveText(container)).toBe(FULL_TEXT);
  });

  // Every fresh mount types from scratch — no "already played" memory
  // across mounts. Hero relies on exactly this: a same-session remount
  // (e.g. a Hero skeleton swap while an as-yet-uncached locale's home.json
  // loads) is one of the two ways a language switch retypes the pill; see
  // Hero.tsx's locale effect for the other (a cue bump, tested below, for
  // when Hero *doesn't* remount because the locale was already cached).
  it('types again on a second, independent mount — no once-per-session memory', () => {
    const first = render(<CreditPillText triggerCue={0} />, { wrapper: StrictMode });
    act(() => {
      jest.advanceTimersByTime(TYPE_INTERVAL_MS * FULL_TEXT.length);
    });
    expect(getLiveText(first.container)).toBe(FULL_TEXT);
    first.unmount();

    const second = render(<CreditPillText triggerCue={0} />, { wrapper: StrictMode });
    expect(getLiveText(second.container)).toBe('');
  });

  // The other half of "retype on every language switch": when Hero stays
  // mounted (locale already cached, no remount), it signals a retype by
  // bumping `triggerCue` — the same mechanism a pointer-enter on the pill
  // already used. A bump is only honoured once the pill has settled at
  // rest, matching the hover behaviour this mechanism was built for.
  it('restarts the cycle from rest when triggerCue changes', () => {
    const { container, rerender } = render(<CreditPillText triggerCue={0} />, {
      wrapper: StrictMode,
    });

    act(() => {
      jest.advanceTimersByTime(TYPE_INTERVAL_MS * FULL_TEXT.length);
    });
    act(() => {
      jest.advanceTimersByTime(HOLD_MS + 1);
    });
    expect(getLiveText(container)).toBe(BASE_TEXT);

    // `rerender` reapplies the `wrapper` from the initial `render` call
    // automatically — passing the bare element here, not re-wrapping it.
    rerender(<CreditPillText triggerCue={1} />);

    expect(getLiveText(container)).toBe('');
  });
});
