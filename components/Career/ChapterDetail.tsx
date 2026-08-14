'use client';

import { DEFAULT_TECH, type CareerChapter } from './chapters';

interface ChapterDetailProps {
  chapter: CareerChapter;
}

/**
 * The panel beside the pitch: one career chapter in full.
 *
 * Restructured to the Work showcase's `SystemCard` section pattern — a short
 * "What I built" summary, an achievements list, and technology tags — so the
 * career chapter and the showcase read as one design system rather than two
 * treatments of similar content (US3). The showcase's structure is adopted;
 * its colour treatment is not — this panel keeps the career section's own
 * `chapter-panel` surface. Vertical rhythm is tightened from the previous
 * `p-7`/`mt-6` scale to compact the panel without hiding any content (FR-009,
 * SC-003): `builtSummary` (the first work-description line) now carries what
 * used to be the first bullet, so the achievements list is one line shorter
 * for free.
 *
 * Each section label carries a small `aria-hidden` emoji mark — no icon
 * library involved, so Principle IV's `react-icons`-in-`SocialIcons.tsx`-only
 * restriction stays intact. The date sits directly beneath the role line,
 * ahead of "What I built" — a visitor scanning the panel should know *when*
 * before reading *what* (specs/012-mobile-layout-fixes), rather than finding
 * the date only after scrolling past the achievements and technologies.
 *
 * Replaces the previous design's stack of MilestoneCards, where every chapter
 * was on screen at once behind its own expand/collapse toggle. One panel tied
 * to the pitch selection means the pitch is the navigation, rather than
 * decoration sitting above a list that navigates itself.
 */
export function ChapterDetail({ chapter }: ChapterDetailProps) {
  const { order, position, company, role, years, builtSummary, achievements, tech } = chapter;
  // Defence in depth: `toChapters` already applies this fallback (FR-012),
  // but a chapter built any other way still gets it here rather than an
  // empty technologies section.
  const techTags = tech.length > 0 ? tech : DEFAULT_TECH;

  return (
    <div className="chapter-panel rounded-2xl p-5">
      <p className="label-mono text-primary text-xs">
        Chapter {order} · {position}
      </p>

      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{company}</h3>
      <p className="text-primary mt-1 text-sm font-medium">{role}</p>

      {/* Date sits here, right after the role and ahead of every detail
          section, so the visitor reads *when* before *what*
          (specs/012-mobile-layout-fixes). It used to sit at the foot of the
          panel, after achievements and technologies. */}
      <p className="text-on-photo font-mono-ui mt-3 flex items-center gap-1.5 text-xs opacity-70">
        <span aria-hidden="true">📅</span>
        <span>{years}</span>
      </p>

      {builtSummary && (
        <div className="mt-3">
          <p className="text-on-photo label-mono flex items-center gap-1.5 text-xs">
            <span aria-hidden="true">🛠️</span>
            <span>What I built</span>
          </p>
          <p className="text-on-photo mt-1 text-sm leading-snug">{builtSummary}</p>
        </div>
      )}

      {achievements.length > 0 && (
        <div className="mt-3">
          <p className="text-on-photo label-mono flex items-center gap-1.5 text-xs">
            <span aria-hidden="true">🏆</span>
            <span>Achievements</span>
          </p>
          <ul className="mt-1 space-y-1">
            {achievements.map((item) => (
              <li key={item} className="text-on-photo flex gap-2 text-sm leading-snug">
                <span className="bg-primary mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-3">
        <p className="text-on-photo label-mono flex items-center gap-1.5 text-xs">
          <span aria-hidden="true">⚙️</span>
          <span>Technologies</span>
        </p>
        <ul aria-label={`Technologies used at ${company}`} className="mt-1 flex flex-wrap gap-1.5">
          {techTags.map((item) => (
            <li
              key={item}
              className="text-on-photo label-mono border-border rounded-full border px-2.5 py-0.5 text-xs"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
