'use client';

import { useEffect, useState } from 'react';
import type { Experience } from '@/lib/types/portfolio';
import { SVGPitch } from './SVGPitch';
import { ChapterDetail } from './ChapterDetail';
import { toChapters } from './chapters';

/** How long each chapter holds the ball when the play runs itself. */
const STEP_MS = 2600;

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
    if (!playing) return;

    // The walk ends at the newest chapter rather than looping: it is a career,
    // not a carousel.
    if (index >= chapters.length - 1) {
      setPlaying(false);
      return;
    }

    const timer = setTimeout(() => setIndex((current) => current + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [playing, index, chapters.length]);

  if (chapters.length === 0 || !active) return null;

  const routePoints = chapters.map((chapter) => `${chapter.x},${chapter.y}`).join(' ');

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => {
          // Restarting from the end would show one frame and stop, so a play
          // that begins at the last chapter rewinds first.
          if (!playing && index >= chapters.length - 1) setIndex(0);
          setPlaying(!playing);
        }}
        className="text-on-photo rounded-full border border-gray-400/60 px-4 py-2 font-mono text-xs transition-colors hover:border-[#f2540d]"
      >
        {playing ? '❚❚ Pause the play' : '▶ Play in order'}
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-start">
        {/* Square, matching SVGPitch's 100x100 viewBox: a wider box letterboxes
            the pitch and leaves bare bands inside the border. */}
        <div className="aspect-square w-full overflow-hidden rounded-2xl border border-gray-400/40">
          <SVGPitch className="h-full w-full">
            {/* The whole route, faint, so the shape of the career is visible
                before any chapter is opened. */}
            <polyline
              points={routePoints}
              fill="none"
              stroke="white"
              strokeOpacity="0.35"
              strokeWidth="0.4"
              strokeDasharray="1.5 1.5"
            />
            {/* The pass that arrived at the current chapter. */}
            {previous && (
              <line
                x1={previous.x}
                y1={previous.y}
                x2={active.x}
                y2={active.y}
                stroke="white"
                strokeOpacity="0.9"
                strokeWidth="0.5"
              />
            )}

            {chapters.map((chapter) => {
              const isActive = chapter.id === active.id;
              const played = chapter.order <= active.order;
              return (
                <g
                  key={chapter.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`Chapter ${chapter.order}: pass to ${chapter.position} — ${chapter.company}, ${chapter.role}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setPlaying(false);
                    setIndex(chapters.findIndex((c) => c.id === chapter.id));
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setPlaying(false);
                      setIndex(chapters.findIndex((c) => c.id === chapter.id));
                    }
                  }}
                >
                  <circle
                    cx={chapter.x}
                    cy={chapter.y}
                    r={isActive ? 4 : 3.2}
                    fill={isActive ? '#f2540d' : played ? '#ffffff' : 'rgba(255,255,255,0.45)'}
                    stroke="white"
                    strokeWidth="0.3"
                  />
                  <text
                    x={chapter.x}
                    y={chapter.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="2.6"
                    fontWeight="bold"
                    fill={isActive ? '#ffffff' : '#1f2937'}
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
