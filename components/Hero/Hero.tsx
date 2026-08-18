'use client';

import Link from 'next/link';
import { useContent } from '@/components/Common/ContentProvider';
import { HeroSkeleton } from '@/components/Common/LoadingState';
import { RoughAnnotation } from '@/components/Common/RoughAnnotation';
import { CvLink } from './CvLink';
import { HeroGradientLayers } from './HeroGradientLayers';
import { HeroDrift } from './HeroParallax';
import { HeroPortrait } from './HeroPortrait';
import { useHeroScrollBlur } from './useHeroScrollBlur';
import { CREAM, EMBER, INK, TEAL } from './palette';
import { ValueProp } from './ValueProp';
import { dispatchProjectHighlight, PORTFOLIO_PROJECT_ID } from '@/lib/utils/projectHighlight';

/**
 * One colour per role — three roles, three colours, no arbitrary cycling.
 * See ./palette.ts for where the three come from and why they're dark.
 */
const HIGHLIGHT_COLORS = [INK, EMBER, TEAL] as const;

const MARK_STAGGER_MS = 350;

export function Hero() {
  const { home } = useContent();
  const heroBlurRef = useHeroScrollBlur();

  if (home.loading) return <HeroSkeleton />;
  if (home.error || !home.data) return null;

  const { name, intro, roles, bio, imageSource, cv } = home.data;

  return (
    <>
      {/* A scrim, not a fill: it lifts the left column clear of the photo's
          saturated corner while leaving the sunset itself visible. */}
      <section
        ref={heroBlurRef}
        className="relative flex min-h-screen items-center bg-gradient-to-r from-background/55 via-background/25 to-transparent px-4 py-20 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/40 sm:px-6 lg:px-8"
      >
        {/* First in source order, so it paints behind the scrim and every
            foreground element below without needing a z-index of its own. */}
        <HeroGradientLayers />
        {/* max-w-7xl (1280px) stopped growing past the xl breakpoint, so
            every viewport from 1280px up to a 4K monitor rendered the exact
            same column width — the portrait's height cap could scale with
            vh, but its width was clamped to that fixed column regardless,
            so it read as small and adrift on a wide, short display where
            the gutters outgrew the content. xl/2xl steps let the container,
            and therefore the portrait, keep growing with real desktop
            widths; lg and below are untouched. */}
        <div className="mx-auto w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1700px]">
          {/* The portrait takes the larger share. Trimmed to its bounding box
              the image is wider relative to its height, so its column — not its
              height cap — became the binding constraint; widening the container
              to 7xl and tilting the split is what lets the cap engage again.

              1.15 rather than more: the text column still has to hold "Software
              Engineer." on one line, and the role marks lose their rhythm the
              moment a phrase wraps. At this split it sits at 573px against the
              548px it had before, so it has gained room rather than lost it. */}
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
            {/* Introduction. Source order is the reading order at every width:
                stacked on narrow screens the pitch and its two buttons come
                first, and the card follows. No order-* utility, because those
                move the box without moving the node — a phone would show the
                card first while a screen reader still announced the text first.

                min-w-0 on both cells: a grid item defaults to min-width:auto,
                which would let the card's fixed side rails push the column past
                the viewport on narrow screens. */}
            <HeroDrift strength={24} className="min-w-0">
              {/* No name line here. The heading moved to the navigation's
                  wordmark, where it is visible from every chapter rather than
                  only the first, and printing it twice within one screen read
                  as a duplicate rather than as emphasis. */}

              {/* Credit pill, pointing at the "This Portfolio, Spec-Driven"
                  card specifically — `#project-portfolio-spec-driven` matches
                  the `id` ProjectCard sets on that card (its `id` in
                  public/data/projects.json), and the click also dispatches
                  the CustomEvent (lib/utils/projectHighlight.ts) that
                  ProjectGallery turns into a moving-light border highlight
                  rather than just landing on top of the section. Pulsing dot
                  borrowed from the showcase/ reference's Hero (gitignored). */}
              <Link
                href={`/#project-${PORTFOLIO_PROJECT_ID}`}
                onClick={() => {
                  dispatchProjectHighlight(PORTFOLIO_PROJECT_ID);
                  // Next's router bails out of scrolling on a click whose
                  // href matches the current URL (the common case here: the
                  // hash from the first click is often still in the address
                  // bar), so a second click that scrolled the page away in
                  // the meantime would otherwise never scroll back. This
                  // scrollIntoView runs unconditionally, every click,
                  // whether or not the router decides the URL "changed".
                  const target = document.getElementById(`project-${PORTFOLIO_PROJECT_ID}`);
                  target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="group mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/40 hover:bg-primary/10"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Built with Claude Code · Spec-driven development
              </Link>

              {/* Stacked one per line, so the colour bars read as a vertical
                  stack rather than an inline run of highlights. */}
              <ul aria-label="What I do" className="space-y-3">
                {roles.map((role, index) => (
                  <li key={role} className="flex">
                    <RoughAnnotation
                      type="highlight"
                      color={HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length]}
                      delay={index * MARK_STAGGER_MS}
                      padding={6}
                    >
                      <span
                        className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
                        style={{ color: CREAM }}
                      >
                        {role}.
                      </span>
                    </RoughAnnotation>
                  </li>
                ))}
              </ul>

              {/* The accent rule marks this line as the claim the section is
                  making, rather than a caption under the role bars. It is a
                  border rather than a pseudo-element so it grows with the text
                  when the line wraps to three lines on a phone.

                  border-primary/text-foreground rather than the old ACCENT/
                  WARM_INK literals — both are now real design tokens
                  (specs/009-typography-color-refresh), not one-off hex only
                  Tailwind's arbitrary-value syntax could reach. */}
              <p className="mt-9 max-w-xl border-l-4 border-primary pl-5 text-lg font-medium text-foreground dark:text-gray-300">
                {intro}
              </p>

              {/* The About chapter, condensed to what the opening can carry
                  without pushing the card off the first screen. */}
              <p className="text-on-photo mt-4 max-w-xl">{bio}</p>

              {/* sm:w-fit shrinks this wrapper to ValueProp's own rendered
                  width (the button pair, side by side from sm up) rather than
                  the full text column — so CvLink's justify-center below
                  centers it under the two buttons specifically, not under the
                  wider bio/intro text above. The wrapper itself stays flush
                  with that text's left edge (no margin, default block
                  position), so the button pair is still left-aligned; only
                  the CV link's centering point moves. Below sm, ValueProp's
                  buttons stack full-width, so there's no "under the pair"
                  distinct from "under the column" — w-fit only applies at
                  sm+. */}
              <div className="mt-8 sm:w-fit">
                <ValueProp />
                {/* Under the two buttons, not beside them: it is somewhere to
                    go, not a third thing being asked of the visitor. */}
                <div className="mt-5 flex justify-center">
                  <CvLink cv={cv} />
                </div>
              </div>
            </HeroDrift>

            {/* Drifts further than the text beside it, so the portrait reads
                as the nearer object — but at half the card's old strength.
                The card had a hard edge that could travel any distance without
                giving itself away; this dissolves into the section, and a
                gradient sliding against a pinned backdrop reads as a moving
                seam. */}
            <HeroDrift strength={28} className="min-w-0">
              <HeroPortrait name={name} imageSource={imageSource} />
            </HeroDrift>
          </div>
        </div>
      </section>
    </>
  );
}
