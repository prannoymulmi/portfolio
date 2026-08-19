'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Experience } from '@/lib/types/portfolio';
import { prefersReducedMotion } from '@/lib/utils/animations';
import { useUi } from '@/components/Common/LocaleProvider';
import { format } from '@/lib/i18n/format';
import { SVGPitch, PITCH_HEIGHT } from './SVGPitch';
import { ChapterDetail } from './ChapterDetail';
import { toChapters } from './chapters';

/** How long each chapter holds the ball when the play runs itself. */
const STEP_MS = 2600;

/** Chapter coordinates are percentages; the pitch is 100 x PITCH_HEIGHT. */
const toPitchY = (percent: number) => (percent / 100) * PITCH_HEIGHT;

interface CareerPitchProps {
  experiences: Experience[];
}

/**
 * The career as a move on the pitch: every player is a chapter, and passing to
 * one opens it.
 *
 * What this replaced drove a single marker down the pitch from scroll position
 * via GSAP ScrollTrigger, which meant the visitor could not choose a chapter —
 * only scroll past all of them — and the pitch showed one anonymous dot rather
 * than the shape of a career. Selection is plain component state here, so it
 * works identically under touch, keyboard and reduced motion, and needs no
 * animation library at all.
 */
export function CareerPitch({ experiences }: CareerPitchProps) {
  const ui = useUi();
  const chapters = toChapters(experiences);
  const [index, setIndex] = useState(() => Math.max(0, chapters.length - 1));
  const [playing, setPlaying] = useState(false);
  // Read once via lazy initializer (`window` isn't available during SSR),
  // matching the convention in StoryProgressNav/HamburgerMenu — no new
  // detection path per component (Constitution quality constraints).
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && prefersReducedMotion());
  // Tracks which player currently holds *keyboard* focus, so the drawn focus
  // ring appears only for keyboard users — the browser's own focus ring is
  // suppressed outright below (research R4).
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const active = chapters[index];
  const previous = index > 0 ? chapters[index - 1] : null;

  useEffect(() => {
    // The walk ends at the newest chapter rather than looping: it is a career,
    // not a carousel. Stopping is done from the timer callback rather than
    // here, because setting state synchronously inside an effect cascades a
    // second render before the first has painted.
    if (!playing || index >= chapters.length - 1) return;

    const timer = setTimeout(() => {
      const next = index + 1;
      setIndex(next);
      if (next >= chapters.length - 1) setPlaying(false);
    }, STEP_MS);

    return () => clearTimeout(timer);
  }, [playing, index, chapters.length]);

  if (chapters.length === 0 || !active) return null;

  /** Any deliberate jump also stops the automatic walk. */
  const goTo = (next: number) => {
    setPlaying(false);
    setIndex((next + chapters.length) % chapters.length);
  };

  const routePoints = chapters
    .map((chapter) => `${chapter.x},${toPitchY(chapter.y)}`)
    .join(' ');

  return (
    <div className="space-y-6">
      {/* Three ways to move through the same sequence: step one at a time,
          jump straight to a company, or let it walk itself. The pitch is the
          fourth, and none of them is the only way in. */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="chapter-panel flex items-center gap-1 rounded-full p-1">
          <button
            type="button"
            aria-label={ui.career.previousChapter}
            onClick={() => goTo(index - 1)}
            className="text-on-photo flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-background/60 dark:hover:bg-gray-700/60"
          >
            ‹
          </button>
          <span className="text-on-photo font-mono-ui px-2 text-xs whitespace-nowrap">
            {format(ui.career.chapterCounter, { order: String(active.order), total: String(chapters.length) })}
          </span>
          <button
            type="button"
            aria-label={ui.career.nextChapter}
            onClick={() => goTo(index + 1)}
            className="text-on-photo flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-background/60 dark:hover:bg-gray-700/60"
          >
            ›
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            // Restarting from the end would show one frame and stop, so a play
            // that begins at the last chapter rewinds first.
            if (!playing && index >= chapters.length - 1) setIndex(0);
            setPlaying(!playing);
          }}
          className="text-on-photo rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
        >
          {playing ? ui.career.pausePlay : ui.career.playInOrder}
        </button>
      </div>

      {/* The companies by name. The pitch shows the shape of the career; this
          shows who it was with, which is the thing most visitors scan for. */}
      <ol className="flex flex-wrap gap-2">
        {chapters.map((chapter, chapterIndex) => {
          const isActive = chapterIndex === index;
          const played = chapterIndex <= index;
          return (
            <li key={chapter.id}>
              <button
                type="button"
                onClick={() => goTo(chapterIndex)}
                aria-current={isActive ? 'step' : undefined}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/10 text-primary'
                    : played
                      ? 'text-on-photo border-border hover:border-primary/60'
                      : 'text-on-photo border-border opacity-70 hover:border-primary/40 hover:opacity-100'
                }`}
              >
                <span className="font-mono-ui text-xs opacity-60">{chapter.order}</span>
                {chapter.company}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="aspect-[100/64] w-full overflow-hidden rounded-2xl border border-border shadow-sm">
          <SVGPitch className="h-full w-full">
            {/* The whole route, faint, so the shape of the career is visible
                before any chapter is opened. */}
            <polyline
              points={routePoints}
              fill="none"
              stroke="#ffffff"
              strokeOpacity="0.25"
              strokeWidth="0.3"
              strokeDasharray="1.2 1.6"
              strokeLinecap="round"
            />
            {/* The pass that arrived at the current chapter. Literal hex, not a
                Tailwind class: SVG presentation attributes don't reliably
                resolve CSS custom properties, so this mirrors --primary's
                sRGB value directly (specs/009-typography-color-refresh). */}
            {previous && (
              <line
                x1={previous.x}
                y1={toPitchY(previous.y)}
                x2={active.x}
                y2={toPitchY(active.y)}
                stroke="#f65600"
                strokeOpacity="0.85"
                strokeWidth="0.45"
                strokeLinecap="round"
              />
            )}

            {/* One small ball, always present, animated to the active player's
                position. Framer Motion interpolates from wherever it already
                is on the next render, so a mid-flight selection retargets the
                same element rather than queueing a second animation — no
                "previous position" needs to be tracked (research R1, FR-004).
                Visibly smaller than a player dot (r 2.8/3.4) so it never
                reads as another player. Decorative: excluded from the
                accessible tree and from pointer events. */}
            <motion.circle
              data-testid="pitch-ball"
              r={1.4}
              fill="#ffffff"
              stroke="#f65600"
              strokeWidth="0.3"
              className="pointer-events-none"
              animate={{ cx: active.x, cy: toPitchY(active.y) }}
              transition={{ duration: reducedMotion ? 0 : 0.5, ease: 'easeOut' }}
            />

            {chapters.map((chapter, chapterIndex) => {
              const isActive = chapterIndex === index;
              const played = chapterIndex <= index;
              const cy = toPitchY(chapter.y);
              return (
                <g
                  key={chapter.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={format(ui.career.chapterAriaLabel, {
                    order: String(chapter.order),
                    position: ui.career.positions[chapter.position],
                    company: chapter.company,
                    role: chapter.role,
                  })}
                  // `outline-none` (not only `focus-visible:outline-none`) is
                  // what removes the browser-default ring that a click leaves
                  // behind — a click also sets DOM focus on a tabIndex={0}
                  // element, so `focus-visible:` alone would not catch it
                  // (FR-001, research R4).
                  className="focus:outline-none cursor-pointer"
                  onClick={() => goTo(chapterIndex)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      goTo(chapterIndex);
                    }
                  }}
                  onFocus={(event) => {
                    // Only a keyboard-focused player gets the drawn ring — a
                    // pointer click also focuses the element, and that case
                    // must stay ring-free (FR-001).
                    if (event.currentTarget.matches(':focus-visible')) {
                      setFocusedIndex(chapterIndex);
                    }
                  }}
                  onBlur={() => setFocusedIndex((current) => (current === chapterIndex ? null : current))}
                >
                  {/* Deliberate keyboard-focus ring — stroked, outside the
                      halo, distinct from the orange fill so it never reads as
                      the halo itself (FR-001, research R4). */}
                  {focusedIndex === chapterIndex && (
                    <circle
                      cx={chapter.x}
                      cy={cy}
                      r="6.4"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="0.4"
                    />
                  )}
                  {/* Halo on the active player only — the pitch is dark, so a
                      glow reads where a heavier outline would just thicken. */}
                  {isActive && (
                    <circle cx={chapter.x} cy={cy} r="5.4" fill="#f65600" opacity="0.22" />
                  )}
                  <circle
                    cx={chapter.x}
                    cy={cy}
                    r={isActive ? 3.4 : 2.8}
                    fill={isActive ? '#f65600' : played ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.28)'}
                    stroke={isActive ? '#ffffff' : 'rgba(255,255,255,0.5)'}
                    strokeWidth="0.22"
                  />
                  <text
                    x={chapter.x}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="2.2"
                    fontWeight="600"
                    // The active label sits on the #f65600 (--primary) dot, so it
                    // uses --foreground's hex, not white: research R1 measured
                    // white/--primary-foreground at 3.26:1 against --primary,
                    // which fails AA, while --foreground clears 4.83:1.
                    fill={isActive ? '#35190a' : played ? '#12241d' : 'rgba(255,255,255,0.75)'}
                    className="pointer-events-none select-none"
                  >
                    {chapter.order}
                  </text>
                  {/* Abbreviation directly beneath the number, then the
                      shortened company name beneath that — identifies every
                      player without a click (FR-005). Same active/played/
                      unplayed contrast treatment as the number, so legibility
                      degrades together rather than the label going invisible
                      on a dimmed player. Spacing check: FORMATION's x/y are
                      spaced at least 6 units apart on the x-axis within a row
                      and 20+ on the y-axis between rows, which at this font
                      size keeps the two label lines clear of a neighbour's
                      dot and text (FR-006, research R6). */}
                  <text
                    x={chapter.x}
                    y={cy + 3.4}
                    textAnchor="middle"
                    dominantBaseline="hanging"
                    fontSize="1.6"
                    fontWeight="600"
                    fill={isActive ? '#f65600' : played ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)'}
                    className="pointer-events-none select-none"
                  >
                    {chapter.abbreviation}
                  </text>
                  <text
                    x={chapter.x}
                    y={cy + 6.5}
                    textAnchor="middle"
                    dominantBaseline="hanging"
                    fontSize="2.2"
                    fill={isActive ? 'rgba(255,255,255,0.95)' : played ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)'}
                    className="pointer-events-none select-none"
                  >
                    {chapter.displayName}
                  </text>
                </g>
              );
            })}
          </SVGPitch>
        </div>

        <ChapterDetail chapter={active} />
      </div>

      {/* Static, site-authored — not derived from chapter data (FR-007, spec
          Assumptions). One line, distinct from the panel and the controls
          above. */}
      <p className="text-on-photo text-xs opacity-70">{ui.career.tip}</p>
    </div>
  );
}
