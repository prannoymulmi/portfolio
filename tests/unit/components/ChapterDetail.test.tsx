import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import type { CareerChapter } from '@/components/Career/chapters';
import { DEFAULT_TECH } from '@/components/Career/chapters';
import { ChapterDetail } from '@/components/Career/ChapterDetail';

const baseChapter: CareerChapter = {
  id: 'aviv',
  order: 5,
  company: 'AViV GmbH (Formerly Immowelt GmbH) ',
  displayName: 'AViV',
  abbreviation: 'AVIV',
  role: 'Senior Software Engineer',
  years: '11/2020 – 03/2025',
  builtSummary: 'Effectively coded software changes and alterations based on specific design specifications.',
  achievements: [
    'Collaborated to create strategic initiatives to design, code, and test solutions.',
    'Architecture of Cloud based solutions in Amazon Web Services using different IaC tools.',
    'Contributed in reducing to 10% AWS costs using different metrics.',
    'Migrated on premises servers and database into AWS.',
    'Implemented and deployed different micro services using AWS services.',
  ],
  tech: ['AWS', 'Terraform', 'PostgreSQL'],
  position: 'Striker',
  x: 84,
  y: 46,
};

describe('ChapterDetail', () => {
  it('renders a "What I built" summary, an achievements list, and a technologies list', () => {
    render(<ChapterDetail chapter={baseChapter} />);

    expect(screen.getByText('What I built')).toBeInTheDocument();
    expect(screen.getByText(baseChapter.builtSummary)).toBeInTheDocument();
    baseChapter.achievements.forEach((achievement) => {
      expect(screen.getByText(achievement)).toBeInTheDocument();
    });
    baseChapter.tech.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('accounts for every work-description line exactly once, none duplicated or missing', () => {
    render(<ChapterDetail chapter={baseChapter} />);

    // builtSummary + achievements together reconstruct the original six-line
    // workDescription for AViV — nothing truncated, nothing shown twice.
    const allLines = [baseChapter.builtSummary, ...baseChapter.achievements];
    expect(allLines).toHaveLength(6);
    allLines.forEach((line) => {
      expect(screen.getAllByText(line)).toHaveLength(1);
    });
  });

  it('shows the default fallback tags when the chapter records no technologies', () => {
    render(<ChapterDetail chapter={{ ...baseChapter, tech: [] }} />);

    DEFAULT_TECH.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('shows the full company name in the heading, not the shortened on-pitch display name', () => {
    render(<ChapterDetail chapter={baseChapter} />);

    expect(
      screen.getByRole('heading', { name: /^AViV GmbH \(Formerly Immowelt GmbH\)/ }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'AViV' })).not.toBeInTheDocument();
  });
});
