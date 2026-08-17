import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Project } from '@/lib/types/portfolio';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: React.ComponentProps<'img'>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub only
    <img {...props} alt={props.alt ?? ''} />
  ),
}));

const mockSystems: { data: { projects: Project[] } | null; loading: boolean; error: Error | null } = {
  loading: false,
  error: null,
  data: { projects: [] },
};

jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => ({ systems: mockSystems }),
}));

import { ThreeSystems } from '@/components/Work/ThreeSystems';

function project(overrides: Partial<Project> & { title: string }): Project {
  return {
    bodyText: 'A description of the system long enough to read like real body copy.',
    links: [{ text: 'GitHub link', route: 'https://example.com' }],
    tags: ['Go', 'Postgres', 'Kafka'],
    ...overrides,
  };
}

describe('ThreeSystems', () => {
  beforeEach(() => {
    mockSystems.loading = false;
    mockSystems.error = null;
    mockSystems.data = {
      projects: [
        project({ title: 'Cloud Migration Platform', role: 'Tech lead', metric: '99.99% uptime' }),
        project({ title: 'Real-Time Analytics Dashboard', metric: '10M+ events daily' }),
        project({ title: 'E-Commerce API', metric: 'Millions of transactions' }),
      ],
    };
  });

  it('shows three systems', () => {
    render(<ThreeSystems />);
    expect(screen.getByText('Cloud Migration Platform')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Analytics Dashboard')).toBeInTheDocument();
    expect(screen.getByText('E-Commerce API')).toBeInTheDocument();
  });

  it('shows at most three, even when the content file carries more', () => {
    mockSystems.data!.projects.push(project({ title: 'A Fourth System Nobody Asked For' }));
    render(<ThreeSystems />);
    expect(screen.queryByText('A Fourth System Nobody Asked For')).not.toBeInTheDocument();
  });

  it("carries each system's headline metric and stack", () => {
    render(<ThreeSystems />);
    expect(screen.getByText('99.99% uptime')).toBeInTheDocument();
    expect(screen.getByText('10M+ events daily')).toBeInTheDocument();
    expect(screen.getAllByText('Postgres').length).toBe(3);
  });

  it('shows a role when the data has one', () => {
    render(<ThreeSystems />);
    expect(screen.getByText('Tech lead')).toBeInTheDocument();
  });

  it('omits the year entirely rather than inventing one when it is absent', () => {
    // Every fixture above deliberately has no `year`. A placeholder date on a
    // piece of professional evidence is worse than a missing one, so the
    // element must not render at all.
    const { container } = render(<ThreeSystems />);
    expect(container.querySelector('[data-testid="system-year"]')).toBeNull();
  });

  it('shows the year when the data does have one', () => {
    mockSystems.data!.projects[0] = project({ title: 'Cloud Migration Platform', year: '2025' });
    render(<ThreeSystems />);
    expect(screen.getByText('2025')).toBeInTheDocument();
  });

  it('renders the section heading the showcase is named for', () => {
    render(<ThreeSystems />);
    // Apostrophe-agnostic: the heading uses a typographic apostrophe (’), and
    // the test should not be the reason that degrades to a straight quote.
    expect(
      screen.getByRole('heading', { name: /three systems i.d happily defend in a design review/i }),
    ).toBeInTheDocument();
  });

  it('renders nothing but a skeleton while content is loading', () => {
    mockSystems.loading = true;
    mockSystems.data = null;
    render(<ThreeSystems />);
    expect(screen.queryByText('Cloud Migration Platform')).not.toBeInTheDocument();
  });

  it('reports a failure rather than an empty section when content cannot load', () => {
    mockSystems.loading = false;
    mockSystems.error = new Error('boom');
    mockSystems.data = null;
    render(<ThreeSystems />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });
});
