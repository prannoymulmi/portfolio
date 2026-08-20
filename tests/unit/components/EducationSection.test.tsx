import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EducationSection } from '@/components/Education/EducationSection';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { LocaleProvider } from '@/components/Common/LocaleProvider';

describe('EducationSection', () => {
  // Tests that set the locale write to real localStorage (LocaleProvider
  // reads it on mount) and nothing else in this file resets it — without
  // this, a German test running before an English-assuming one would leak
  // the locale forward and break it.
  afterEach(() => {
    window.localStorage.clear();
  });

  const renderSection = () =>
    render(
      <LocaleProvider>
        <ContentProvider>
          <EducationSection />
        </ContentProvider>
      </LocaleProvider>,
    );

  it('renders the Distinction classification as a badge, not plain paragraph text', async () => {
    renderSection();
    const badge = await screen.findByText('Distinction');
    expect(badge.tagName).toBe('SPAN');
    expect(badge.className).not.toContain('leading-relaxed');
  });

  it('renders the numeric HAW Hamburg grade as its English label with the raw grade alongside it', async () => {
    renderSection();
    const badge = await screen.findByText('Good (1.9)');
    expect(badge.tagName).toBe('SPAN');
    // The raw number is present, but only inside the translated label —
    // never on its own, and never with the source content's own "Grade"
    // suffix still attached.
    expect(screen.queryByText('1.9')).not.toBeInTheDocument();
    expect(screen.queryByText('1.9 Grade')).not.toBeInTheDocument();
  });

  it('renders the same grade in German with a comma decimal, not the English period', async () => {
    window.localStorage.setItem('locale', 'de');
    renderSection();
    const badge = await screen.findByText('Gut (1,9)');
    expect(badge.tagName).toBe('SPAN');
    expect(screen.queryByText('Good (1.9)')).not.toBeInTheDocument();
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

  // education.json's `icon` field (as opposed to `media`, which only the two
  // AWS certifications carry) had no renderer at all until this test was
  // written — University of Essex's and HAW Hamburg's own logos were in the
  // content but never appeared on the page in either locale.
  it("renders each institution's own logo from its icon field, not a shared placeholder", async () => {
    renderSection();
    await screen.findByText('Distinction');

    const essexLogo = screen.getByAltText('University of Essex logo');
    const hawLogo = screen.getByAltText('HAW Hamburg logo');
    expect(essexLogo).toHaveAttribute('src', expect.stringContaining('essex.png'));
    expect(hawLogo).toHaveAttribute('src', expect.stringContaining('haw.png'));
  });

  it('renders both logos in German too, with the German-dictionary alt text', async () => {
    window.localStorage.setItem('locale', 'de');
    renderSection();
    await screen.findByText('„Distinction“');

    const essexLogo = screen.getByAltText('University of Essex-Logo');
    const hawLogo = screen.getByAltText('HAW Hamburg-Logo');
    expect(essexLogo).toHaveAttribute('src', expect.stringContaining('essex.png'));
    expect(hawLogo).toHaveAttribute('src', expect.stringContaining('haw.png'));
  });
});
