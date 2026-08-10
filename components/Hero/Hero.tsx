'use client';

import Image from 'next/image';
import { useContent } from '@/components/Common/ContentProvider';
import { HeroSkeleton } from '@/components/Common/LoadingState';
import { ProfilePicturePlaceholder } from '@/components/Common/ProfilePicturePlaceholder';
import { HeroParallax } from './HeroParallax';
import { ValueProp } from './ValueProp';
import { TopSkillsPreview } from './TopSkillsPreview';

export function Hero() {
  const { home, about } = useContent();

  if (home.loading) return <HeroSkeleton />;
  if (home.error || !home.data) return null;

  const { name, roles } = home.data;
  const primaryRole = roles[0];
  const imageSource = about.data?.imageSource;

  return (
    <HeroParallax>
      <section className="relative min-h-screen bg-gradient-to-br from-white via-blue-50 to-white px-4 py-20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Hero Content */}
          <div className="mb-12 space-y-6 text-center">
            {/* Profile picture (or a placeholder until one is configured) */}
            {imageSource ? (
              <Image
                src={imageSource}
                alt="Profile"
                width={128}
                height={128}
                className="mx-auto h-32 w-32 rounded-full object-cover"
              />
            ) : (
              <ProfilePicturePlaceholder className="mx-auto h-32 w-32 rounded-full" />
            )}

            {/* Name */}
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl lg:text-7xl">
              {name}
            </h1>

            {/* Title */}
            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 sm:text-2xl">
              {primaryRole}
            </p>

            {/* Value Proposition */}
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300 sm:text-xl">
              I build scalable cloud systems and lead high-performing engineering teams. 10+ years
              of experience in backend architecture, DevOps, and full-stack development.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="mb-16">
            <ValueProp />
          </div>

          {/* Top Skills Preview */}
          <div className="rounded-lg border border-gray-200 bg-white/50 p-8 backdrop-blur dark:border-gray-700 dark:bg-gray-800/50">
            <h2 className="mb-6 text-center text-lg font-semibold text-gray-900 dark:text-white">
              Core Expertise
            </h2>
            <TopSkillsPreview />
          </div>

          {/* Scroll Indicator */}
          <div className="mt-20 flex justify-center">
            <div className="animate-bounce">
              <svg
                className="h-6 w-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
