import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CareerJourneyLazy } from '@/components/Career/CareerJourneyLazy';

// The story embeds CareerJourneyLazy directly (no page-level ContentProvider
// wrapper needed here) — mock useContent so the test isn't coupled to the
// real experiences.json data.
jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => ({
    experiences: {
      loading: false,
      error: null,
      data: {
        experiences: [
          {
            id: '1',
            title: 'Senior Engineer',
            subtitle: 'Acme Corp',
            workType: 'Full-time',
            workDescription: ['Led the platform migration.', 'Mentored two engineers.'],
            dateText: '01/2022 – Present',
          },
          {
            id: '2',
            title: 'Engineer',
            subtitle: 'Older Company',
            workType: 'Full-time',
            workDescription: ['Built the first API.'],
            dateText: '01/2019 – 12/2021',
          },
        ],
      },
    },
  }),
}));

describe('Career journey embedded in the story', () => {
  it('opens on the most recent chapter', async () => {
    render(<CareerJourneyLazy />);
    expect(await screen.findByText('Acme Corp')).toBeInTheDocument();
  });

  it('passes to another chapter when its player is clicked', async () => {
    render(<CareerJourneyLazy />);

    const olderPlayer = await screen.findByRole('button', { name: /pass to.*Older Company/i });
    fireEvent.click(olderPlayer);

    expect(screen.getByText('Older Company')).toBeInTheDocument();
    expect(screen.getByText(/built the first api/i)).toBeInTheDocument();
  });

  it('offers the plain timeline as an alternative to the pitch', async () => {
    render(<CareerJourneyLazy />);

    const toggle = await screen.findByRole('button', { name: /switch to timeline/i });
    fireEvent.click(toggle);

    // The timeline keeps the chapters but drops the playing part entirely:
    // no players to pass to, and nothing to press play on.
    expect(screen.queryByRole('button', { name: /pass to/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /play in order/i })).not.toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
    expect(screen.getByText('Older Company')).toBeInTheDocument();
  });
});
