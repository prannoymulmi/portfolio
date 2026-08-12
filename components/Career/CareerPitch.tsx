'use client';

import { useEffect, useState } from 'react';
import type { Experience } from '@/lib/types/portfolio';
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
  const chapters = toChapters(experiences);
  const [index, setIndex] = useState(() => Math.max(0, chapters.length - 1));
  const [playing, setPlaying] = useState(false);

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
            aria-label="Previous chapter"
            onClick={() => goTo(index - 1)}
            className="text-on-photo flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/60 dark:hover:bg-gray-700/60"
          >
            ‹
          </button>
          <span className="text-on-photo px-2 font-mono text-xs whitespace-nowrap">
            Chapter {active.order} / {chapters.length}
          </span>
          <button
            type="button"
            aria-label="Next chapter"
            onClick={() => goTo(index + 1)}
            className="text-on-photo flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/60 dark:hover:bg-gray-700/60"
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
          className="text-on-photo rounded-full border border-gray-400/60 px-4 py-2 text-sm font-medium transition-colors hover:border-[#f2540d]"
        >
          {playing ? '❚❚ Pause the play' : '▶ Play in order'}
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
                    ? 'border-[#f2540d] bg-[#f2540d]/10 text-[#f2540d]'
                    : played
                      ? 'text-on-photo border-gray-400/60 hover:border-[#f2540d]/60'
                      : 'text-on-photo border-gray-400/40 opacity-70 hover:border-[#f2540d]/40 hover:opacity-100'
                }`}
              >
                <span className="font-mono text-xs opacity-60">{chapter.order}</span>
                {chapter.company}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
        <div className="aspect-[100/64] w-full overflow-hidden rounded-2xl border border-gray-400/30 shadow-sm">
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
            {/* The pass that arrived at the current chapter. */}
            {previous && (
              <line
                x1={previous.x}
                y1={toPitchY(previous.y)}
                x2={active.x}
                y2={toPitchY(active.y)}
                stroke="#f2540d"
                strokeOpacity="0.85"
                strokeWidth="0.45"
                strokeLinecap="round"
              />
            )}

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
                  aria-label={`Chapter ${chapter.order}: pass to ${chapter.position} — ${chapter.company}, ${chapter.role}`}
                  className="cursor-pointer"
                  onClick={() => goTo(chapterIndex)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      goTo(chapterIndex);
                    }
                  }}
                >
                  {/* Halo on the active player only — the pitch is dark, so a
                      glow reads where a heavier outline would just thicken. */}
                  {isActive && (
                    <circle cx={chapter.x} cy={cy} r="5.4" fill="#f2540d" opacity="0.22" />
                  )}
                  <circle
                    cx={chapter.x}
                    cy={cy}
                    r={isActive ? 3.4 : 2.8}
                    fill={isActive ? '#f2540d' : played ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.28)'}
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
                    fill={isActive ? '#ffffff' : played ? '#12241d' : 'rgba(255,255,255,0.75)'}
                    className="pointer-events-none select-none"
                  >
                    {chapter.order}
                  </text>
                </g>
              );
            })}
          </SVGPitch>
        </div>

        <ChapterDetail chapter={active} />
      </div>
    </div>
  );
}
