'use client';

import React, { useState } from 'react';
import type { Experience } from '@/lib/types/portfolio';

interface MilestoneCardProps {
  experience: Experience;
  index: number;
}

export function MilestoneCard({ experience, index }: MilestoneCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article
      className="group rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
      role="region"
      aria-label={`Career milestone at ${experience.title}`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-expanded={isExpanded}
        aria-controls={`milestone-details-${index}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
              {experience.title}
            </h3>
            <p className="text-sm text-gray-600">{experience.subtitle}</p>
          </div>
          <div className="shrink-0">
            <span className="inline-block whitespace-nowrap rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900">
              {experience.workType}
            </span>
          </div>
        </div>
      </button>

      {/* Date badge */}
      <time dateTime={experience.dateText} className="mt-2 block text-xs text-gray-500">
        {experience.dateText}
      </time>

      {/* Expandable details */}
      {isExpanded && (
        <div
          id={`milestone-details-${index}`}
          className="mt-4 space-y-3 border-t border-gray-200 pt-4"
        >
          {/* Achievements */}
          {experience.workDescription && experience.workDescription.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium text-gray-900">Achievements:</h4>
              <ul className="space-y-1">
                {experience.workDescription.map((desc, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-gray-700">
                    <span className="shrink-0 text-blue-600">✓</span>
                    <span>{desc}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Technologies */}
          {experience.technologies && experience.technologies.length > 0 && (
            <div>
              <h4 className="mb-2 font-medium text-gray-900">Technologies:</h4>
              <div className="flex flex-wrap gap-2">
                {experience.technologies.map((tech, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
