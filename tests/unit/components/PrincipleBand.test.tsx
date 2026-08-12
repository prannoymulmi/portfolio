import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Same mocking pattern as HeroParallax.test.tsx: capture what each scroll
// transform maps onto, so the reduced-motion behaviour is assertable without
// a real scroll.
const transformCalls: Array<{ input: number[]; output: number[] }> = [];

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: React.ComponentProps<'div'>) => <div {...rest}>{children}</div>,
    p: ({ children, ...rest }: React.ComponentProps<'p'>) => <p {...rest}>{children}</p>,
    blockquote: ({ children, ...rest }: React.ComponentProps<'blockquote'>) => (
      <blockquote {...rest}>{children}</blockquote>
    ),
  },
  useScroll: () => ({ scrollYProgress: 0 }),
  useTransform: (_value: unknown, input: number[], output: number[]) => {
    transformCalls.push({ input, output });
    return output[0];
  },
}));

const mockPrinciple = {
  loading: false,
  error: null as Error | null,
  data: {
    statement: 'The best architecture is the one your on-call engineer can reason about at 3am.',
    supporting: 'Runbooks, dashboards and alerts ship on day one, not after the first incident.',
  } as { statement: string; supporting: string } | null,
};

jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => ({ principle: mockPrinciple }),
}));

import { PrincipleBand } from '@/components/EngineeringPrinciple/PrincipleBand';

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

describe('PrincipleBand', () => {
  beforeEach(() => {
    transformCalls.length = 0;
    mockPrinciple.loading = false;
    mockPrinciple.error = null;
  });

  it('carries the statement and its supporting line', () => {
    setReducedMotion(false);
    render(<PrincipleBand />);
    expect(screen.getByText(/on-call engineer can reason about at 3am/i)).toBeInTheDocument();
    expect(screen.getByText(/not after the first incident/i)).toBeInTheDocument();
  });

  it('moves background and text at different rates, which is what reads as depth', () => {
    setReducedMotion(false);
    render(<PrincipleBand />);

    expect(transformCalls.length).toBeGreaterThan(1);
    const magnitudes = transformCalls.map(({ output }) => Math.max(...output.map(Math.abs)));
    expect(magnitudes.some((m) => m !== 0)).toBe(true);
    // Two layers moving by the same amount is one layer.
    expect(new Set(magnitudes).size).toBeGreaterThan(1);
  });

  it('collapses every layer to zero when reduced motion is requested', () => {
    setReducedMotion(true);
    render(<PrincipleBand />);
    transformCalls.forEach(({ output }) => {
      expect(output.every((value) => value === 0)).toBe(true);
    });
  });

  it('stays readable under reduced motion — the statement is the point, not the motion', () => {
    setReducedMotion(true);
    render(<PrincipleBand />);
    expect(screen.getByText(/on-call engineer can reason about at 3am/i)).toBeInTheDocument();
  });

  it('renders nothing rather than an empty band when the content is missing', () => {
    setReducedMotion(false);
    mockPrinciple.data = null;
    mockPrinciple.error = new Error('boom');
    const { container } = render(<PrincipleBand />);
    expect(container).toBeEmptyDOMElement();
  });
});
