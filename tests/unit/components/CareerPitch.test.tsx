import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Experience } from '@/lib/types/portfolio';

import { CareerPitch } from '@/components/Career/CareerPitch';

const experiences: Experience[] = [
  {
    id: 'oldest',
    title: 'Junior Full Stack Developer',
    subtitle: 'Novomind AG',
    workType: 'Working student',
    workDescription: ['Built the frontend build pipeline.', 'Wrote the first integration tests.'],
    dateText: '01/2016 – 07/2018',
    technologies: ['Java', 'Webpack'],
  },
  {
    id: 'middle',
    title: 'Junior Backend Developer',
    subtitle: 'Otto GmbH & Co KG',
    workType: 'Full-time',
    workDescription: ['Migrated services onto AWS.'],
    dateText: '08/2018 – 10/2020',
    technologies: ['Terraform'],
  },
  {
    id: 'newest',
    title: 'Fullstack Engineer',
    subtitle: 'Immowelt GmbH',
    workType: 'Full-time',
    workDescription: ['Cut AWS spend by 10%.'],
    dateText: '11/2020 – Present',
  },
];

describe('CareerPitch', () => {
  it('puts one player on the pitch per career chapter', () => {
    render(<CareerPitch experiences={experiences} />);
    expect(screen.getAllByRole('button', { name: /pass to/i })).toHaveLength(experiences.length);
  });

  it('opens on the most recent chapter, not the oldest', () => {
    render(<CareerPitch experiences={experiences} />);
    expect(screen.getByRole('heading', { name: 'Immowelt GmbH' })).toBeInTheDocument();
  });

  it('shows a chapter in full when its player is passed to', () => {
    render(<CareerPitch experiences={experiences} />);
    fireEvent.click(screen.getByRole('button', { name: /pass to.*Novomind/i }));

    expect(screen.getByRole('heading', { name: 'Novomind AG' })).toBeInTheDocument();
    expect(screen.getByText('Junior Full Stack Developer')).toBeInTheDocument();
    expect(screen.getByText('01/2016 – 07/2018')).toBeInTheDocument();
    expect(screen.getByText(/first integration tests/i)).toBeInTheDocument();
  });

  it('lets chapters be visited in any order, not just forwards', () => {
    render(<CareerPitch experiences={experiences} />);
    fireEvent.click(screen.getByRole('button', { name: /pass to.*Novomind/i }));
    expect(screen.getByRole('heading', { name: 'Novomind AG' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /pass to.*Otto/i }));
    expect(screen.getByRole('heading', { name: 'Otto GmbH & Co KG' })).toBeInTheDocument();
    // The company still appears in the jump-to strip; only the open chapter changed.
    expect(screen.queryByRole('heading', { name: 'Novomind AG' })).not.toBeInTheDocument();
  });

  it('numbers the chapters oldest-first, whatever order the data arrives in', () => {
    // The fixture is already chronological; pass it reversed to prove the
    // ordering comes from dateText rather than from array position.
    render(<CareerPitch experiences={[...experiences].reverse()} />);
    expect(screen.getByRole('button', { name: /chapter 1.*Novomind/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chapter 3.*Immowelt/i })).toBeInTheDocument();
  });

  it('walks the chapters in order when the play is run, and stops when paused', () => {
    jest.useFakeTimers();
    try {
      render(<CareerPitch experiences={experiences} />);

      fireEvent.click(screen.getByRole('button', { name: /play in order/i }));
      // Starts the walk from the beginning rather than from wherever it sat.
      expect(screen.getByRole('heading', { name: 'Novomind AG' })).toBeInTheDocument();

      act(() => {
        jest.advanceTimersByTime(2600);
      });
      expect(screen.getByRole('heading', { name: 'Otto GmbH & Co KG' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /pause/i }));
      act(() => {
        jest.advanceTimersByTime(2600 * 3);
      });
      // Held where it was paused.
      expect(screen.getByRole('heading', { name: 'Otto GmbH & Co KG' })).toBeInTheDocument();
    } finally {
      jest.useRealTimers();
    }
  });

  it('renders nothing rather than an empty pitch when there are no chapters', () => {
    const { container } = render(<CareerPitch experiences={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
