'use client';

import { useContent } from '@/components/Common/ContentProvider';
import { HeroSkeleton } from '@/components/Common/LoadingState';
import { RoughAnnotation } from '@/components/Common/RoughAnnotation';
import { CvLink } from './CvLink';
import { HeroDrift } from './HeroParallax';
import { HeroPortrait } from './HeroPortrait';
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

  const { name, intro, roles, bio, imageSource, cv } = home.data;

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
              {/* No name line here. The heading moved to the navigation's
                  wordmark, where it is visible from every chapter rather than
                  only the first, and printing it twice within one screen read
                  as a duplicate rather than as emphasis. */}

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

                  Literals rather than the ACCENT and WARM_INK tokens: Tailwind
                  scans class strings, so an interpolated one never reaches the
                  stylesheet. */}
              <p className="mt-9 max-w-xl border-l-4 border-[#f2540d] pl-5 text-lg font-medium text-[#3d2318] dark:text-gray-300">
                {intro}
              </p>

              {/* The About chapter, condensed to what the opening can carry
                  without pushing the card off the first screen. */}
              <p className="text-on-photo mt-4 max-w-xl">{bio}</p>

              <div className="mt-8">
                <ValueProp />
                {/* Under the two buttons, not beside them: it is somewhere to
                    go, not a third thing being asked of the visitor.

                    Centred to sit on the buttons' axis at both widths — the row
                    above is justify-center from sm up, and below that the two
                    buttons stretch full width with their labels centred. Left
                    aligned, this line reads as loose text under the cluster
                    rather than as part of it. */}
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
