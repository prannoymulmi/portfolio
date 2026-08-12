import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EmailLink } from '@/components/Navigation/EmailLink';

const ADDRESS = 'someone@example.com';

describe('EmailLink', () => {
  it('opens a message to the address it is given', () => {
    render(<EmailLink email={ADDRESS} />);
    expect(screen.getByRole('link')).toHaveAttribute('href', `mailto:${ADDRESS}`);
  });

  it('announces itself as email rather than as an unlabelled glyph', () => {
    render(<EmailLink email={ADDRESS} />);
    const link = screen.getByRole('link');

    // The visible content is a drawing, so the accessible name has to come
    // from the label — otherwise a screen reader reaches a link with nothing
    // to read out.
    expect(link).toHaveAccessibleName(/email/i);
    expect(link.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('draws its own envelope instead of importing an icon set', () => {
    // ADR 0014 confines react-icons to brand marks, and only inside
    // SocialIcons.tsx. An envelope is not a brand mark.
    const source = fs.readFileSync(
      path.join(process.cwd(), 'components/Navigation/EmailLink.tsx'),
      'utf-8',
    );

    // Matches an import, not a mention — the file explains in a comment why it
    // does not use the library, and that explanation is worth keeping.
    expect(source).not.toMatch(/from\s+['"]react-icons/);
    render(<EmailLink email={ADDRESS} />);
    expect(screen.getByRole('link').querySelector('svg')).not.toBeNull();
  });

  it('shows a focus indicator, since it is reachable by keyboard from anywhere', () => {
    render(<EmailLink email={ADDRESS} />);
    expect(screen.getByRole('link').className).toMatch(/focus-visible:/);
  });
});
