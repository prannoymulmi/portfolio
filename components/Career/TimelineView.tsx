'use client';

import React from 'react';
import type { Experience } from '@/lib/types/portfolio';

interface TimelineViewProps {
  experiences: Experience[];
}

export function TimelineView({ experiences }: TimelineViewProps) {
  if (!experiences || experiences.length === 0) {
    return <p className="text-center text-gray-600">No experience data available</p>;
  }

  return (
    <div className="space-y-0">
      {/* Timeline container */}
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-2 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-transparent" />

        {/* Timeline items */}
        {experiences.map((experience, index) => (
          <div key={experience.id || index} className="relative pb-8">
            {/* Timeline dot */}
            <div className="absolute -left-4 top-2 h-4 w-4 rounded-full border-2 border-blue-500 bg-white" />

            {/* Content card */}
            <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{experience.title}</h3>
                  <p className="text-sm text-gray-600">{experience.subtitle}</p>
                </div>
                <div className="shrink-0">
                  <span className="whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900">
                    {experience.workType}
                  </span>
                </div>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-500">{experience.dateText}</p>

              {/* Description/Achievements */}
              {experience.workDescription && experience.workDescription.length > 0 && (
                <ul className="space-y-1">
                  {experience.workDescription.map((desc, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      • {desc}
                    </li>
                  ))}
                </ul>
              )}

              {/* Technologies */}
              {experience.technologies && experience.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {experience.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-gray-200 px-2 py-1 text-xs text-gray-800"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
