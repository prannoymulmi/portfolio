'use client';

import type { CareerChapter } from './chapters';

interface ChapterDetailProps {
  chapter: CareerChapter;
}

/**
 * The panel beside the pitch: one career chapter in full.
 *
 * Replaces the previous design's stack of MilestoneCards, where every chapter
 * was on screen at once behind its own expand/collapse toggle. One panel tied
 * to the pitch selection means the pitch is the navigation, rather than
 * decoration sitting above a list that navigates itself.
 */
export function ChapterDetail({ chapter }: ChapterDetailProps) {
  const { order, position, company, role, years, achievements, tech } = chapter;

  return (
    <div className="chapter-panel rounded-2xl p-7">
      <p className="label-mono text-xs text-primary">
        Chapter {order} · {position}
      </p>

      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{company}</h3>
      <p className="mt-1 text-sm font-medium text-primary">{role}</p>
      <p className="text-on-photo font-mono-ui mt-1 text-xs">{years}</p>

      {achievements.length > 0 && (
        <div className="mt-6">
          <p className="text-on-photo label-mono text-xs">What I did</p>
          <ul className="mt-3 space-y-2">
            {achievements.map((item) => (
              <li key={item} className="text-on-photo flex gap-3 text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tech.length > 0 && (
        <div className="mt-6">
          <p className="text-on-photo label-mono text-xs">Technologies</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {tech.map((item) => (
              <li
                key={item}
                className="text-on-photo rounded-full border border-border px-3 py-1 text-xs font-medium"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
