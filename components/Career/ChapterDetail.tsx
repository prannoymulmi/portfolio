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
      <p className="font-mono text-xs tracking-widest text-[#f2540d] uppercase">
        Chapter {order} · {position}
      </p>

      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{company}</h3>
      <p className="mt-1 font-mono text-xs text-[#f2540d]">{role}</p>
      <p className="text-on-photo mt-1 font-mono text-xs">{years}</p>

      {achievements.length > 0 && (
        <div className="mt-6">
          <p className="text-on-photo font-mono text-xs tracking-widest uppercase">What I did</p>
          <ul className="mt-3 space-y-2">
            {achievements.map((item) => (
              <li key={item} className="text-on-photo flex gap-3 text-sm">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f2540d]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {tech.length > 0 && (
        <div className="mt-6">
          <p className="text-on-photo font-mono text-xs tracking-widest uppercase">Technologies</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {tech.map((item) => (
              <li
                key={item}
                className="text-on-photo rounded-full border border-gray-400/50 px-3 py-1 font-mono text-xs"
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
