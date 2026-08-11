import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CvLink } from '@/components/Hero/CvLink';

const cv = { label: 'Download CV', href: 'https://example.com/prannoy-mulmi-cv.pdf' };

describe('CvLink', () => {
  it('renders the label from content as a link to the address', () => {
    render(<CvLink cv={cv} />);
    expect(screen.getByRole('link', { name: /download cv/i })).toHaveAttribute('href', cv.href);
  });

  it('opens the CV in a new tab so the visitor keeps their place on the page', () => {
    render(<CvLink cv={cv} />);
    const link = screen.getByRole('link', { name: /download cv/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'));
  });

  it('says in its accessible name that it opens a new tab', () => {
    render(<CvLink cv={cv} />);
    expect(screen.getByRole('link', { name: /opens in a new tab/i })).toBeInTheDocument();
  });

  it('renders nothing when no CV address is configured', () => {
    const { container } = render(<CvLink cv={undefined} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('reads as small text, not as a third button beside the two calls to action', () => {
    render(<CvLink cv={cv} />);
    const link = screen.getByRole('link', { name: /download cv/i });
    // The CTAs are px-8 py-4 rounded-lg with a background or border. None of
    // that may appear here — the instruction was a link to click, not a button.
    expect(link.className).toMatch(/text-xs/);
    expect(link.className).not.toMatch(/(^|\s)(bg-|border-2|rounded-lg|px-8|py-4)/);
  });

  it('is set in the mono face the cards use for data, not the buttons’ sans', () => {
    render(<CvLink cv={cv} />);
    // The typeface is what marks this as a record about the player rather than
    // a third call to action, so it is the assertion that protects the intent.
    expect(screen.getByRole('link', { name: /download cv/i }).className).toMatch(/font-mono/);
  });

  it('carries a decorative glyph that screen readers skip', () => {
    const { container } = render(<CvLink cv={cv} />);
    const icon = container.querySelector('svg');
    // The label already names the destination; an announced glyph would only
    // repeat it.
    expect(icon).toHaveAttribute('aria-hidden', 'true');
    expect(
      screen.getByRole('link', { name: /^download cv \(opens in a new tab\)$/i }),
    ).toBeInTheDocument();
  });

  it('uses the token that clears contrast over the backdrop photograph', () => {
    render(<CvLink cv={cv} />);
    // ADR 0015: the photo's darkest region sits at 0.293 relative luminance,
    // so gray-600/700 fall below AA against it.
    expect(screen.getByRole('link', { name: /download cv/i }).className).toMatch(/text-on-photo/);
  });
});
