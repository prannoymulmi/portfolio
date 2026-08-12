'use client';

import type { Project } from '@/lib/types/portfolio';

interface SystemCardProps {
  project: Project;
}

/**
 * One system in the showcase — the evidence behind a line on a CV.
 *
 * Every optional field renders nothing at all when absent rather than falling
 * back to a placeholder. This section makes claims about real professional
 * work, so an invented year or role costs more than a gap in the layout does.
 */
export function SystemCard({ project }: SystemCardProps) {
  const { title, bodyText, tags, year, role, metric } = project;

  return (
    <article className="grid gap-6 py-10 md:grid-cols-[6rem_1fr_11rem] md:items-start">
      {/* Left rail: the year, when the content has one. */}
      <div>
        {year && (
          <span data-testid="system-year" className="text-on-photo font-mono text-sm">
            {year}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
        {role && <p className="mt-1 font-mono text-xs text-[#f2540d]">{role}</p>}
        <p className="text-on-photo mt-4 max-w-xl leading-relaxed">{bodyText}</p>

        <ul aria-label={`Technologies used on ${title}`} className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <li
              key={tag}
              className="text-on-photo rounded-full border border-gray-400/50 px-3 py-1 font-mono text-xs"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      {/* The headline figure, given its own column so it reads as the result
          rather than as another tag. */}
      {metric && (
        <span className="rounded-xl bg-white/40 px-4 py-3 text-center font-mono text-sm text-[#3d2318] md:text-right dark:bg-gray-800/40 dark:text-gray-200">
          {metric}
        </span>
      )}
    </article>
  );
}
