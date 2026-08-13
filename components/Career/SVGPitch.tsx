'use client';

import React from 'react';

/**
 * The pitch is drawn in a 100 x PITCH_HEIGHT viewBox — a real pitch is wider
 * than it is tall, and the previous square one letterboxed inside any sensible
 * layout box. Chapter coordinates are kept in clean 0-100 percent space and
 * scaled onto this by the caller.
 */
export const PITCH_HEIGHT = 64;

interface SVGPitchProps {
  children?: React.ReactNode;
  className?: string;
}

const LINE = 'rgba(255, 255, 255, 0.22)';
const LINE_WIDTH = 0.25;

/**
 * A modern, quiet pitch.
 *
 * What this replaced filled the frame with #2d5016 astroturf green and drew
 * every marking in solid white at full strength — a clip-art pitch that fought
 * the warm photographic surface behind it and shouted louder than the career
 * chapters standing on it. The markings are the weakest thing here now: deep
 * ink ground, one soft warm bloom, mowing stripes at 3% and lines at 22%, so
 * the pitch reads as a surface and the players read as the content.
 */
export function SVGPitch({ children, className = '' }: SVGPitchProps) {
  const midX = 50;
  const midY = PITCH_HEIGHT / 2;
  const inset = 3;
  const penaltyDepth = 13;
  const penaltyHeight = 30;
  const goalDepth = 5;
  const goalHeight = 14;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 100 ${PITCH_HEIGHT}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        role="presentation"
      >
        <defs>
          {/* Deep ink rather than grass: it sits under a warm photograph, and a
              saturated green is the one colour that cannot share a page with
              it. */}
          <linearGradient id="pitch-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#12241d" />
            <stop offset="100%" stopColor="#0a1712" />
          </linearGradient>
          {/* --primary's sRGB value (specs/009-typography-color-refresh), not a
              literal pick — SVG presentation attributes don't reliably resolve
              CSS custom properties. */}
          <radialGradient id="pitch-bloom" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#f65600" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#f65600" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="100" height={PITCH_HEIGHT} fill="url(#pitch-ground)" />

        {/* Mowing stripes — barely there, but they stop the ground reading as
            a flat rectangle. */}
        {Array.from({ length: 8 }).map((_, index) => (
          <rect
            key={index}
            x={(index * 100) / 8}
            y="0"
            width={100 / 16}
            height={PITCH_HEIGHT}
            fill="#ffffff"
            opacity="0.03"
          />
        ))}

        <rect width="100" height={PITCH_HEIGHT} fill="url(#pitch-bloom)" />

        <g stroke={LINE} strokeWidth={LINE_WIDTH} fill="none">
          <rect
            x={inset}
            y={inset}
            width={100 - inset * 2}
            height={PITCH_HEIGHT - inset * 2}
            rx="1.5"
          />
          <line x1={midX} y1={inset} x2={midX} y2={PITCH_HEIGHT - inset} />
          <circle cx={midX} cy={midY} r="8.5" />

          {/* Penalty and goal areas, both ends. */}
          <rect
            x={inset}
            y={midY - penaltyHeight / 2}
            width={penaltyDepth}
            height={penaltyHeight}
          />
          <rect x={inset} y={midY - goalHeight / 2} width={goalDepth} height={goalHeight} />
          <rect
            x={100 - inset - penaltyDepth}
            y={midY - penaltyHeight / 2}
            width={penaltyDepth}
            height={penaltyHeight}
          />
          <rect
            x={100 - inset - goalDepth}
            y={midY - goalHeight / 2}
            width={goalDepth}
            height={goalHeight}
          />
        </g>

        <circle cx={midX} cy={midY} r="0.55" fill={LINE} />

        {children}
      </svg>
    </div>
  );
}
