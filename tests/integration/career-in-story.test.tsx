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
        ],
      },
    },
  }),
}));

describe('Career journey embedded in the story', () => {
  it('still expands a milestone on click, same as the standalone page did', async () => {
    render(<CareerJourneyLazy />);

    const milestoneButton = await screen.findByRole('button', { name: /Senior Engineer/i });
    expect(milestoneButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(milestoneButton);

    expect(milestoneButton).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Led the platform migration/i)).toBeInTheDocument();
  });
});
