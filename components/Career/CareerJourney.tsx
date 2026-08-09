'use client';

import React, { useRef, useState } from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { SVGPitch } from './SVGPitch';
import { PlayerSVG, usePlayerAnimation } from './PlayerAnimation';
import { TimelineToggle } from './TimelineToggle';
import { TimelineView } from './TimelineView';
import { MilestoneCard } from './MilestoneCard';
import { CareerSkeleton } from '@/components/Common/LoadingState';

export function CareerJourney() {
  const { experiences } = useContent();
  const [isInteractiveMode, setIsInteractiveMode] = useState(true);
  const playerRef = useRef<SVGGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup GSAP player animation
  usePlayerAnimation(playerRef as React.RefObject<SVGGElement>, '.career-section', isInteractiveMode);

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

  // Sort experiences by date (most recent first)
  const sortedExperiences = [...jobList].sort((a, b) => {
    const dateA = new Date(a.dateText).getTime();
    const dateB = new Date(b.dateText).getTime();
    return dateB - dateA;
  });

  return (
    <section ref={containerRef} className="career-section space-y-8 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Career Journey</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isInteractiveMode
              ? 'Scroll to follow my career path'
              : 'Click on any position to view details'}
          </p>
        </div>
        <TimelineToggle isInteractive={isInteractiveMode} onChange={setIsInteractiveMode} />
      </div>

      {isInteractiveMode ? (
        // Interactive pitch visualization
        <div className="relative space-y-4">
          <div className="mx-auto h-96 max-w-2xl rounded-lg border border-gray-300 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-950">
            <SVGPitch className="h-full w-full">
              {/* Player animation on pitch */}
              <PlayerSVG ref={playerRef} y={20} />
            </SVGPitch>
          </div>

          {/* Milestone cards below pitch */}
          <div className="space-y-4">
            {sortedExperiences.map((experience, index) => (
              <MilestoneCard
                key={experience.id || index}
                experience={experience}
                index={index}
              />
            ))}
          </div>
        </div>
      ) : (
        // Timeline view (non-interactive)
        <TimelineView experiences={sortedExperiences} />
      )}
    </section>
  );
}
