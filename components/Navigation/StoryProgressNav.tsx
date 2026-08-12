'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils/animations';
import { ThemeToggle } from '@/components/Common/ThemeToggle';
import { useContent } from '@/components/Common/ContentProvider';
import { EmailLink } from './EmailLink';
import { SocialIcons } from './SocialIcons';

// The story has no page-to-page nav bar, but visitors still need a way to
// jump between chapters (and keyboard/screen-reader users need a way to
// skip ahead) without scrolling through everything. This renders a thin
// scroll-progress bar plus a compact set of anchor links to every section.
const STORY_SECTIONS = [
  { id: 'hero', label: 'Introduction' },
  { id: 'skills', label: 'Skills' },
  { id: 'career', label: 'Career Journey' },
  { id: 'education', label: 'Education' },
  { id: 'projects', label: 'Projects' },
  { id: 'playbook', label: 'Technical Playbook' },
  { id: 'contact', label: 'Contact' },
];

export function StoryProgressNav() {
  const { home, social } = useContent();
  const { scrollYProgress } = useScroll();
  const springScaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 40,
    restDelta: 0.001,
  });

  // Respect prefers-reduced-motion: skip the spring's smoothing/overshoot
  // and just track scroll position directly, with no added motion. Read
  // once via lazy initializer (`window` isn't available during SSR).
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && prefersReducedMotion());
  const scaleX = reducedMotion ? scrollYProgress : springScaleX;

  // Falls back to the wordmark alone if content has not landed, so the bar
  // never renders a heading with nothing in it.
  const name = home.data?.name ?? '';

  // The edge fade marks chapters scrolled out of sight, so it may only appear
  // when there are some. Right-aligning the list put the last chapter flush
  // against the fade at widths where everything already fitted, leaving
  // "Contact" permanently half-faded on a desktop. No CSS selector can ask
  // whether an element overflows, so it is measured.
  const chapters = useRef<HTMLElement>(null);
  const [chaptersOverflow, setChaptersOverflow] = useState(false);

  useEffect(() => {
    const element = chapters.current;
    if (!element) return;

    const measure = () => setChaptersOverflow(element.scrollWidth > element.clientWidth + 1);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    // Floating rather than flush: inset from all three edges so the bar reads
    // as an object over the photograph instead of a browser chrome strip.
    // overflow-hidden clips the progress hairline to the rounded ends.
    <div className="sticky top-3 z-40 mx-3 overflow-hidden rounded-full bg-white/80 shadow-lg ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/80 dark:ring-white/10 sm:mx-6">
      <div className="flex items-center gap-3 py-2 pl-5 pr-3">
        {/* The page's only h1, and the site's wordmark. It sits here rather
            than in the opening because the name belongs to the whole story,
            not to its first chapter — and the nav renders ahead of <main>, so
            it is still the document's first heading.

            "PM" is the mark and is hidden from assistive tech; the full name
            carries the accessible name at every width. Below sm the name is
            visually hidden rather than removed, so the heading never announces
            as just two letters on a phone. */}
        <h1 className="shrink-0 text-sm">
          <a
            href="#hero"
            className="flex items-center gap-3 rounded text-[#111c38] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-100"
          >
            {/* Hidden from assistive tech only once the name is there to
                announce instead. Content loads client-side, so hiding it
                unconditionally would leave the document's only heading with no
                accessible name at all for the first frames. */}
            <span aria-hidden={name ? 'true' : undefined} className="font-bold tracking-tight">
              PM
            </span>
            <span aria-hidden="true" className="h-4 w-px shrink-0 bg-current opacity-25" />
            <span className="sr-only whitespace-nowrap font-medium sm:not-sr-only">{name}</span>
          </a>
        </h1>

        {/* At 375px the labels and controls together run roughly 2.2x the
            available width, so the chapters scroll inside the bar while the
            controls stay pinned. The right-edge mask makes that overflow read
            as intentional rather than as a clipped word.

            The mask is dropped entirely while anything inside has focus. A
            mask fades by position and cannot be told to spare one child, so a
            keyboard user would otherwise land on a focus ring drawn underneath
            the fade. The cue is decorative, so losing it during keyboard
            traversal costs nothing. */}
        <nav
          ref={chapters}
          aria-label="Story sections"
          className={`min-w-0 flex-1 overflow-x-auto ${
            chaptersOverflow ? 'mask-r-from-85% mask-r-to-100% focus-within:mask-none' : ''
          }`}
        >
          {/* ml-auto rather than justify-end: the list is w-max inside a
              scrolling block, so an auto margin right-aligns it when there is
              room and collapses to nothing when there is not, leaving the
              scroll to start at the first chapter. */}
          <ul className="ml-auto flex w-max gap-4 text-sm font-medium text-[#111c38] dark:text-gray-200">
            {STORY_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  // Chrome will not scroll a *partially* visible focused child
                  // into view — measured by tabbing through at 375px, where
                  // "Career Journey" sat 89px outside the scroller and the
                  // container's scrollLeft never moved. `inline: 'center'`
                  // asks explicitly rather than relying on the default
                  // 'nearest', which is the behaviour that skips.
                  onFocus={(event) =>
                    event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'center' })
                  }
                  className="whitespace-nowrap hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:text-blue-400"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        {/* The only persistent chrome left after the nav bar was removed, so
            the theme control, the profile links and the address live here to
            stay reachable from anywhere. shrink-0 keeps them put while the
            chapter list scrolls beside them. */}
        <div className="flex shrink-0 items-center gap-1">
          <SocialIcons />
          {social.data?.email && <EmailLink email={social.data.email} />}
          <ThemeToggle />
        </div>
      </div>
      {/* Sits along the bar's own bottom edge now that the bar no longer spans
          the viewport. Same spring and same reduced-motion branch as before —
          only where it is drawn has changed. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-blue-600 dark:bg-blue-400"
        style={{ scaleX }}
        aria-hidden="true"
      />
    </div>
  );
}
