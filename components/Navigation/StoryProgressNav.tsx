'use client';

import { useState } from 'react';
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
  const { social } = useContent();
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

  return (
    // Floating rather than flush: inset from all three edges so the bar reads
    // as an object over the photograph instead of a browser chrome strip.
    // overflow-hidden clips the progress hairline to the rounded ends.
    <div className="sticky top-3 z-40 mx-3 overflow-hidden rounded-full bg-white/80 shadow-lg ring-1 ring-black/5 backdrop-blur dark:bg-gray-900/80 dark:ring-white/10 sm:mx-6">
      <div className="flex items-center gap-3 py-2 pl-5 pr-3">
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
          aria-label="Story sections"
          className="mask-r-from-85% mask-r-to-100% focus-within:mask-none min-w-0 flex-1 overflow-x-auto"
        >
          <ul className="flex w-max gap-4 text-sm font-medium text-gray-600 dark:text-gray-300">
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
