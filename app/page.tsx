import type { Metadata } from 'next';
import { Hero } from '@/components/Hero/Hero';
import { AboutSection } from '@/components/About/AboutSection';
import { SkillsFormation } from '@/components/Skills/SkillsFormation';
import { CareerJourneyLazy } from '@/components/Career/CareerJourneyLazy';
import { EducationSection } from '@/components/Education/EducationSection';
import { ProjectGalleryLazy } from '@/components/Projects/ProjectGalleryLazy';
import { PlaybookGrid } from '@/components/Playbook/PlaybookGrid';
import { ContactSection } from '@/components/Contact/ContactSection';

export const metadata: Metadata = {
  title: 'Prannoy Mulmi | Senior Software Engineer',
  description:
    'Senior software engineer portfolio: background, skills, career journey, education, projects, technical playbook, and how to get in touch — 10+ years building scalable cloud systems.',
  openGraph: {
    title: 'Prannoy Mulmi | Senior Software Engineer',
    description:
      'Senior software engineer portfolio: background, skills, career journey, education, projects, technical playbook, and how to get in touch.',
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
        id="about"
        aria-label="About"
        className="bg-gradient-to-br from-white via-blue-50 to-white px-4 py-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <AboutSection />
        </div>
      </section>

      <section
        id="skills"
        aria-label="Skills"
        className="bg-gradient-to-br from-white via-blue-50 to-white px-4 py-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <SkillsFormation />
        </div>
      </section>

      <section
        id="career"
        aria-label="Career Journey"
        className="bg-gradient-to-br from-white via-blue-50 to-white px-4 py-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <CareerJourneyLazy />
        </div>
      </section>

      <section
        id="education"
        aria-label="Education"
        className="bg-gradient-to-br from-white via-blue-50 to-white px-4 py-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <EducationSection />
        </div>
      </section>

      <section
        id="projects"
        aria-label="Projects"
        className="bg-gradient-to-br from-white via-blue-50 to-white px-4 py-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <ProjectGalleryLazy />
        </div>
      </section>

      <section
        id="playbook"
        aria-label="Technical Playbook"
        className="bg-gradient-to-br from-white via-blue-50 to-white px-4 py-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <PlaybookGrid />
        </div>
      </section>

      <section
        id="contact"
        aria-label="Contact"
        className="bg-gradient-to-br from-white via-blue-50 to-white px-4 py-16 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-4xl">
          <ContactSection />
        </div>
      </section>
    </>
  );
}
