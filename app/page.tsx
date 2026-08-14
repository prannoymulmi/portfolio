import type { Metadata } from 'next';
import { Hero } from '@/components/Hero/Hero';
import { ThreeSystems } from '@/components/Work/ThreeSystems';
import { ChapterGradientOverlay } from '@/components/Common/ChapterGradientOverlay';
import { PrincipleBand } from '@/components/EngineeringPrinciple/PrincipleBand';
import { CareerJourneyLazy } from '@/components/Career/CareerJourneyLazy';
import { EducationSection } from '@/components/Education/EducationSection';
import { ProjectGalleryLazy } from '@/components/Projects/ProjectGalleryLazy';
import { PlaybookGrid } from '@/components/Playbook/PlaybookGrid';
import { ContactSection } from '@/components/Contact/ContactSection';

export const metadata: Metadata = {
  title: 'Prannoy Mulmi | Senior Software Engineer',
  // Professional register, deliberately distinct from the hero's casual
  // phrasing — this is what search results and link previews show.
  description:
    'Senior software engineer and cloud architect, with a focus on AI and security. Background, skills, career journey, education, projects, and how to get in touch.',
  openGraph: {
    title: 'Prannoy Mulmi | Senior Software Engineer',
    description: 'Senior software engineer and cloud architect, with a focus on AI and security.',
    type: 'website',
    url: 'https://portfolio.prannoy-mulmi.com',
  },
};

export default function Home() {
  return (
    <>
      <section id="hero" aria-label="Introduction">
        <Hero />
      </section>

      {/* id stays "skills" though the chapter no longer is: the footer, the
          progress nav and any external link all point at /#skills, and
          renaming the anchor would break them for a cosmetic gain. */}
      <section
        id="skills"
        aria-label="Selected work"
        className="chapter-scrim relative isolate px-4 py-16 sm:px-6 lg:px-8"
      >
        {/* Full-bleed, so the wash has no left/right edge to read as a panel. */}
        <ChapterGradientOverlay
          src="/images/mesh-soft.png"
          opacityClassName="opacity-25 dark:opacity-0"
        />
        <div className="relative mx-auto max-w-6xl">
          <ThreeSystems />
        </div>
      </section>

      <section
        id="career"
        aria-label="Career Journey"
        className="chapter-scrim relative isolate px-4 py-16 sm:px-6 lg:px-8"
      >
        <ChapterGradientOverlay
          src="/images/mesh-soft.png"
          opacityClassName="opacity-25 dark:opacity-0"
        />
        <div className="relative mx-auto max-w-6xl">
          <CareerJourneyLazy />
        </div>
      </section>

      {/* Deliberately absent from STORY_SECTIONS in StoryProgressNav: this is
          a held statement between chapters, not a chapter. Listing it would
          promise a section with contents to navigate. */}
      <PrincipleBand />

      <section
        id="education"
        aria-label="Education"
        className="chapter-scrim px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <EducationSection />
        </div>
      </section>

      <section
        id="projects"
        aria-label="Projects"
        className="chapter-scrim px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <ProjectGalleryLazy />
        </div>
      </section>

      <section
        id="playbook"
        aria-label="Technical Playbook"
        className="chapter-scrim px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <PlaybookGrid />
        </div>
      </section>

      {/* overflow-x-clip: ContactSection's decorative glow is a fixed
          w-[40rem] wash centred on this section, wider than the viewport at
          phone widths, so it overhangs both edges — the right overhang was
          the page's horizontal scrollbar (specs/012-mobile-layout-fixes).
          `clip`, not `hidden`: hidden on one axis forces the other to `auto`,
          turning this section into a scroll container that can trap the
          document's sticky nav (FR-004). Applied to this full-width section,
          not the inner max-w-4xl column, so only the part already off screen
          is clipped — clipping the column would cut the blurred glow at its
          edge and leave a hard line. */}
      <section
        id="contact"
        aria-label="Contact"
        className="chapter-scrim overflow-x-clip px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <ContactSection />
        </div>
      </section>
    </>
  );
}
