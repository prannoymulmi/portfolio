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

  // Regression test for "switching language retypes the pill": Hero swaps in
  // a loading skeleton in place of the whole hero markup while
  // ContentProvider refetches an as-yet-uncached locale's home.json
  // (useContentLoader), then swaps the real markup back in once it
  // resolves — unmounting and remounting CreditPillText in the process, even
  // though nothing about the pill itself changed. The intro cycle must play
  // once per browser session, not once per mount.
  it('types out the intro on a fresh mount, but starts at rest on a same-session remount', () => {
    const first = render(<CreditPillText triggerCue={0} />);

    // Nothing has typed yet — the interval hasn't ticked.
    expect(getLiveText(first.container)).toBe('');

    act(() => {
      jest.advanceTimersByTime(TYPE_INTERVAL_MS * FULL_TEXT.length);
    });
    expect(getLiveText(first.container)).toBe(FULL_TEXT);

    first.unmount();

    const second = render(<CreditPillText triggerCue={0} />);

    // No timer advanced at all for this second instance — a same-session
    // remount must start already at rest, not replay the intro from an
    // empty string the way the first mount did.
    expect(getLiveText(second.container)).toBe(BASE_TEXT);
  });
});
