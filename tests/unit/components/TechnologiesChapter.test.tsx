import type { ReactElement } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { Experience, TechnologiesFile } from '@/lib/types/portfolio';

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react');
  // Strips the motion-only props (jsdom has no viewport/animation loop, and
  // React warns on unknown DOM attributes) rather than spreading them onto
  // the plain element — same pattern as CareerPitch.test.tsx / PrincipleBand.test.tsx.
  const passthrough =
    (Tag: string) =>
    ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      whileInView: _whileInView,
      viewport: _viewport,
      variants: _variants,
      transition: _transition,
      ...rest
    }: Record<string, unknown>) =>
      React.createElement(Tag, rest, children);
  return {
    motion: {
      div: passthrough('div'),
      button: passthrough('button'),
      section: passthrough('section'),
      ul: passthrough('ul'),
      li: passthrough('li'),
      p: passthrough('p'),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    // TechnologyList latches this into state via an effect; reporting
    // already-in-view keeps rows rendered at their final, visible props in
    // these tests rather than exercising the animation timeline itself.
    useInView: () => true,
  };
});

const mockTechnologies: { data: TechnologiesFile | null; loading: boolean; error: Error | null } = {
  loading: false,
  error: null,
  data: null,
};

const mockExperiences: {
  data: { experiences: Experience[] } | null;
  loading: boolean;
  error: Error | null;
} = {
  loading: false,
  error: null,
  data: null,
};

jest.mock('@/components/Common/ContentProvider', () => ({
  useContent: () => ({ technologies: mockTechnologies, experiences: mockExperiences }),
}));

import { TechnologiesChapter } from '@/components/Technologies/TechnologiesChapter';
import { LocaleProvider } from '@/components/Common/LocaleProvider';

function renderWithLocale(ui: ReactElement) {
  return render(<LocaleProvider>{ui}</LocaleProvider>);
}

const experiences: Experience[] = [
  {
    title: 'Senior Software Engineer',
    subtitle: 'AVIV GmbH',
    workType: 'Full-time',
    workDescription: ['Built authentication services.'],
    technologies: ['AWS', 'TypeScript'],
    dateText: '11/2020 – 03/2026',
  },
  {
    title: 'Junior Backend Developer',
    subtitle: 'Otto GmbH & Co KG',
    workType: 'Full-time',
    workDescription: ['Migrated services onto AWS.'],
    technologies: ['AWS', 'Java'],
    dateText: '08/2018 – 10/2020',
  },
];

const technologiesFile: TechnologiesFile = {
  intro: 'Every technology below is tied to a real role and date range from the career history.',
  builtWithNote:
    'This site itself was designed and built with Claude Code, using spec-driven development.',
  categories: ['Cloud & Infrastructure', 'Languages'],
  technologies: [
    {
      name: 'AWS',
      category: 'Cloud & Infrastructure',
      matches: ['AWS'],
      note: 'Architected cloud infrastructure across two roles, from junior backend to senior IAM work.',
    },
    {
      name: 'TypeScript',
      category: 'Languages',
      matches: ['TypeScript'],
      note: 'Primary language for authentication services in the most recent senior engineering role.',
    },
    {
      name: 'Java',
      category: 'Languages',
      matches: ['Java'],
      note: 'Core backend language used as a junior backend developer building AWS microservices.',
    },
  ],
};

function setContent({
  techLoading = false,
  techError = null,
  techData = technologiesFile,
  expLoading = false,
  expError = null,
  expData = { experiences },
}: {
  techLoading?: boolean;
  techError?: Error | null;
  techData?: TechnologiesFile | null;
  expLoading?: boolean;
  expError?: Error | null;
  expData?: { experiences: Experience[] } | null;
} = {}) {
  mockTechnologies.loading = techLoading;
  mockTechnologies.error = techError;
  mockTechnologies.data = techData;
  mockExperiences.loading = expLoading;
  mockExperiences.error = expError;
  mockExperiences.data = expData;
}

describe('TechnologiesChapter', () => {
  beforeEach(() => setContent());

  it('renders every technology with its category and a duration', () => {
    renderWithLocale(<TechnologiesChapter />);

    const list = screen.getByRole('list', { name: /technolog/i });
    expect(within(list).getByText('AWS')).toBeInTheDocument();
    expect(within(list).getByText('TypeScript')).toBeInTheDocument();
    expect(within(list).getByText('Java')).toBeInTheDocument();

    // AWS spans 08/2018 - present-of-03/2026, i.e. > 1 year, so it must show
    // a real duration string rather than nothing.
    expect(list.textContent).toMatch(/yrs?/);
  });

  it('narrows the list to one category on click, and "All" restores it', () => {
    renderWithLocale(<TechnologiesChapter />);

    fireEvent.click(screen.getByRole('button', { name: 'Languages' }));
    expect(screen.queryByRole('button', { name: /^AWS/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^TypeScript/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Java/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByRole('button', { name: /^AWS/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^TypeScript/ })).toBeInTheDocument();
  });

  it('updates the detail panel on mouseEnter', () => {
    renderWithLocale(<TechnologiesChapter />);
    fireEvent.mouseEnter(screen.getByRole('button', { name: /^TypeScript/ }));
    expect(
      screen.getByRole('heading', { name: 'TypeScript', level: 3 }),
    ).toBeInTheDocument();
  });

  it('updates the detail panel on focus', () => {
    renderWithLocale(<TechnologiesChapter />);
    fireEvent.focus(screen.getByRole('button', { name: /^Java/ }));
    expect(screen.getByRole('heading', { name: 'Java', level: 3 })).toBeInTheDocument();
  });

  it('updates the detail panel on click (touch parity)', () => {
    renderWithLocale(<TechnologiesChapter />);
    fireEvent.click(screen.getByRole('button', { name: /^AWS/ }));
    expect(screen.getByRole('heading', { name: 'AWS', level: 3 })).toBeInTheDocument();
  });

  it('still renders correctly when a filter yields a single entry', () => {
    setContent({
      techData: {
        ...technologiesFile,
        categories: ['Cloud & Infrastructure', 'Languages'],
        technologies: [technologiesFile.technologies[0], technologiesFile.technologies[1]],
      },
    });
    renderWithLocale(<TechnologiesChapter />);
    fireEvent.click(screen.getByRole('button', { name: 'Cloud & Infrastructure' }));
    expect(screen.getByRole('button', { name: /^AWS/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^TypeScript/ })).not.toBeInTheDocument();
  });

  it('moves the active technology to the first visible row when the current one is filtered out', () => {
    renderWithLocale(<TechnologiesChapter />);

    fireEvent.click(screen.getByRole('button', { name: /^AWS/ }));
    expect(screen.getByRole('heading', { name: 'AWS', level: 3 })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Languages' }));
    // AWS is no longer visible, so the panel must show a technology that is.
    expect(screen.queryByRole('heading', { name: 'AWS', level: 3 })).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3 }),
    ).toHaveTextContent(/TypeScript|Java/);
  });

  it('renders the loading skeleton while either source is loading', () => {
    setContent({ techLoading: true, techData: null });
    const { container } = renderWithLocale(<TechnologiesChapter />);
    expect(screen.queryByText('AWS')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-shimmer')).not.toBeNull();
  });

  it('renders a failure line when technologies.json fails to load', () => {
    setContent({ techError: new Error('boom'), techData: null });
    renderWithLocale(<TechnologiesChapter />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  it('renders a failure line when experiences.json fails to load', () => {
    setContent({ expError: new Error('boom'), expData: null });
    renderWithLocale(<TechnologiesChapter />);
    expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
  });

  describe('the Claude Code / spec-driven sentence (FR-005)', () => {
    it('appears exactly once', () => {
      renderWithLocale(<TechnologiesChapter />);
      const matches = screen.getAllByText(/claude code/i);
      expect(matches).toHaveLength(1);
    });

    it('carries no heading-level element or emphasis wrapper — ordinary body copy', () => {
      renderWithLocale(<TechnologiesChapter />);
      const [sentence] = screen.getAllByText(/claude code/i);

      expect(sentence.tagName.toLowerCase()).toBe('p');
      expect(sentence.closest('h1, h2, h3, h4, h5, h6')).toBeNull();
      expect(sentence.querySelector('strong, em, b, mark')).toBeNull();
    });

    // ADR 0027: builtWithNote is optional per locale — German dropped it,
    // English kept it. Renders nothing (not an empty paragraph) when absent,
    // the same shape ContactSection's contactNote already has.
    it('renders no paragraph at all when builtWithNote is absent (ADR 0027)', () => {
      const { builtWithNote: _builtWithNote, ...withoutNote } = technologiesFile;
      setContent({ techData: withoutNote });
      renderWithLocale(<TechnologiesChapter />);

      expect(screen.queryByText(/claude code/i)).not.toBeInTheDocument();
      // The intro paragraph still renders — only the credit line is gone.
      expect(screen.getByText(technologiesFile.intro)).toBeInTheDocument();
    });
  });

  describe('role traceability (User Story 3)', () => {
    it('lists the contributing roles in the detail panel', () => {
      renderWithLocale(<TechnologiesChapter />);
      fireEvent.click(screen.getByRole('button', { name: /^AWS/ }));

      expect(screen.getByText('Senior Software Engineer')).toBeInTheDocument();
      expect(screen.getByText(/AVIV GmbH/)).toBeInTheDocument();
      expect(screen.getByText('Junior Backend Developer')).toBeInTheDocument();
      expect(screen.getByText(/Otto GmbH & Co KG/)).toBeInTheDocument();
    });

    it('omits a technology entirely when every matched role has an unparseable date', () => {
      setContent({
        expData: {
          experiences: [
            {
              title: 'Senior Software Engineer',
              subtitle: 'AVIV GmbH',
              workType: 'Full-time',
              workDescription: ['Built authentication services.'],
              technologies: ['AWS', 'TypeScript'],
              dateText: 'not a real date range',
            },
            {
              title: 'Junior Backend Developer',
              subtitle: 'Otto GmbH & Co KG',
              workType: 'Full-time',
              workDescription: ['Migrated services onto AWS.'],
              technologies: ['AWS', 'Java'],
              dateText: 'also not a date',
            },
          ],
        },
      });
      renderWithLocale(<TechnologiesChapter />);

      // Untraceable, not just unlabelled: AWS must not appear anywhere in
      // the chapter at all — not in the list, not selectable, not in the
      // panel (spec Edge Cases, tightened: an untraceable technology is
      // omitted outright rather than shown without a duration).
      expect(screen.queryByRole('button', { name: /^AWS/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'AWS', level: 3 })).not.toBeInTheDocument();
    });
  });

  describe('sub-year technologies are omitted (tightened Edge Case)', () => {
    it('never renders a technology whose real usage is under a year', () => {
      setContent({
        techData: {
          ...technologiesFile,
          technologies: [
            ...technologiesFile.technologies,
            {
              name: 'Cordova',
              category: 'Languages',
              matches: ['Cordova'],
              note: 'Briefly wrapped one web app for a mobile release during a short-lived role.',
            },
          ],
        },
        expData: {
          experiences: [
            ...experiences,
            {
              title: 'Contractor',
              subtitle: 'Short Gig Ltd',
              workType: 'Contract',
              workDescription: ['A brief mobile-wrapping engagement.'],
              technologies: ['Cordova'],
              // Six months — real, dated, but under the one-year floor.
              dateText: '01/2019 – 06/2019',
            },
          ],
        },
      });
      renderWithLocale(<TechnologiesChapter />);

      expect(screen.queryByRole('button', { name: /^Cordova/ })).not.toBeInTheDocument();
      expect(screen.queryByText('Cordova')).not.toBeInTheDocument();
      // The durable technologies are unaffected by the sub-year one being
      // dropped.
      const list = screen.getByRole('list', { name: /technolog/i });
      expect(within(list).getByText('AWS')).toBeInTheDocument();
    });

    it('offers no filter pill for a category left with nothing to show', () => {
      setContent({
        techData: {
          ...technologiesFile,
          categories: ['Cloud & Infrastructure', 'Languages', 'Mobile'],
          technologies: [
            ...technologiesFile.technologies,
            {
              name: 'Cordova',
              category: 'Mobile',
              matches: ['Cordova'],
              note: 'Briefly wrapped one web app for a mobile release during a short-lived role.',
            },
          ],
        },
        expData: {
          experiences: [
            ...experiences,
            {
              title: 'Contractor',
              subtitle: 'Short Gig Ltd',
              workType: 'Contract',
              workDescription: ['A brief mobile-wrapping engagement.'],
              technologies: ['Cordova'],
              dateText: '01/2019 – 06/2019',
            },
          ],
        },
      });
      renderWithLocale(<TechnologiesChapter />);

      // "Mobile" only ever had the sub-year Cordova entry, so once that is
      // omitted the category has nothing left — its filter pill must not
      // be offered as a dead end.
      expect(screen.queryByRole('button', { name: 'Mobile' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cloud & Infrastructure' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Languages' })).toBeInTheDocument();
    });
  });
});
