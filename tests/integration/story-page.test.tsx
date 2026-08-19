import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '@/app/page';
import { ContentProvider } from '@/components/Common/ContentProvider';
import { LocaleProvider } from '@/components/Common/LocaleProvider';

describe('Story page (/)', () => {
  const renderStory = () =>
    render(
      <LocaleProvider>
        <ContentProvider>
          <Home />
        </ContentProvider>
      </LocaleProvider>,
    );

  it('renders all 7 story sections in narrative order', () => {
    const { container } = renderStory();
    const sectionIds = Array.from(container.querySelectorAll('section[id]')).map(
      (section) => section.id,
    );

    expect(sectionIds).toEqual([
      'hero',
      'skills',
      'career',
      'technologies',
      'education',
      'projects',
      'contact',
    ]);
  });

  it('renders no persistent navigation bar', () => {
    renderStory();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  // FR-008 (research R-008): the Technologies chapter must not read as the
  // page's most visually dominant chapter.
  describe('the Technologies chapter (specs/017-tech-stack-showcase)', () => {
    it('sits between the principle band and the education chapter', () => {
      const { container } = renderStory();
      const sectionIds = Array.from(container.querySelectorAll('section[id]')).map(
        (section) => section.id,
      );

      const techIndex = sectionIds.indexOf('technologies');
      const educationIndex = sectionIds.indexOf('education');
      const careerIndex = sectionIds.indexOf('career');

      expect(techIndex).toBeGreaterThan(careerIndex);
      expect(techIndex).toBeLessThan(educationIndex);
    });

    it('carries no ChapterGradientOverlay', () => {
      const { container } = renderStory();
      const section = container.querySelector('section#technologies');

      expect(section).not.toBeNull();
      // ChapterGradientOverlay always renders a next/image with alt="" as a
      // marker of the decorative wash (research R-008 rule 2).
      expect(section!.querySelector('img')).toBeNull();
    });

    it("uses the same heading scale as ThreeSystems' heading (FR-008)", async () => {
      renderStory();

      const threeSystemsHeading = await screen.findByRole('heading', {
        name: /three systems i.d happily defend in a design review/i,
      });
      const technologiesHeading = await screen.findByRole('heading', { level: 2, name: /technolog|built with/i });

      // Both must carry exactly the scale classes the constitution reserves
      // for chapter headings — never larger than ThreeSystems'.
      expect(threeSystemsHeading.className).toMatch(/text-3xl/);
      expect(threeSystemsHeading.className).toMatch(/sm:text-4xl/);
      expect(technologiesHeading.className).toMatch(/text-3xl/);
      expect(technologiesHeading.className).toMatch(/sm:text-4xl/);
    });
  });
});
