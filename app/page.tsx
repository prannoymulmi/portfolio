import type { Metadata } from 'next';
import { Hero } from '@/components/Hero/Hero';
import { SkillsFormation } from '@/components/Skills/SkillsFormation';
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

      <section
        id="skills"
        aria-label="Skills"
        className="chapter-scrim px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <SkillsFormation />
        </div>
      </section>

      <section
        id="career"
        aria-label="Career Journey"
        className="chapter-scrim px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <CareerJourneyLazy />
        </div>
      </section>

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

      <section
        id="contact"
        aria-label="Contact"
        className="chapter-scrim px-4 py-16 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <ContactSection />
        </div>
      </section>
    </>
  );
}
