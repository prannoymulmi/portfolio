'use client';

import React from 'react';
import Image from 'next/image';
import { useContent } from '@/components/Common/ContentProvider';
import type { About } from '@/lib/types/portfolio';
import { SocialLinks } from './SocialLinks';
import { AboutSkeleton } from '@/components/Common/LoadingState';
import { ProfilePicturePlaceholder } from '@/components/Common/ProfilePicturePlaceholder';

export function AboutSection() {
  const { about } = useContent();

  if (about.loading) {
    return <AboutSkeleton />;
  }

  if (about.error || !about.data) {
    return (
      <section className="py-12">
        <p className="text-center text-red-600">Failed to load about content</p>
      </section>
    );
  }

  const aboutData = about.data as About;

  return (
    <section className="space-y-8 py-12">
      <div className="space-y-8 md:flex md:gap-12">
        {/* Profile image (or a placeholder until one is configured) */}
        <div className="md:w-48 md:shrink-0">
          {aboutData?.imageSource ? (
            <Image
              src={aboutData.imageSource}
              alt="Profile"
              width={256}
              height={256}
              className="h-64 w-64 rounded-lg object-cover md:h-48 md:w-48"
            />
          ) : (
            <ProfilePicturePlaceholder className="h-64 w-64 md:h-48 md:w-48" />
          )}
        </div>

        {/* Biography */}
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">About Me</h2>
            <p className="mt-4 whitespace-pre-wrap text-lg text-gray-700 dark:text-gray-300">
              {aboutData?.about}
            </p>
          </div>

          {/* Social links */}
          <div className="pt-4">
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">Connect with me:</h3>
            <SocialLinks />
          </div>
        </div>
      </div>
    </section>
  );
}
