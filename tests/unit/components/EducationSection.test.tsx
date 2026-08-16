import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EducationSection } from '@/components/Education/EducationSection';
import { ContentProvider } from '@/components/Common/ContentProvider';

describe('EducationSection', () => {
  const renderSection = () =>
    render(
      <ContentProvider>
        <EducationSection />
      </ContentProvider>,
    );

  it('renders the Distinction classification as a badge, not plain paragraph text', async () => {
    renderSection();
    const badge = await screen.findByText('Distinction');
    expect(badge.tagName).toBe('SPAN');
    expect(badge.className).not.toContain('leading-relaxed');
  });

  it('renders the numeric HAW Hamburg grade as its English label, not the raw number', async () => {
    renderSection();
    const badge = await screen.findByText('Good');
    expect(badge.tagName).toBe('SPAN');
    expect(screen.queryByText('1.9')).not.toBeInTheDocument();
    expect(screen.queryByText('1.9 Grade')).not.toBeInTheDocument();
  });

  it('renders no badge for the two AWS certifications, which have no cardDetailedText', async () => {
    renderSection();
    await screen.findByText('Distinction');

    const headings = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent);
    expect(headings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('AWS Certified Solutions Architect – Professional'),
        expect.stringContaining('AWS Certified Solutions Architect – Associate'),
      ]),
    );

    // Only the two graded entries produce a badge span.
    const badges = document.querySelectorAll('span.rounded-full');
    expect(badges).toHaveLength(2);
  });
});
