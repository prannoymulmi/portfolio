'use client';

import { useContent } from '@/components/Common/ContentProvider';
import { HeroSkeleton } from '@/components/Common/LoadingState';
import { RoughAnnotation } from '@/components/Common/RoughAnnotation';
import { CvLink } from './CvLink';
import { HeroDrift } from './HeroParallax';
import { PlayerCard } from './PlayerCard';
import { CREAM, EMBER, INK, TEAL } from './palette';
import { ValueProp } from './ValueProp';

/**
 * One colour per role — three roles, three colours, no arbitrary cycling.
 * See ./palette.ts for where the three come from and why they're dark.
 */
const HIGHLIGHT_COLORS = [INK, EMBER, TEAL] as const;

const MARK_STAGGER_MS = 350;

export function Hero() {
  const { home } = useContent();

  if (home.loading) return <HeroSkeleton />;
  if (home.error || !home.data) return null;

  const { name, intro, roles, card, bio, imageSource, cv } = home.data;

  return (
    <>
      {/* A scrim, not a fill: it lifts the left column clear of the photo's
          saturated corner while leaving the sunset itself visible. */}
      <section className="relative flex min-h-screen items-center bg-gradient-to-r from-white/55 via-white/25 to-transparent px-4 py-20 dark:from-gray-900/90 dark:via-gray-900/70 dark:to-gray-900/40 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-14">
            {/* Introduction. Source order is the reading order at every width:
                stacked on narrow screens the pitch and its two buttons come
                first, and the card follows. No order-* utility, because those
                move the box without moving the node — a phone would show the
                card first while a screen reader still announced the text first.

                min-w-0 on both cells: a grid item defaults to min-width:auto,
                which would let the card's fixed side rails push the column past
                the viewport on narrow screens. */}
            <HeroDrift strength={24} className="min-w-0">
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

              {/* Literal rather than the WARM_INK token: Tailwind scans class
                  strings, so an interpolated one never reaches the stylesheet. */}
              <p className="mt-9 max-w-xl text-lg font-medium text-[#3d2318] dark:text-gray-300">
                {intro}
              </p>

              {/* The About chapter, condensed to what the opening can carry
                  without pushing the card off the first screen. */}
              <p className="mt-4 max-w-xl text-on-photo">{bio}</p>

              <div className="mt-8">
                <ValueProp />
                {/* Under the two buttons, not beside them: it is somewhere to
                    go, not a third thing being asked of the visitor. */}
                <CvLink cv={cv} />
              </div>
            </HeroDrift>

            {/* Portrait, framed as a player card — same metaphor the career
                and skills sections already run on. Drifts further than the text
                beside it, so the card reads as the nearer object. */}
            <HeroDrift strength={56} className="min-w-0">
              <PlayerCard name={name} card={card} imageSource={imageSource} />
            </HeroDrift>
          </div>
        </div>
      </section>
    </>
  );
}
