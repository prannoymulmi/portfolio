'use client';

import { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { prefersReducedMotion } from '@/lib/utils/animations';
import { ThemeToggle } from '@/components/Common/ThemeToggle';
import { useContent } from '@/components/Common/ContentProvider';
import { EmailLink } from './EmailLink';
import { HamburgerMenu } from './HamburgerMenu';
import { SocialIcons } from './SocialIcons';

// The story has no page-to-page nav bar, but visitors still need a way to
// jump between chapters (and keyboard/screen-reader users need a way to
// skip ahead) without scrolling through everything. This renders a thin
// scroll-progress bar; the section links themselves live inside the
// hamburger menu (HamburgerMenu) rather than inline, so the bar stays
// minimal at every width (spec 010-hamburger-nav).
const STORY_SECTIONS = [
  { id: 'hero', label: 'Introduction' },
  // id stays 'skills' after the chapter became the work showcase — external
  // links and the footer both target /#skills. Only the label moved.
  { id: 'skills', label: 'Selected Work' },
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

  return (
    // Floating rather than flush: inset from all three edges so the bar reads
    // as an object over the photograph instead of a browser chrome strip.
    // overflow-hidden clips the progress hairline to the rounded ends.
    //
    // Glass, not a panel. The whole story sits on one photograph, so the bar
    // samples it: at 55% the sunset's gradient is still legible through the
    // fill, which is what makes it read as a pane over the scene rather than a
    // strip laid on top of it. Measured off the reference design, where the
    // bar's own colour drifts with the photo beneath it — (217,202,198) at one
    // end of the sweep against (253,218,207) at the other.
    //
    // #fffaf4 rather than white, and #0c101c rather than gray-900: a neutral
    // fill greys the sunset it is meant to belong to, so the light tint is
    // warm and the dark one leans blue toward INK.
    //
    // backdrop-saturate is the one liberty taken here — the photograph reads
    // slightly more vivid through the bar than beside it, so the glass behaves
    // like a lens rather than a filter. The drop shadow that used to sit here
    // is gone: a heavy shadow under glass reads as plastic. What replaces it is
    // a 1px inner highlight along the top edge, which is how a real pane
    // catches light.
    <div className="sticky top-3 z-40 mx-3 overflow-hidden rounded-full bg-[#fffaf4]/55 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.6),0_10px_30px_-18px_rgb(17_28_56/0.45)] ring-1 ring-[#111c38]/10 backdrop-blur-xl backdrop-saturate-150 dark:bg-[#0c101c]/55 dark:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.10),0_10px_30px_-18px_rgb(0_0_0/0.6)] dark:ring-white/10 sm:mx-6">
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
            className="flex items-center gap-3 rounded text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-100"
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

        {/* Pushes the controls to the bar's right edge — the chapter list used
            to live here and stretch between the two, but it now lives inside
            the hamburger menu instead (spec 010-hamburger-nav). */}
        <div className="flex-1" />
        {/* The persistent chrome: menu toggle, profile links, address, and
            theme control, all reachable from anywhere in the story. */}
        <div className="flex shrink-0 items-center gap-1">
          <HamburgerMenu sections={STORY_SECTIONS} />
          <SocialIcons />
          {social.data?.email && <EmailLink email={social.data.email} />}
          <ThemeToggle />
        </div>
      </div>
      {/* Sits along the bar's own bottom edge now that the bar no longer spans
          the viewport. Same spring and same reduced-motion branch as before —
          only where it is drawn has changed. */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary"
        style={{ scaleX }}
        aria-hidden="true"
      />
    </div>
  );
}
