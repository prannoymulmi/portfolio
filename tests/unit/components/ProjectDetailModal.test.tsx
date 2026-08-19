import type { ReactElement } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProjectDetailModal } from '@/components/Projects/ProjectDetailModal';
import { LocaleProvider } from '@/components/Common/LocaleProvider';
import { prefersReducedMotion } from '@/lib/utils/animations';
import type { Project } from '@/lib/types/portfolio';

function renderWithLocale(ui: ReactElement) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}

jest.mock('@/lib/utils/animations', () => ({
  prefersReducedMotion: jest.fn(() => false),
}));

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react');
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
      // Strips the motion-only props rather than spreading them onto the DOM
      // node, which is what a real <div> would otherwise warn about.
      div: React.forwardRef(
        (
          { children, initial, animate, exit, transition, ...rest }: Record<string, unknown>,
          ref: React.Ref<HTMLDivElement>,
        ) => (
          <div ref={ref} {...rest}>
            {children as React.ReactNode}
          </div>
        ),
      ),
    },
  };
});

function project(overrides: Partial<Project> & { title: string }): Project {
  return {
    bodyText: 'A description of the project long enough to read like real body copy, not a fragment.',
    links: [{ text: 'View on GitHub', route: 'https://github.com/prannoymulmi/example' }],
    tags: ['TypeScript', 'Next.js'],
    ...overrides,
  };
}

describe('ProjectDetailModal', () => {
  it('renders nothing when project is null', () => {
    const { container } = renderWithLocale(<ProjectDetailModal project={null} onClose={jest.fn()} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders a dialog with the project title when project is set', () => {
    renderWithLocale(<ProjectDetailModal project={project({ title: 'Auth0 Platform' })} onClose={jest.fn()} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Auth0 Platform' })).toBeInTheDocument();
  });

  describe('description content (US1)', () => {
    it("renders the project's full bodyText verbatim, with no truncation (FR-002)", () => {
      const longText =
        'This is the complete, untruncated description text that should appear in full without any line-clamp styling cutting it off mid-sentence.';
      renderWithLocale(<ProjectDetailModal project={project({ title: 'Full Text', bodyText: longText })} onClose={jest.fn()} />);

      const description = screen.getByText(longText);
      expect(description).toBeInTheDocument();
      expect(description.className).not.toMatch(/line-clamp/);
    });

    it('renders role and metric when present', () => {
      renderWithLocale(
        <ProjectDetailModal
          project={project({ title: 'With Role', role: 'Tech lead', metric: '1M+ users' })}
          onClose={jest.fn()}
        />,
      );
      expect(screen.getByText('Tech lead')).toBeInTheDocument();
      expect(screen.getByText('1M+ users')).toBeInTheDocument();
    });

    it('omits role and metric entirely when absent, rather than an empty label', () => {
      renderWithLocale(<ProjectDetailModal project={project({ title: 'No Role' })} onClose={jest.fn()} />);
      expect(screen.queryByText(/tech lead/i)).not.toBeInTheDocument();
    });
  });

  describe('closing (FR-004, FR-005)', () => {
    it('calls onClose when the close button is clicked', () => {
      const onClose = jest.fn();
      renderWithLocale(<ProjectDetailModal project={project({ title: 'Closeable' })} onClose={onClose} />);
      fireEvent.click(screen.getByRole('button', { name: /close/i }));
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose on Escape', () => {
      const onClose = jest.fn();
      renderWithLocale(<ProjectDetailModal project={project({ title: 'Escapable' })} onClose={onClose} />);
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose on a click outside the panel', () => {
      const onClose = jest.fn();
      renderWithLocale(
        <div>
          <div data-testid="outside" />
          <ProjectDetailModal project={project({ title: 'Outside Click' })} onClose={onClose} />
        </div>,
      );
      fireEvent.pointerDown(screen.getByTestId('outside'));
      expect(onClose).toHaveBeenCalled();
    });

    it('does not close when clicking inside the panel', () => {
      const onClose = jest.fn();
      renderWithLocale(<ProjectDetailModal project={project({ title: 'Inside Click' })} onClose={onClose} />);
      fireEvent.pointerDown(screen.getByRole('dialog'));
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('keyboard and focus', () => {
    it('moves focus to the close button on open', () => {
      renderWithLocale(<ProjectDetailModal project={project({ title: 'Focus Me' })} onClose={jest.fn()} />);
      expect(document.activeElement).toBe(screen.getByRole('button', { name: /close/i }));
    });

    it('traps Tab within the modal, wrapping from the last focusable element to the first', () => {
      renderWithLocale(<ProjectDetailModal project={project({ title: 'Trap Me' })} onClose={jest.fn()} />);
      const dialog = screen.getByRole('dialog');
      const focusable = dialog.querySelectorAll('a[href], button');
      const last = focusable[focusable.length - 1] as HTMLElement;
      last.focus();

      fireEvent.keyDown(document, { key: 'Tab' });

      expect(document.activeElement).toBe(focusable[0]);
    });

    it('wraps Shift+Tab from the first focusable element to the last', () => {
      renderWithLocale(<ProjectDetailModal project={project({ title: 'Trap Me Back' })} onClose={jest.fn()} />);
      const closeButton = screen.getByRole('button', { name: /close/i });
      closeButton.focus();

      fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

      const dialog = screen.getByRole('dialog');
      const focusable = dialog.querySelectorAll('a[href], button');
      expect(document.activeElement).toBe(focusable[focusable.length - 1]);
    });
  });

  describe('GitHub link resolution (US2)', () => {
    it('links to the first links entry containing github.com (FR-003)', () => {
      renderWithLocale(
        <ProjectDetailModal
          project={project({
            title: 'GitHub Project',
            links: [
              { text: 'Company site', route: 'https://example.com' },
              { text: 'Code', route: 'https://github.com/prannoymulmi/target-repo' },
            ],
          })}
          onClose={jest.fn()}
        />,
      );
      expect(screen.getByRole('link', { name: /view on github/i })).toHaveAttribute(
        'href',
        'https://github.com/prannoymulmi/target-repo',
      );
    });

    it('falls back to links[0] when no entry contains github.com', () => {
      renderWithLocale(
        <ProjectDetailModal
          project={project({
            title: 'No GitHub Project',
            links: [{ text: 'Company site', route: 'https://example.com' }],
          })}
          onClose={jest.fn()}
        />,
      );
      expect(screen.getByRole('link', { name: /view on github/i })).toHaveAttribute(
        'href',
        'https://example.com',
      );
    });

    it('opens the GitHub link in a new tab safely', () => {
      renderWithLocale(<ProjectDetailModal project={project({ title: 'New Tab' })} onClose={jest.fn()} />);
      const link = screen.getByRole('link', { name: /view on github/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('reduced motion', () => {
    it('still opens and closes when prefers-reduced-motion is set', () => {
      (prefersReducedMotion as jest.Mock).mockReturnValue(true);
      try {
        const onClose = jest.fn();
        renderWithLocale(<ProjectDetailModal project={project({ title: 'Reduced Motion' })} onClose={onClose} />);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        fireEvent.keyDown(document, { key: 'Escape' });
        expect(onClose).toHaveBeenCalled();
      } finally {
        (prefersReducedMotion as jest.Mock).mockReturnValue(false);
      }
    });
  });

  describe('edge cases', () => {
    it('stays present and reachable after a simulated viewport resize while open', () => {
      renderWithLocale(<ProjectDetailModal project={project({ title: 'Resize Me' })} onClose={jest.fn()} />);
      fireEvent(window, new Event('resize'));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /view on github/i })).toBeInTheDocument();
    });
  });
});
