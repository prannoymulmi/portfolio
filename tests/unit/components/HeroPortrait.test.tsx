import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeroPortrait } from '@/components/Hero/HeroPortrait';

// Same shape as Backdrop.test.tsx: next/image swallows its own props, so the
// ones under test (sizes, preload) are re-exposed as data attributes.
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ preload, ...rest }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img data-preload={String(Boolean(preload))} {...rest} />
  ),
}));

const NAME = 'Prannoy Mulmi';

describe('HeroPortrait', () => {
  it('renders nothing without a portrait address, so the opening falls back to text', () => {
    const { container } = render(<HeroPortrait name={NAME} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders exactly one image', () => {
    render(<HeroPortrait name={NAME} imageSource="/images/hero_cutout.png" />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('names the subject in the alt text, because a person is content and not decoration', () => {
    render(<HeroPortrait name={NAME} imageSource="/images/hero_cutout.png" />);
    const portrait = screen.getByRole('img');

    expect(portrait).toHaveAccessibleName(new RegExp(NAME, 'i'));
    expect(portrait.getAttribute('alt')).not.toBe('');
  });

  it('dissolves both clipped edges rather than ending on a crop line', () => {
    const { container } = render(
      <HeroPortrait name={NAME} imageSource="/images/hero_cutout.png" />,
    );

    // Two edges of the frame cut through the subject rather than empty space:
    // the bottom crops mid-torso (mean alpha 0.445) and the right clips his
    // upper arm (0.183). Both need fading; the left (0.000) does not. The
    // right one was missed on the first pass and only showed once the portrait
    // sat mid-page (FR-004b).
    expect(container.querySelector('[class*="mask-b-from"]')).not.toBeNull();
    expect(container.querySelector('[class*="mask-r-from"]')).not.toBeNull();
  });

  it('caps its height below lg so it does not eat a phone viewport', () => {
    const { container } = render(
      <HeroPortrait name={NAME} imageSource="/images/hero_cutout.png" />,
    );
    const html = container.innerHTML;

    // FR-005a: head-and-shoulders when stacked, not the full torso.
    expect(html).toMatch(/max-h-\[?\d+/);
    expect(html).toMatch(/object-top/);
  });

  it('passes an explicit sizes, so the optimizer is not left assuming 100vw', () => {
    render(<HeroPortrait name={NAME} imageSource="/images/hero_cutout.png" />);
    expect(screen.getByRole('img')).toHaveAttribute('sizes');
  });

  it('does not preload: the backdrop already holds that slot as the LCP element', () => {
    render(<HeroPortrait name={NAME} imageSource="/images/hero_cutout.png" />);
    // Two preloaded images in one viewport compete for early bandwidth, which
    // is the LCP regression SC-008 forbids.
    expect(screen.getByRole('img')).toHaveAttribute('data-preload', 'false');
  });

  it('uses no inline style, so the fade stays a utility the stylesheet can see', () => {
    const { container } = render(
      <HeroPortrait name={NAME} imageSource="/images/hero_cutout.png" />,
    );
    for (const node of Array.from(container.querySelectorAll('*'))) {
      expect(node.getAttribute('style')).toBeNull();
    }
  });
});
