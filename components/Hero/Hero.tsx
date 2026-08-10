'use client';

import Image from 'next/image';
import { useContent } from '@/components/Common/ContentProvider';
import { HeroSkeleton } from '@/components/Common/LoadingState';
import { ProfilePicturePlaceholder } from '@/components/Common/ProfilePicturePlaceholder';
import { RoughAnnotation } from '@/components/Common/RoughAnnotation';
import { HeroParallax } from './HeroParallax';
import { ValueProp } from './ValueProp';

// One colour per stacked phrase, cycling if there are more phrases than
// colours. Each bar becomes the background for the text sitting on it, so
// every colour is checked against HIGHLIGHT_TEXT below: the weakest pairing
// (blue) is 4.63:1, clearing WCAG AA for normal text and well clear of the
// 3:1 large-text threshold this display type actually falls under.
const HIGHLIGHT_COLORS = ['#f0921e', '#7ac81f', '#12b886', '#3b7ff0'] as const;

// Deliberately near-black rather than theme-dependent: the bar supplies the
// background, so the same text colour is legible in light and dark alike.
const HIGHLIGHT_TEXT = 'text-gray-900';

const MARK_STAGGER_MS = 350;

export function Hero() {
  const { home, about } = useContent();

  if (home.loading) return <HeroSkeleton />;
  if (home.error || !home.data) return null;

  const { name, intro, roles } = home.data;
  const imageSource = about.data?.imageSource;

  return (
    <HeroParallax>
      <section className="relative flex min-h-screen items-center bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 px-4 py-20 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/95 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            {/* Introduction */}
            <div className="order-2 lg:order-1">
              <p className="mb-5 text-base font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
                {name}
              </p>

              {/* Stacked, each on its own line so the colour bars read as a
                  vertical stack rather than an inline run of highlights. */}
              <ul className="space-y-3">
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

            {/* Portrait */}
            <div className="order-1 lg:order-2">
              <figure className="mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
                {imageSource ? (
                  <Image
                    src={imageSource}
                    alt="Profile"
                    width={640}
                    height={640}
                    className="aspect-square w-full rounded-2xl bg-sky-400 object-cover"
                    priority
                  />
                ) : (
                  <ProfilePicturePlaceholder className="aspect-square w-full rounded-2xl" />
                )}
                <figcaption className="mt-3 flex items-center gap-2 font-mono text-sm text-gray-500 dark:text-gray-400">
                  <span aria-hidden="true">↖</span>
                  That&apos;s me
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </section>
    </HeroParallax>
  );
}
