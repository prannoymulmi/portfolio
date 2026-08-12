'use client';

import React, { useMemo } from 'react';

interface SVGPitchProps {
  children?: React.ReactNode;
  className?: string;
}

export function SVGPitch({ children, className = '' }: SVGPitchProps) {
  const pitchDimensions = useMemo(
    () => ({
      width: 100,
      height: 100,
      penaltyBoxWidth: 16.5,
      penaltyBoxHeight: 40.32,
      goalBoxWidth: 5.5,
      goalBoxHeight: 18.32,
      centerSpotRadius: 0.15,
      centerCircleRadius: 9.15,
    }),
    [],
  );

  // Calculate responsive positions based on pitch dimensions
  const penaltyBoxX = (pitchDimensions.width - pitchDimensions.penaltyBoxWidth) / 2;
  const goalBoxX = (pitchDimensions.width - pitchDimensions.goalBoxWidth) / 2;
  const centerY = pitchDimensions.height / 2;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        viewBox={`0 0 ${pitchDimensions.width} ${pitchDimensions.height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="presentation"
        aria-label="Football pitch for career timeline"
      >
        {/* Pitch background (grass green) */}
        <rect
          width={pitchDimensions.width}
          height={pitchDimensions.height}
          fill="#2d5016"
          className="dark:fill-green-900"
        />

        {/* Pitch border */}
        <rect
          width={pitchDimensions.width}
          height={pitchDimensions.height}
          fill="none"
          stroke="white"
          strokeWidth="0.15"
        />

        {/* Halfway line (vertical) */}
        <line
          x1={pitchDimensions.width / 2}
          y1="0"
          x2={pitchDimensions.width / 2}
          y2={pitchDimensions.height}
          stroke="white"
          strokeWidth="0.08"
        />

        {/* Center circle */}
        <circle
          cx={pitchDimensions.width / 2}
          cy={centerY}
          r={pitchDimensions.centerCircleRadius}
          fill="none"
          stroke="white"
          strokeWidth="0.08"
        />

        {/* Center spot */}
        <circle
          cx={pitchDimensions.width / 2}
          cy={centerY}
          r={pitchDimensions.centerSpotRadius}
          fill="white"
        />

        {/* Left penalty box */}
        <rect
          x="0"
          y={penaltyBoxX}
          width={pitchDimensions.penaltyBoxWidth}
          height={pitchDimensions.penaltyBoxHeight}
          fill="none"
          stroke="white"
          strokeWidth="0.08"
        />

        {/* Left goal box */}
        <rect
          x="0"
          y={goalBoxX}
          width={pitchDimensions.goalBoxWidth}
          height={pitchDimensions.goalBoxHeight}
          fill="none"
          stroke="white"
          strokeWidth="0.08"
        />

        {/* Right penalty box */}
        <rect
          x={pitchDimensions.width - pitchDimensions.penaltyBoxWidth}
          y={penaltyBoxX}
          width={pitchDimensions.penaltyBoxWidth}
          height={pitchDimensions.penaltyBoxHeight}
          fill="none"
          stroke="white"
          strokeWidth="0.08"
        />

        {/* Right goal box */}
        <rect
          x={pitchDimensions.width - pitchDimensions.goalBoxWidth}
          y={goalBoxX}
          width={pitchDimensions.goalBoxWidth}
          height={pitchDimensions.goalBoxHeight}
          fill="none"
          stroke="white"
          strokeWidth="0.08"
        />

        {/* Left goal line circle */}
        <circle
          cx="0"
          cy={centerY}
          r={pitchDimensions.centerSpotRadius}
          fill="white"
        />

        {/* Right goal line circle */}
        <circle
          cx={pitchDimensions.width}
          cy={centerY}
          r={pitchDimensions.centerSpotRadius}
          fill="white"
        />

        {/* Yard line markers (every 10 yards = ~9.14m on 100m pitch) */}
        {[10, 20, 30, 40, 50, 60, 70, 80, 90].map((yardLine) => {
          const xPos = (yardLine / 100) * pitchDimensions.width;
          return (
            <line
              key={`yard-${yardLine}`}
              x1={xPos}
              y1={centerY - 1}
              x2={xPos}
              y2={centerY + 1}
              stroke="white"
              strokeWidth="0.05"
              opacity="0.5"
            />
          );
        })}

        {/* Content placeholder for career milestones */}
        {children}
      </svg>
    </div>
  );
}
