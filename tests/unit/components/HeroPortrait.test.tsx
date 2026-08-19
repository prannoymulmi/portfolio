import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeroPortrait } from '@/components/Hero/HeroPortrait';
import { LocaleProvider } from '@/components/Common/LocaleProvider';

function renderWithLocale(ui: ReactElement) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}

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
    const { container } = renderWithLocale(<HeroPortrait name={NAME} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders exactly one image', () => {
    renderWithLocale(<HeroPortrait name={NAME} imageSource="/images/hero_portrait.png" />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('names the subject in the alt text, because a person is content and not decoration', () => {
    renderWithLocale(<HeroPortrait name={NAME} imageSource="/images/hero_portrait.png" />);
    const portrait = screen.getByRole('img');

    expect(portrait).toHaveAccessibleName(new RegExp(NAME, 'i'));
    expect(portrait.getAttribute('alt')).not.toBe('');
  });

  it('dissolves both clipped edges rather than ending on a crop line', () => {
    const { container } = renderWithLocale(
      <HeroPortrait name={NAME} imageSource="/images/hero_portrait.png" />,
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
    const { container } = renderWithLocale(
      <HeroPortrait name={NAME} imageSource="/images/hero_portrait.png" />,
    );
    const html = container.innerHTML;

    // FR-005a: head-and-shoulders when stacked, not the full torso.
    expect(html).toMatch(/max-h-\[?\d+/);
    expect(html).toMatch(/object-top/);
  });

  it('passes an explicit sizes, so the optimizer is not left assuming 100vw', () => {
    renderWithLocale(<HeroPortrait name={NAME} imageSource="/images/hero_portrait.png" />);
    expect(screen.getByRole('img')).toHaveAttribute('sizes');
  });

  it('preloads, because this element is the largest contentful paint', () => {
    renderWithLocale(<HeroPortrait name={NAME} imageSource="/images/hero_portrait.png" />);
    // The plan assumed the backdrop would keep that role and left this off.
    // Measurement disagreed: Chrome reports the portrait as LCP, and
    // preloading it lands 196-208ms against 212-216ms without (SC-008).
    expect(screen.getByRole('img')).toHaveAttribute('data-preload', 'true');
  });

  it('uses no inline style, so the fade stays a utility the stylesheet can see', () => {
    const { container } = renderWithLocale(
      <HeroPortrait name={NAME} imageSource="/images/hero_portrait.png" />,
    );
    for (const node of Array.from(container.querySelectorAll('*'))) {
      expect(node.getAttribute('style')).toBeNull();
    }
  });
});
