'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '@/lib/utils/animations';

gsap.registerPlugin(ScrollTrigger);

interface PlayerAnimationProps {
  experiences: Array<{ id: string; title: string }>;
  containerSelector: string; // CSS selector for the Career section container
}

// Hook to setup GSAP ScrollTrigger animation for player on pitch
// Called from CareerJourney component
export function usePlayerAnimation(
  playerRef: React.RefObject<SVGGElement>,
  containerSelector: string,
  isEnabled: boolean,
) {
  useEffect(() => {
    if (!playerRef.current || !isEnabled || prefersReducedMotion()) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    // Animate player Y position based on scroll within Career section
    // Maps container scroll range to pitch Y-axis (0-100)
    const trigger = ScrollTrigger.create({
      trigger: container,
      start: 'top center',
      end: 'bottom center',
      onUpdate: (self) => {
        // Map progress (0-1) to pitch Y range (10-90, leaving margins)
        const yPosition = 10 + self.progress * 80;
        gsap.set(playerRef.current, { attr: { y: yPosition } });
      },
      markers: false,
    });

    return () => {
      trigger.kill();
    };
  }, [playerRef, containerSelector, isEnabled]);
}

interface PlayerSVGProps {
  y: number;
  ref?: React.RefObject<SVGGElement>;
}

// SVG player group to render on pitch
// Usage: <PlayerSVG ref={playerRef} y={currentY} />
export const PlayerSVG = React.forwardRef<SVGGElement, PlayerSVGProps>(({ y }, ref) => {
  return (
    <g ref={ref} y={y} className="transition-transform duration-300">
      {/* Player circle (blue jersey) */}
      <circle cx="50" cy="50" r="3" fill="#3b82f6" />
      {/* Jersey number (10) */}
      <text x="50" y="52" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">
        10
      </text>
      {/* Player outline */}
      <circle cx="50" cy="50" r="3" fill="none" stroke="white" strokeWidth="0.2" />
      {/* Head indicator */}
      <circle cx="50" cy="43" r="1.2" fill="#fdbcb4" strokeWidth="0.15" stroke="white" />
    </g>
  );
});
