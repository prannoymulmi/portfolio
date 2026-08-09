'use client';

import React, { useRef, useState } from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { SVGPitch } from './SVGPitch';
import { PlayerSVG, usePlayerAnimation } from './PlayerAnimation';
import { TimelineToggle } from './TimelineToggle';
import { TimelineView } from './TimelineView';
import { LoadingState } from '@/components/Common/LoadingState';

export function CareerJourney() {
  const { experiences } = useContent();
  const [isInteractiveMode, setIsInteractiveMode] = useState(true);
  const playerRef = useRef<SVGGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Setup GSAP player animation
  usePlayerAnimation(playerRef, '.career-section', isInteractiveMode);

  if (experiences.loading) {
    return <LoadingState.CareerSkeleton />;
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
              <div
                key={experience.id || index}
                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {experience.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{experience.subtitle}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                      {experience.dateText}
                    </p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900 dark:bg-blue-900 dark:text-blue-100">
                    {experience.workType}
                  </span>
                </div>

                {/* Achievements */}
                {experience.workDescription && experience.workDescription.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {experience.workDescription.map((desc, idx) => (
                      <li key={idx} className="ml-4 text-sm text-gray-700 dark:text-gray-300">
                        • {desc}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Technologies */}
                {experience.technologies && experience.technologies.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {experience.technologies.map((tech, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
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
