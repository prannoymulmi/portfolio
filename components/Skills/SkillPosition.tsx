'use client';

import React from 'react';

interface SkillPositionProps {
  x: number;
  y: number;
  skillName: string;
  category: string;
  position?: string;
  isSelected: boolean;
  onClick: () => void;
}

export function SkillPosition({
  x,
  y,
  skillName,
  category,
  position,
  isSelected,
  onClick,
}: SkillPositionProps) {
  const radius = isSelected ? 2.5 : 2;
  const fillColor = isSelected ? '#2563eb' : '#3b82f6';
  const strokeWidth = isSelected ? '0.2' : '0.15';

  return (
    <g
      className="cursor-pointer transition-all"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      aria-label={`${skillName} skill at ${position || 'unknown'} position. Category: ${category}`}
      aria-pressed={isSelected}
    >
      {/* Outer circle (selection indicator) */}
      {isSelected && (
        <circle
          cx={x}
          cy={y}
          r={radius + 0.8}
          fill="none"
          stroke="#2563eb"
          strokeWidth="0.15"
          opacity="0.3"
        />
      )}

      {/* Main skill circle */}
      <circle cx={x} cy={y} r={radius} fill={fillColor} stroke="white" strokeWidth={strokeWidth} />

      {/* Skill initial or badge */}
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="1.2"
        fontWeight="bold"
        fill="white"
        className="pointer-events-none select-none"
      >
        {skillName.charAt(0).toUpperCase()}
      </text>

      {/* Hover tooltip (only on desktop) */}
      {isSelected && (
        <g className="pointer-events-none">
          {/* Tooltip background */}
          <rect x={x - 8} y={y - 6} width="16" height="5.5" rx="0.5" fill="rgba(0, 0, 0, 0.8)" />
          {/* Tooltip text */}
          <text
            x={x}
            y={y - 2}
            textAnchor="middle"
            fontSize="0.8"
            fill="white"
            fontWeight="500"
            className="pointer-events-none select-none"
          >
            {skillName}
          </text>
        </g>
      )}
    </g>
  );
}
