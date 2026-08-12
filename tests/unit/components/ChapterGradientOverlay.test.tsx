import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub only
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

import { ChapterGradientOverlay } from '@/components/Common/ChapterGradientOverlay';

describe('ChapterGradientOverlay', () => {
  it('renders the configured gradient image', () => {
    const { container } = render(
      <ChapterGradientOverlay src="/images/mesh-soft.png" opacityClassName="opacity-20 dark:opacity-0" />,
    );
    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', '/images/mesh-soft.png');
  });

  it('is decorative: aria-hidden with empty alt text, so it is skipped by screen readers', () => {
    const { container } = render(
      <ChapterGradientOverlay src="/images/mesh-soft.png" opacityClassName="opacity-20 dark:opacity-0" />,
    );
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('applies the caller-supplied opacity class verbatim', () => {
    const { container } = render(
      <ChapterGradientOverlay src="/images/mesh-soft.png" opacityClassName="opacity-20 dark:opacity-0" />,
    );
    expect(container.querySelector('img')?.className).toContain('opacity-20');
  });

  it('carries a dark-mode cutoff, so a pale wash cannot dilute text contrast in dark appearance', () => {
    // The four gradient sources measure 0.84-0.93 mean relative luminance; over the
    // near-black dark scrim they would drop body text below AA. See the same rule in
    // components/Hero/HeroParallax.tsx and ADR 0015's contrast floor.
    const { container } = render(
      <ChapterGradientOverlay src="/images/mesh-soft.png" opacityClassName="opacity-20 dark:opacity-0" />,
    );
    expect(container.querySelector('img')?.className).toContain('dark:opacity-0');
  });

  it('does not paint a background utility, which would hide the pinned photograph', () => {
    // ADR 0015: chapters carry a translucent scrim over one shared photograph, never
    // an opaque or gradient background of their own. tests/integration/backdrop-coverage
    // guards the page source; this guards the component itself.
    const { container } = render(
      <ChapterGradientOverlay src="/images/mesh-soft.png" opacityClassName="opacity-20 dark:opacity-0" />,
    );
    expect(container.innerHTML).not.toMatch(/bg-gradient-to-|bg-white\b|bg-gray-\d/);
  });
});
