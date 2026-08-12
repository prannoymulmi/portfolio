import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Backdrop } from '@/components/Common/Backdrop';

// next/image renders an <img> in jsdom; keep the real component so the props
// we care about (fill, sizes, preload) still reach the DOM as attributes.
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, preload, ...rest }: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img data-fill={String(fill)} data-preload={String(preload)} {...rest} />
  ),
}));

describe('Backdrop', () => {
  it('renders exactly one backdrop layer', () => {
    const { container } = render(<Backdrop />);
    expect(container.querySelectorAll('img')).toHaveLength(1);
  });

  it('pins the layer so it cannot move as the page scrolls', () => {
    const { container } = render(<Backdrop />);
    const layer = container.firstElementChild;

    expect(layer).toHaveClass('fixed');
    expect(layer).toHaveClass('inset-0');
    // Behind every chapter, not just the first.
    expect(layer).toHaveClass('-z-10');
  });

  it('serves the photo through the image optimizer, not as a CSS background', () => {
    const { container } = render(<Backdrop />);
    const layer = container.firstElementChild as HTMLElement;
    const image = screen.getByRole('img', { hidden: true });

    // A background-image would bypass the optimizer entirely and ship the
    // 1.73 MB original to every visitor.
    expect(layer.style.backgroundImage).toBe('');
    expect(image).toHaveAttribute('data-fill', 'true');
    expect(image).toHaveAttribute('sizes', '100vw');
  });

  it('preloads the photo, since it is the largest contentful paint element', () => {
    render(<Backdrop />);
    // `priority` is deprecated in Next 16 in favour of `preload`.
    expect(screen.getByRole('img', { hidden: true })).toHaveAttribute('data-preload', 'true');
  });

  it('shows the photo at full strength — it is the page surface, not a texture', () => {
    const { container } = render(<Backdrop />);
    const className = (container.firstElementChild as HTMLElement).className;

    // The dark theme dimmed this to 20%, which is what made removing it worth
    // doing (ADR 0019). Nothing may reintroduce an opacity here: the scrim on
    // each chapter is what carries contrast, per ADR 0015.
    expect(className).not.toMatch(/\bopacity-/);
  });

  it('hides the decorative layer from assistive technology', () => {
    const { container } = render(<Backdrop />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });
});
