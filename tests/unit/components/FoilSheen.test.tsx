import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FoilSheen } from '@/components/Hero/FoilSheen';
import { prefersReducedMotion } from '@/lib/utils/animations';

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...rest }: { children?: React.ReactNode; className?: string }) => (
      <div data-testid="sheen-layer" className={className} {...rest}>
        {children}
      </div>
    ),
  },
}));

jest.mock('@/lib/utils/animations', () => ({
  prefersReducedMotion: jest.fn(),
}));

const mockedPreference = prefersReducedMotion as jest.MockedFunction<typeof prefersReducedMotion>;

describe('FoilSheen', () => {
  // clearAllMocks, not resetAllMocks: reset strips implementations, including
  // the global window.matchMedia stub in jest.setup.js that useSyncExternalStore
  // subscribes through.
  afterEach(() => jest.clearAllMocks());

  it('renders the travelling highlight when motion is allowed', () => {
    mockedPreference.mockReturnValue(false);
    const { queryAllByTestId } = render(<FoilSheen />);
    expect(queryAllByTestId('sheen-layer').length).toBeGreaterThan(0);
  });

  /**
   * SC-010, and the reason this component gates on the helper rather than
   * trusting CSS: globals.css collapses every animation to 0.01ms under
   * prefers-reduced-motion, which for a travelling highlight does not remove it
   * — it freezes it at its end position, leaving a bright band stuck across the
   * frame. FR-023a calls that out, so the element must not render at all.
   */
  it('renders nothing at all under reduced motion — not a frozen sweep', () => {
    mockedPreference.mockReturnValue(true);
    const { container, queryAllByTestId } = render(<FoilSheen />);
    expect(queryAllByTestId('sheen-layer')).toHaveLength(0);
    expect(container).toBeEmptyDOMElement();
  });
});
