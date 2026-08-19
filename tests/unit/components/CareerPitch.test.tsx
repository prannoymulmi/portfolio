import type { ReactElement } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Experience } from '@/lib/types/portfolio';
import { prefersReducedMotion } from '@/lib/utils/animations';

jest.mock('@/lib/utils/animations', () => ({
  prefersReducedMotion: jest.fn(() => false),
}));

// Strips the motion-only props rather than spreading them onto the SVG node
// (transition isn't a valid DOM attribute). `animate`'s cx/cy are spread
// directly, since jsdom has no real animation loop — the ball just renders at
// its target position. `transition`'s duration is exposed as a data
// attribute purely so tests can assert reduced-motion collapses it to zero.
jest.mock('framer-motion', () => {
  const React = jest.requireActual('react');
  return {
    motion: {
      circle: React.forwardRef(
        (
          { animate, transition, initial, ...rest }: Record<string, unknown>,
          ref: React.Ref<SVGCircleElement>,
        ) => (
          <circle
            ref={ref}
            {...rest}
            {...((animate as Record<string, unknown>) ?? {})}
            data-transition-duration={
              (transition as { duration?: number } | undefined)?.duration ?? ''
            }
          />
        ),
      ),
    },
  };
});

import { CareerPitch } from '@/components/Career/CareerPitch';
import { LocaleProvider } from '@/components/Common/LocaleProvider';

function renderWithLocale(ui: ReactElement) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}

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
    renderWithLocale(<CareerPitch experiences={experiences} />);
    expect(screen.getAllByRole('button', { name: /pass to/i })).toHaveLength(experiences.length);
  });

  it('opens on the most recent chapter, not the oldest', () => {
    renderWithLocale(<CareerPitch experiences={experiences} />);
    expect(screen.getByRole('heading', { name: 'Immowelt GmbH' })).toBeInTheDocument();
  });

  it('shows a chapter in full when its player is passed to', () => {
    renderWithLocale(<CareerPitch experiences={experiences} />);
    fireEvent.click(screen.getByRole('button', { name: /pass to.*Novomind/i }));

    expect(screen.getByRole('heading', { name: 'Novomind AG' })).toBeInTheDocument();
    expect(screen.getByText('Junior Full Stack Developer')).toBeInTheDocument();
    expect(screen.getByText('01/2016 – 07/2018')).toBeInTheDocument();
    expect(screen.getByText(/first integration tests/i)).toBeInTheDocument();
  });

  it('lets chapters be visited in any order, not just forwards', () => {
    renderWithLocale(<CareerPitch experiences={experiences} />);
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
    renderWithLocale(<CareerPitch experiences={[...experiences].reverse()} />);
    expect(screen.getByRole('button', { name: /chapter 1.*Novomind/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chapter 3.*Immowelt/i })).toBeInTheDocument();
  });

  it('breaks a same-year tie by month, not by array position', () => {
    // Both start in 2018. Otto is listed first in this fixture but starts
    // seven months after Novomind, so year alone would tie and a stable sort
    // would wrongly keep Otto ahead — month is what breaks the tie correctly.
    const sameYear: Experience[] = [
      {
        id: 'otto',
        title: 'Junior Backend Developer',
        subtitle: 'Otto GmbH & Co KG',
        workType: 'Full-time',
        workDescription: ['Migrated services onto AWS.'],
        dateText: '08/2018 – 10/2020',
      },
      {
        id: 'novomind',
        title: 'Junior Full Stack Developer',
        subtitle: 'Novomind AG',
        workType: 'Working student',
        workDescription: ['Built the frontend build pipeline.'],
        dateText: '01/2018 – 08/2018',
      },
    ];

    renderWithLocale(<CareerPitch experiences={sameYear} />);
    expect(screen.getByRole('button', { name: /chapter 1.*Novomind/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /chapter 2.*Otto/i })).toBeInTheDocument();
  });

  it('walks the chapters in order when the play is run, and stops when paused', () => {
    jest.useFakeTimers();
    try {
      renderWithLocale(<CareerPitch experiences={experiences} />);

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
    const { container } = renderWithLocale(<CareerPitch experiences={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  describe('the travelling ball (US1)', () => {
    afterEach(() => {
      (prefersReducedMotion as jest.Mock).mockReturnValue(false);
    });

    it('renders exactly one ball marker, at mount and after selecting a different chapter', () => {
      renderWithLocale(<CareerPitch experiences={experiences} />);
      expect(screen.getAllByTestId('pitch-ball')).toHaveLength(1);

      fireEvent.click(screen.getByRole('button', { name: /pass to.*Novomind/i }));
      expect(screen.getAllByTestId('pitch-ball')).toHaveLength(1);
    });

    it('is decorative — no role, no aria-label, ignored by pointer events', () => {
      renderWithLocale(<CareerPitch experiences={experiences} />);
      const ball = screen.getByTestId('pitch-ball');
      expect(ball).not.toHaveAttribute('role');
      expect(ball).not.toHaveAttribute('aria-label');
      expect(ball).toHaveClass('pointer-events-none');
    });

    it('switches the active chapter synchronously on click, without waiting on the ball animation', () => {
      jest.useFakeTimers();
      try {
        renderWithLocale(<CareerPitch experiences={experiences} />);
        fireEvent.click(screen.getByRole('button', { name: /pass to.*Novomind/i }));
        // No timer advance at all — if the panel only updated once the ball
        // settled, this heading would not be here yet.
        expect(screen.getByRole('heading', { name: 'Novomind AG' })).toBeInTheDocument();
      } finally {
        jest.useRealTimers();
      }
    });

    it('collapses the ball travel to a zero-duration transition under prefers-reduced-motion', () => {
      (prefersReducedMotion as jest.Mock).mockReturnValue(true);
      renderWithLocale(<CareerPitch experiences={experiences} />);

      fireEvent.click(screen.getByRole('button', { name: /pass to.*Novomind/i }));

      const ball = screen.getByTestId('pitch-ball');
      expect(ball).toHaveAttribute('data-transition-duration', '0');
    });

    it('keeps every player keyboard-operable and labelled after the focus rework', () => {
      renderWithLocale(<CareerPitch experiences={experiences} />);
      const player = screen.getByRole('button', { name: /pass to.*Novomind/i });

      expect(player).toHaveAttribute('tabindex', '0');
      expect(player).toHaveAttribute('aria-label', expect.stringContaining('Novomind'));

      fireEvent.keyDown(player, { key: 'Enter' });
      expect(screen.getByRole('heading', { name: 'Novomind AG' })).toBeInTheDocument();

      const otto = screen.getByRole('button', { name: /pass to.*Otto/i });
      fireEvent.keyDown(otto, { key: ' ' });
      expect(screen.getByRole('heading', { name: 'Otto GmbH & Co KG' })).toBeInTheDocument();
    });
  });

  describe('naming every player on the field (US2)', () => {
    it('shows every player\'s number, abbreviation, and shortened display name without any interaction', () => {
      renderWithLocale(<CareerPitch experiences={experiences} />);

      // Novomind AG -> displayName "Novomind", abbreviation "NOVO".
      expect(screen.getByText('NOVO')).toBeInTheDocument();
      expect(screen.getByText('Novomind')).toBeInTheDocument();
      // Otto GmbH & Co KG -> displayName "Otto", abbreviation "OTTO".
      expect(screen.getByText('OTTO')).toBeInTheDocument();
      expect(screen.getByText('Otto')).toBeInTheDocument();
      // Immowelt GmbH -> displayName "Immowelt", abbreviation "IMMO".
      expect(screen.getByText('IMMO')).toBeInTheDocument();
      expect(screen.getByText('Immowelt')).toBeInTheDocument();
    });

    it('labels the field with the shortened displayName while the pill list and panel keep the full company name', () => {
      renderWithLocale(<CareerPitch experiences={experiences} />);

      // Full name still appears exactly once — in the pill list / panel
      // heading — never as the on-pitch label, which uses the short form.
      expect(screen.getByText('Otto GmbH & Co KG')).toBeInTheDocument();
      expect(screen.queryByText('Otto GmbH & Co KG', { selector: 'text' })).not.toBeInTheDocument();
    });

    it('keeps the on-pitch number, abbreviation, and name labels out of pointer events and out of the tab order', () => {
      const { container } = renderWithLocale(<CareerPitch experiences={experiences} />);
      const labelTexts = container.querySelectorAll('svg text');
      labelTexts.forEach((label) => {
        expect(label).toHaveClass('pointer-events-none');
        expect(label).not.toHaveAttribute('tabindex');
      });
    });
  });

  describe('the how-to-use tip (US4)', () => {
    it('shows a single tip line below the pitch, without any interaction, mentioning players are clickable', () => {
      renderWithLocale(<CareerPitch experiences={experiences} />);
      expect(screen.getByText(/players.*click/i)).toBeInTheDocument();
    });
  });
});
