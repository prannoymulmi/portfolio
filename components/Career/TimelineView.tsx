'use client';

import React from 'react';
import type { Experience } from '@/lib/types/portfolio';

interface TimelineViewProps {
  experiences: Experience[];
}

/**
 * The career without the metaphor: the same chapters as a plain list.
 *
 * Styled as rows on the shared surface rather than as cards. The previous
 * version stacked opaque white boxes with blue accents down the page, which
 * hid the photograph underneath and matched nothing else on the site — the
 * showcase chapter directly above it is divider-separated rows on the open
 * surface, and this is the same content in the same register.
 */
export function TimelineView({ experiences }: TimelineViewProps) {
  if (!experiences || experiences.length === 0) {
    return <p className="text-on-photo text-center">No experience data available</p>;
  }

  return (
    <div className="divide-y divide-gray-400/40 border-t border-gray-400/40">
      {experiences.map((experience, index) => (
        <article
          key={experience.id || index}
          className="grid gap-6 py-10 md:grid-cols-[10rem_1fr] md:items-start"
        >
          {/* Dates in their own rail, so the column reads as a timeline
              without needing a drawn line and a row of dots to say so. */}
          <div className="flex flex-col gap-2">
            <span className="text-on-photo font-mono text-sm">{experience.dateText}</span>
            <span className="text-on-photo w-fit rounded-full border border-gray-400/50 px-2.5 py-0.5 font-mono text-[0.65rem] tracking-wide uppercase">
              {experience.workType}
            </span>
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight">{experience.subtitle}</h3>
            <p className="mt-1 font-mono text-xs text-[#f2540d]">{experience.title}</p>

            {experience.workDescription && experience.workDescription.length > 0 && (
              <ul className="mt-4 space-y-2">
                {experience.workDescription.map((description) => (
                  <li key={description} className="text-on-photo flex gap-3 text-sm">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f2540d]" />
                    {description}
                  </li>
                ))}
              </ul>
            )}

            {experience.technologies && experience.technologies.length > 0 && (
              <ul
                aria-label={`Technologies used at ${experience.subtitle}`}
                className="mt-5 flex flex-wrap gap-2"
              >
                {experience.technologies.map((tech) => (
                  <li
                    key={tech}
                    className="text-on-photo rounded-full border border-gray-400/50 px-3 py-1 font-mono text-xs"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
