import type { ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ValueProp } from '@/components/Hero/ValueProp';
import { LocaleProvider } from '@/components/Common/LocaleProvider';

function renderWithLocale(ui: ReactElement) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}

/** The two calls to action, in source order. */
const buttons = () => [
  screen.getByRole('link', { name: /view work/i }),
  screen.getByRole('link', { name: /play career/i }),
];

/** Border widths as Tailwind writes them, e.g. `border-2` -> 2. */
const borderWidth = (el: Element) => {
  const match = el.className.match(/(?:^|\s)border-(\d+)(?:\s|$)/);
  return match ? Number(match[1]) : 0;
};

describe('ValueProp', () => {
  it('points each button at its own section', () => {
    renderWithLocale(<ValueProp />);
    const [viewWork, playCareer] = buttons();

    expect(viewWork).toHaveAttribute('href', '/#projects');
    expect(playCareer).toHaveAttribute('href', '/#career');
  });

  it('gives both buttons the same box, so they cannot differ in height', () => {
    renderWithLocale(<ValueProp />);
    const [viewWork, playCareer] = buttons();

    // The defect this fixes: the primary had no border while the secondary
    // had border-2, making them 60px and 64px tall. Stacked, `align-items:
    // stretch` equalises widths rather than heights, so the 4px showed.
    expect(borderWidth(viewWork)).toBe(borderWidth(playCareer));
    expect(borderWidth(viewWork)).toBeGreaterThan(0);

    for (const button of [viewWork, playCareer]) {
      expect(button.className).toMatch(/(^|\s)px-8(\s|$)/);
      expect(button.className).toMatch(/(^|\s)py-4(\s|$)/);
      expect(button.className).toMatch(/(^|\s)text-lg(\s|$)/);
    }
  });

  it('leads both buttons with an icon, so their labels sit on one axis', () => {
    renderWithLocale(<ValueProp />);

    for (const button of buttons()) {
      const first = button.firstElementChild;
      expect(first?.tagName.toLowerCase()).toBe('svg');
      // A leading glyph on one and a trailing glyph on the other offsets the
      // labels horizontally even when the boxes match (FR-019).
      expect(first).toHaveAttribute('aria-hidden', 'true');
    }
  });

  it('keeps the trailing arrow on the primary button only, as a hierarchy cue', () => {
    renderWithLocale(<ValueProp />);
    const [viewWork, playCareer] = buttons();

    // Deliberate, and matching the reference design: FR-019 governs the
    // leading icons. Do not "fix" this into symmetry.
    expect(viewWork.querySelectorAll('svg')).toHaveLength(2);
    expect(playCareer.querySelectorAll('svg')).toHaveLength(1);
  });

  it('stretches both buttons to one width when stacked', () => {
    const { container } = renderWithLocale(<ValueProp />);
    const row = container.firstElementChild;

    expect(row?.className).toMatch(/flex-col/);
    expect(row?.className).toMatch(/sm:flex-row/);
  });

  it('announces no icon to a screen reader, since each button already has a label', () => {
    renderWithLocale(<ValueProp />);

    for (const button of buttons()) {
      for (const glyph of Array.from(button.querySelectorAll('svg'))) {
        expect(glyph).toHaveAttribute('aria-hidden', 'true');
      }
    }
  });
});
