import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Same mock strategy as HeroParallax.test.tsx: capture what each drift maps
// scroll position onto, so per-layer behaviour is assertable without a real
// scroll or real image decoding.
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

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => {
    // eslint-disable-next-line @next/next/no-img-element -- test stub only
    return <img {...props} alt={props.alt ?? ''} />;
  },
}));

import { GRADIENT_LAYERS } from '@/components/Hero/HeroParallax';
import { HeroGradientLayers } from '@/components/Hero/HeroGradientLayers';

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

describe('HeroGradientLayers', () => {
  beforeEach(() => {
    transformCalls.length = 0;
  });

  it('renders one image per configured gradient layer', () => {
    setReducedMotion(false);
    const { container } = render(<HeroGradientLayers />);
    const images = container.querySelectorAll('img');
    expect(images).toHaveLength(GRADIENT_LAYERS.length);
  });

  it('is decorative: the wrapper is aria-hidden and every image has empty alt text', () => {
    setReducedMotion(false);
    const { container } = render(<HeroGradientLayers />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    container.querySelectorAll('img').forEach((img) => {
      expect(img.getAttribute('alt')).toBe('');
    });
  });

  it('stacks layers in config order, so later entries paint over earlier ones', () => {
    setReducedMotion(false);
    const { container } = render(<HeroGradientLayers />);
    const renderedSrcs = Array.from(container.querySelectorAll('img')).map((img) =>
      img.getAttribute('src'),
    );
    expect(renderedSrcs).toEqual(GRADIENT_LAYERS.map((layer) => layer.src));
  });

  it("applies each layer's configured opacity class", () => {
    setReducedMotion(false);
    const { container } = render(<HeroGradientLayers />);
    const images = container.querySelectorAll('img');
    GRADIENT_LAYERS.forEach((layer, index) => {
      expect(images[index].className).toContain(layer.className);
    });
  });

  it('drifts every layer when motion is allowed', () => {
    setReducedMotion(false);
    render(<HeroGradientLayers />);

    expect(transformCalls).toHaveLength(GRADIENT_LAYERS.length);
    transformCalls.forEach(({ output }) => {
      expect(output.some((value) => value !== 0)).toBe(true);
    });
  });

  it('collapses every layer to zero drift when reduced motion is requested', () => {
    setReducedMotion(true);
    render(<HeroGradientLayers />);

    expect(transformCalls).toHaveLength(GRADIENT_LAYERS.length);
    transformCalls.forEach(({ output }) => {
      expect(output.every((value) => value === 0)).toBe(true);
    });
  });
});
