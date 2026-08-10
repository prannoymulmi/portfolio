'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

// The story has no page-to-page nav bar, but visitors still need a way to
// jump between chapters (and keyboard/screen-reader users need a way to
// skip ahead) without scrolling through everything. This renders a thin
// scroll-progress bar plus a compact set of anchor links to every section.
const STORY_SECTIONS = [
  { id: 'hero', label: 'Introduction' },
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'career', label: 'Career Journey' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'playbook', label: 'Technical Playbook' },
  { id: 'contact', label: 'Contact' },
];

export function StoryProgressNav() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 300, damping: 40, restDelta: 0.001 });

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur dark:bg-gray-900/80">
      <motion.div
        className="h-1 origin-left bg-blue-600 dark:bg-blue-400"
        style={{ scaleX }}
        aria-hidden="true"
      />
      <nav aria-label="Story sections" className="overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        <ul className="flex w-max gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
          {STORY_SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="whitespace-nowrap hover:text-blue-600 dark:hover:text-blue-400"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
