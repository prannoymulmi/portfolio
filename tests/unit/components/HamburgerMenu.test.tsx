import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HamburgerMenu } from '@/components/Navigation/HamburgerMenu';
import { prefersReducedMotion } from '@/lib/utils/animations';

jest.mock('@/lib/utils/animations', () => ({
  prefersReducedMotion: jest.fn(() => false),
}));

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react');
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      // Strips the motion-only props (initial/animate/exit/transition)
      // rather than spreading them onto the DOM node, which is what a real
      // <nav> would otherwise warn about receiving.
      nav: React.forwardRef(
        (
          { children, initial, animate, exit, transition, ...rest }: Record<string, unknown>,
          ref: React.Ref<HTMLElement>,
        ) => (
          <nav ref={ref} {...rest}>
            {children as React.ReactNode}
          </nav>
        ),
      ),
    },
  };
});

const SECTIONS = [
  { id: 'hero', label: 'Introduction' },
  { id: 'skills', label: 'Selected Work' },
  { id: 'career', label: 'Career Journey' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'playbook', label: 'Technical Playbook' },
  { id: 'contact', label: 'Contact' },
];

describe('HamburgerMenu', () => {
  it('renders a toggle button with the sections passed in, closed by default', () => {
    render(<HamburgerMenu sections={SECTIONS} />);

    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Career Journey' })).not.toBeInTheDocument();
  });

  describe('opening the menu', () => {
    it('lists every section, in order, with the right label and href (FR-002, FR-003)', () => {
      render(<HamburgerMenu sections={SECTIONS} />);
      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));

      const links = screen.getAllByRole('link');
      expect(links.map((link) => link.textContent)).toEqual(SECTIONS.map((s) => s.label));
      SECTIONS.forEach((section, i) => {
        expect(links[i]).toHaveAttribute('href', `#${section.id}`);
      });
    });
  });

  describe('closing the menu', () => {
    it('closes without navigating away when a link is selected (FR-004)', () => {
      render(<HamburgerMenu sections={SECTIONS} />);
      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
      fireEvent.click(screen.getByRole('link', { name: 'Career Journey' }));

      expect(screen.queryByRole('link', { name: 'Career Journey' })).not.toBeInTheDocument();
    });

    it('closes on re-activating the toggle (FR-005)', () => {
      render(<HamburgerMenu sections={SECTIONS} />);
      const toggle = screen.getByRole('button', { name: /open menu/i });
      fireEvent.click(toggle);
      fireEvent.click(screen.getByRole('button', { name: /close menu/i }));

      expect(screen.queryByRole('link', { name: 'Career Journey' })).not.toBeInTheDocument();
    });

    it('closes on Escape without navigating (FR-005)', () => {
      render(<HamburgerMenu sections={SECTIONS} />);
      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByRole('link', { name: 'Career Journey' })).not.toBeInTheDocument();
    });

    it('closes on a click outside the panel and toggle (FR-005)', () => {
      render(
        <div>
          <div data-testid="outside" />
          <HamburgerMenu sections={SECTIONS} />
        </div>,
      );
      fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
      fireEvent.pointerDown(screen.getByTestId('outside'));

      expect(screen.queryByRole('link', { name: 'Career Journey' })).not.toBeInTheDocument();
    });
  });

  describe('reduced motion', () => {
    it('still opens and closes when prefers-reduced-motion is set (Edge Cases)', () => {
      (prefersReducedMotion as jest.Mock).mockReturnValue(true);
      try {
        render(<HamburgerMenu sections={SECTIONS} />);
        fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
        expect(screen.getByRole('link', { name: 'Career Journey' })).toBeInTheDocument();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(screen.queryByRole('link', { name: 'Career Journey' })).not.toBeInTheDocument();
      } finally {
        (prefersReducedMotion as jest.Mock).mockReturnValue(false);
      }
    });
  });
});
