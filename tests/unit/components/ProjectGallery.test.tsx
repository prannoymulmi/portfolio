import { fireEvent, render, screen, within } from '@testing-library/react';
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

const mockProjects: { data: { projects: Project[] } | null; loading: boolean; error: Error | null } = {
  loading: false,
  error: null,
  data: { projects: [] },
};

jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => ({ projects: mockProjects }),
}));

import { ProjectGallery } from '@/components/Projects/ProjectGallery';

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
    render(<ProjectGallery />);
    const link = screen.getByRole('link', { name: /more on github/i });
    expect(link).toHaveAttribute('href', 'https://github.com/prannoymulmi');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('communicates a curated subset, distinct from any per-project GitHub link text (FR-009)', () => {
    render(<ProjectGallery />);
    const links = screen.getAllByRole('link', { name: /view on github/i });
    const profileLink = screen.getByRole('link', { name: /more on github/i });
    links.forEach((link) => expect(link.textContent).not.toEqual(profileLink.textContent));
  });

  it("opens a project's detail modal on card click", () => {
    render(<ProjectGallery />);
    fireEvent.click(screen.getByRole('button', { name: /alpha project/i }));
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('heading', { name: 'Alpha Project' })).toBeInTheDocument();
  });

  it('replaces the open modal rather than stacking a second one when another card is clicked', () => {
    render(<ProjectGallery />);
    fireEvent.click(screen.getByRole('button', { name: /alpha project/i }));
    fireEvent.click(screen.getByRole('button', { name: /beta project/i }));

    const dialogs = screen.getAllByRole('dialog');
    expect(dialogs).toHaveLength(1);
    expect(within(dialogs[0]).getByRole('heading', { name: 'Beta Project' })).toBeInTheDocument();
    expect(within(dialogs[0]).queryByRole('heading', { name: 'Alpha Project' })).not.toBeInTheDocument();
  });

  it('closes the modal and returns focus to the triggering card', () => {
    render(<ProjectGallery />);
    const card = screen.getByRole('button', { name: /alpha project/i });
    fireEvent.click(card);
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(card);
  });
});
