'use client';

import type { Project } from '@/lib/types/portfolio';
import { useUi } from '@/components/Common/LocaleProvider';
import { format } from '@/lib/i18n/format';

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
  const ui = useUi();

  return (
    <article className="grid gap-6 py-10 md:grid-cols-[6rem_1fr_11rem] md:items-start">
      {/* Left rail: the year, when the content has one. */}
      <div>
        {year && (
          <span data-testid="system-year" className="text-on-photo font-mono-ui text-sm">
            {year}
          </span>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
        {role && <p className="mt-1 text-sm font-medium text-primary">{role}</p>}
        <p className="text-on-photo mt-4 max-w-xl leading-relaxed">{bodyText}</p>

        <ul
          aria-label={format(ui.work.technologiesUsedOn, { title })}
          className="mt-5 flex flex-wrap gap-2"
        >
          {tags.map((tag) => (
            <li
              key={tag}
              className="text-on-photo label-mono rounded-full border border-border px-3 py-1 text-xs"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      {/* The headline figure, given its own column so it reads as the result
          rather than as another tag.

          Warm-tinted, not the reference's bg-secondary/text-accent: --accent
          as small text measures ~1.98:1 against this card/photo composite —
          nowhere near AA. bg-primary/10 + border-primary/30 gets the same
          "highlighted stat" pop the reference has, with text-on-photo (not
          the accent hue) carrying the actual number so it stays legible. */}
      {metric && (
        <span className="text-on-photo font-mono-ui rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-center text-sm font-semibold md:text-right">
          {metric}
        </span>
      )}
    </article>
  );
}
