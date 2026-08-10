'use client';

import { useContent } from '@/components/Common/ContentProvider';
import { HeroSkeleton } from '@/components/Common/LoadingState';
import { RoughAnnotation } from '@/components/Common/RoughAnnotation';
import { HeroParallax } from './HeroParallax';
import { PlayerCard } from './PlayerCard';
import { ValueProp } from './ValueProp';

/**
 * Palette is drawn from this site's own football-pitch metaphor (ADR 0004)
 * rather than a generic rainbow: floodlight amber, grass under lights, and
 * the same kit blue the #10 jersey already uses in PlayerAnimation.
 *
 * One colour per role — three roles, three colours, no arbitrary cycling.
 * Each is the background for the text on it; all clear 7:1 against
 * HIGHLIGHT_TEXT, so they hold up in both themes.
 */
const FLOODLIGHT = '#fbbf24';
const TURF = '#4ade80';
const KIT = '#60a5fa';
const HIGHLIGHT_COLORS = [FLOODLIGHT, TURF, KIT] as const;

const HIGHLIGHT_TEXT = 'text-[#0b1220]';

const MARK_STAGGER_MS = 350;

export function Hero() {
  const { home, about } = useContent();

  if (home.loading) return <HeroSkeleton />;
  if (home.error || !home.data) return null;

  const { name, intro, roles, card } = home.data;
  const imageSource = about.data?.imageSource;

  return (
    <HeroParallax>
      <section className="relative flex min-h-screen items-center bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 px-4 py-20 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/95 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            {/* Introduction */}
            <div className="order-2 lg:order-1">
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
                        className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${HIGHLIGHT_TEXT}`}
                      >
                        {role}.
                      </span>
                    </RoughAnnotation>
                  </li>
                ))}
              </ul>

              <p className="mt-9 max-w-xl text-lg text-gray-600 dark:text-gray-300">{intro}</p>

              <div className="mt-8">
                <ValueProp />
              </div>
            </div>

            {/* Portrait, framed as a player card — same metaphor the career
                and skills sections already run on. */}
            <div className="order-1 lg:order-2">
              <PlayerCard name={name} role={roles[0]} card={card} imageSource={imageSource} />
            </div>
          </div>
        </div>
      </section>
    </HeroParallax>
  );
}
