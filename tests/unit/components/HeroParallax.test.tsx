import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Capture what the drift maps scroll position onto, so the reduced-motion
// behaviour is assertable without a real scroll.
const transformCalls: Array<{ input: number[]; output: number[] }> = [];

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: React.ComponentProps<'div'>) => <div {...rest}>{children}</div>,
  },
  useScroll: () => ({ scrollY: 0 }),
  useTransform: (_value: unknown, input: number[], output: number[]) => {
    transformCalls.push({ input, output });
    return output[0];
  },
}));

import { HeroDrift } from '@/components/Hero/HeroParallax';

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

describe('HeroDrift', () => {
  beforeEach(() => {
    transformCalls.length = 0;
  });

  it('drifts its child when motion is allowed', () => {
    setReducedMotion(false);
    render(
      <HeroDrift strength={40}>
        <p>player card</p>
      </HeroDrift>,
    );

    expect(screen.getByText('player card')).toBeInTheDocument();
    const [{ output }] = transformCalls;
    expect(output.some((value) => value !== 0)).toBe(true);
  });

  it('collapses the drift to zero when reduced motion is requested', () => {
    setReducedMotion(true);
    render(
      <HeroDrift strength={40}>
        <p>player card</p>
      </HeroDrift>,
    );

    // Zero displacement at every point in the range, so the element sits
    // exactly where the moving version rests: no layout shift either way.
    const [{ output }] = transformCalls;
    expect(output.every((value) => value === 0)).toBe(true);
  });

  it('bounds the drift so it cannot reach into the chapter below', () => {
    setReducedMotion(false);
    render(
      <HeroDrift strength={9999}>
        <p>player card</p>
      </HeroDrift>,
    );

    const [{ output }] = transformCalls;
    for (const value of output) {
      expect(Math.abs(value)).toBeLessThanOrEqual(80);
    }
  });

  it('moves by transform only, so switching it off shifts no layout', () => {
    setReducedMotion(false);
    const { container } = render(
      <HeroDrift strength={40}>
        <p>player card</p>
      </HeroDrift>,
    );

    const drifted = container.firstElementChild as HTMLElement;
    expect(drifted.style.top).toBe('');
    expect(drifted.style.marginTop).toBe('');
    expect(drifted.style.position).toBe('');
  });
});
