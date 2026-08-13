'use client';

import React, { useState } from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { CareerPitch } from './CareerPitch';
import { TimelineToggle } from './TimelineToggle';
import { TimelineView } from './TimelineView';
import { byMostRecentFirst } from './chapters';
import { CareerSkeleton } from '@/components/Common/LoadingState';

export function CareerJourney() {
  const { experiences } = useContent();
  const [isInteractiveMode, setIsInteractiveMode] = useState(true);

  if (experiences.loading) {
    return <CareerSkeleton />;
  }

  if (experiences.error || !experiences.data) {
    return (
      <section className="career-section py-12">
        <p className="text-center text-red-600">Failed to load career timeline</p>
      </section>
    );
  }

  const { experiences: jobList } = experiences.data;

  return (
    <section className="career-section space-y-8 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="label-mono text-primary">Career match</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Pass the ball to see where I&rsquo;ve played
          </h2>
          <p className="text-on-photo mt-3 max-w-xl">
            {isInteractiveMode
              ? 'Every player is a chapter. Pass freely to explore, or run the build-up play to walk it in order, oldest to newest.'
              : 'The same chapters, oldest to newest, as a plain list.'}
          </p>
        </div>
        <TimelineToggle isInteractive={isInteractiveMode} onChange={setIsInteractiveMode} />
      </div>

      {/* The timeline branch is deliberately just the list: no pitch, no
          player, no play control. It is the view for someone who wants the
          facts without the metaphor. */}
      {isInteractiveMode ? (
        <CareerPitch experiences={jobList} />
      ) : (
        <TimelineView experiences={byMostRecentFirst(jobList)} />
      )}
    </section>
  );
}
