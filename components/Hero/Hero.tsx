'use client';

import Image from 'next/image';
import { useContent } from '@/components/Common/ContentProvider';
import { HeroSkeleton } from '@/components/Common/LoadingState';
import { ProfilePicturePlaceholder } from '@/components/Common/ProfilePicturePlaceholder';
import { RoughAnnotation, type AnnotationType } from '@/components/Common/RoughAnnotation';
import { HeroParallax } from './HeroParallax';
import { ValueProp } from './ValueProp';

// Fixed in code rather than content, so the marks stay visually varied
// however the phrases are later edited. Wraps if there are more phrases
// than styles. See docs/adr/0009-rough-notation-third-animation-library.md
const MARK_SEQUENCE: AnnotationType[] = ['highlight', 'circle', 'underline', 'box', 'bracket'];

// Stagger the marks so they draw one after another rather than all at once.
const MARK_STAGGER_MS = 450;

export function Hero() {
  const { home, about } = useContent();

  if (home.loading) return <HeroSkeleton />;
  if (home.error || !home.data) return null;

  const { name, intro, roles } = home.data;
  const imageSource = about.data?.imageSource;

  return (
    <HeroParallax>
      <section className="relative flex min-h-screen items-center bg-gradient-to-br from-white/95 via-blue-50/90 to-white/95 px-4 py-20 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/95 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center gap-10 md:flex-row md:items-center md:justify-between md:gap-14">
            {/* Introduction */}
            <div className="order-2 flex-1 space-y-6 text-center md:order-1 md:text-left">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                {name}
              </h1>

              {/* Annotated role phrases */}
              <p className="flex flex-wrap justify-center gap-x-3 gap-y-4 text-lg font-semibold text-gray-800 dark:text-gray-100 sm:text-xl md:justify-start">
                {roles.map((role, index) => (
                  <RoughAnnotation
                    key={role}
                    type={MARK_SEQUENCE[index % MARK_SEQUENCE.length]}
                    delay={index * MARK_STAGGER_MS}
                  >
                    {role}
                  </RoughAnnotation>
                ))}
              </p>

              <p className="mx-auto max-w-xl text-lg text-gray-600 dark:text-gray-300 md:mx-0">
                {intro}
              </p>

              <div className="pt-2">
                <ValueProp />
              </div>
            </div>

            {/* Portrait */}
            <div className="order-1 shrink-0 md:order-2">
              {imageSource ? (
                <Image
                  src={imageSource}
                  alt="Profile"
                  width={288}
                  height={288}
                  className="h-48 w-48 rounded-full object-cover sm:h-64 sm:w-64 lg:h-72 lg:w-72"
                  priority
                />
              ) : (
                <ProfilePicturePlaceholder className="h-48 w-48 rounded-full sm:h-64 sm:w-64 lg:h-72 lg:w-72" />
              )}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-16 flex justify-center">
            <div className="animate-bounce">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>
    </HeroParallax>
  );
}
