import type { ReactElement } from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Project } from '@/lib/types/portfolio';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub only
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

jest.mock('@/lib/utils/animations', () => ({
  prefersReducedMotion: jest.fn(() => false),
}));

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react');
  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: {
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

const mockProjects: {
  data: { projects: Project[] } | null;
  loading: boolean;
  error: Error | null;
} = {
  loading: false,
  error: null,
  data: { projects: [] },
};

jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => ({ projects: mockProjects }),
}));

import { ProjectGallery } from '@/components/Projects/ProjectGallery';
import { LocaleProvider } from '@/components/Common/LocaleProvider';
import { dispatchProjectHighlight } from '@/lib/utils/projectHighlight';

function renderWithLocale(ui: ReactElement) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}

function project(overrides: Partial<Project> & { title: string }): Project {
  return {
    bodyText: 'A description long enough to read like real body copy that ends without truncation.',
    links: [{ text: 'View on GitHub', route: 'https://github.com/prannoymulmi/example' }],
    tags: ['TypeScript'],
    ...overrides,
  };
}

describe('ProjectGallery', () => {
  beforeEach(() => {
    mockProjects.loading = false;
    mockProjects.error = null;
    mockProjects.data = {
      projects: [
        project({ id: 'alpha', title: 'Alpha Project' }),
        project({ id: 'beta', title: 'Beta Project' }),
      ],
    };
  });

  it('renders a low-emphasis GitHub profile link near the heading (US3, FR-008)', () => {
    renderWithLocale(<ProjectGallery />);
    const link = screen.getByRole('link', { name: /more on github/i });
    expect(link).toHaveAttribute('href', 'https://github.com/prannoymulmi');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('communicates a curated subset, distinct from any per-project GitHub link text (FR-009)', () => {
    renderWithLocale(<ProjectGallery />);
    const links = screen.getAllByRole('link', { name: /view on github/i });
    const profileLink = screen.getByRole('link', { name: /more on github/i });
    links.forEach((link) => expect(link.textContent).not.toEqual(profileLink.textContent));
  });

  it("opens a project's detail modal on card click", () => {
    renderWithLocale(<ProjectGallery />);
    fireEvent.click(screen.getByRole('button', { name: /alpha project/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: 'Alpha Project' })).toBeInTheDocument();
  });

  it('replaces the open modal rather than stacking a second one when another card is clicked', () => {
    renderWithLocale(<ProjectGallery />);
    fireEvent.click(screen.getByRole('button', { name: /alpha project/i }));
    fireEvent.click(screen.getByRole('button', { name: /beta project/i }));

    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs).toHaveLength(1);
    expect(within(dialogs[0]).getByRole('heading', { name: 'Beta Project' })).toBeInTheDocument();
    expect(
      within(dialogs[0]).queryByRole('heading', { name: 'Alpha Project' }),
    ).not.toBeInTheDocument();
  });

  it('runs the same highlight ring when a card is opened from the gallery, not only from the hero pill', () => {
    renderWithLocale(<ProjectGallery />);
    fireEvent.click(screen.getByRole('button', { name: /alpha project/i }));

    const frame = screen.getByRole('dialog').parentElement as HTMLElement;
    expect(frame.className).toMatch(/project-card-highlight/);
  });

  it('closes the modal and returns focus to the triggering card', () => {
    renderWithLocale(<ProjectGallery />);
    const card = screen.getByRole('button', { name: /alpha project/i });
    fireEvent.click(card);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(card);
  });

  describe('hero pill highlight', () => {
    const alphaCard = () => screen.getByRole('button', { name: /alpha project/i });
    // The ring rides the frame wrapping the dialog, not the dialog itself —
    // the dialog scrolls its own overflow, which would carry the ring's
    // ::before away with it. See ProjectDetailModal.
    const ringFrame = () => screen.getByRole('dialog').parentElement as HTMLElement;

    it('opens the detail modal on a dispatched event (hero pill click)', () => {
      renderWithLocale(<ProjectGallery />);
      act(() => dispatchProjectHighlight('alpha'));

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByRole('heading', { name: 'Alpha Project' })).toBeInTheDocument();
    });

    it('runs the highlight ring on the opened modal, not on the card in the grid', () => {
      renderWithLocale(<ProjectGallery />);
      act(() => dispatchProjectHighlight('alpha'));

      expect(ringFrame().className).toMatch(/project-card-highlight/);
      expect(alphaCard().className).not.toMatch(/project-card-highlight/);
    });

    it('retriggers the ring on a second dispatch for the same project, even while the first highlight is still active', () => {
      renderWithLocale(<ProjectGallery />);
      act(() => dispatchProjectHighlight('alpha'));
      const frame = ringFrame();
      expect(frame.className).toMatch(/project-card-highlight/);

      const removeSpy = jest.spyOn(frame.classList, 'remove');
      const addSpy = jest.spyOn(frame.classList, 'add');

      // A second click on the same pill, before the first highlight has
      // cleared — this is exactly the "click again, nothing happens" bug:
      // the id alone wouldn't change here, so nothing would force the CSS
      // animation to restart without the token forcing a reflow.
      act(() => dispatchProjectHighlight('alpha'));

      expect(removeSpy).toHaveBeenCalledWith('project-card-highlight');
      expect(addSpy).toHaveBeenCalledWith('project-card-highlight');
      expect(frame.className).toMatch(/project-card-highlight/);
    });

    it('retriggers the ring after the first highlight has cleared and is re-dispatched', () => {
      jest.useFakeTimers();
      try {
        renderWithLocale(<ProjectGallery />);
        act(() => dispatchProjectHighlight('alpha'));
        expect(ringFrame().className).toMatch(/project-card-highlight/);

        // The highlight auto-clears once the CSS animation has had time to
        // finish. The modal stays open — only the ring goes away.
        act(() => {
          jest.advanceTimersByTime(1400 * 3 + 1);
        });
        expect(ringFrame().className).not.toMatch(/project-card-highlight/);

        act(() => dispatchProjectHighlight('alpha'));
        expect(ringFrame().className).toMatch(/project-card-highlight/);
      } finally {
        jest.useRealTimers();
      }
    });

    it('ignores a dispatch for an id that is not in the current project list', () => {
      renderWithLocale(<ProjectGallery />);
      act(() => dispatchProjectHighlight('does-not-exist'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
