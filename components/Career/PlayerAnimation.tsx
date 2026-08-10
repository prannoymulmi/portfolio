'use client';

import React, { useEffect } from 'react';
import { prefersReducedMotion } from '@/lib/utils/motion';

interface PlayerAnimationProps {
  experiences: Array<{ id: string; title: string }>;
  containerSelector: string;
}

// Sets up a GSAP ScrollTrigger that maps container scroll progress
// to the player's Y position on the pitch. GSAP is loaded lazily
// so it isn't in the initial /career bundle.
export function usePlayerAnimation(
  playerRef: React.RefObject<SVGGElement>,
  containerSelector: string,
  isEnabled: boolean,
) {
  useEffect(() => {
    if (!playerRef.current || !isEnabled || prefersReducedMotion()) return;

    const container = document.querySelector(containerSelector);
    if (!container) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const gsapModule = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      const gsap = gsapModule.default;
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const trigger = ScrollTrigger.create({
        trigger: container,
        start: 'top center',
        end: 'bottom center',
        onUpdate: (self) => {
          const yPosition = 10 + self.progress * 80;
          gsap.set(playerRef.current, { attr: { y: yPosition } });
        },
        markers: false,
      });

      cleanup = () => trigger.kill();
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [playerRef, containerSelector, isEnabled]);
}

interface PlayerSVGProps {
  y: number;
  ref?: React.RefObject<SVGGElement>;
}

export const PlayerSVG = React.forwardRef<SVGGElement, PlayerSVGProps>(({ y }, ref) => {
  return (
    <g ref={ref} y={y} className="transition-transform duration-300">
      <circle cx="50" cy="50" r="3" fill="#3b82f6" />
      <text x="50" y="52" textAnchor="middle" fontSize="2" fill="white" fontWeight="bold">
        10
      </text>
      <circle cx="50" cy="50" r="3" fill="none" stroke="white" strokeWidth="0.2" />
      <circle cx="50" cy="43" r="1.2" fill="#fdbcb4" strokeWidth="0.15" stroke="white" />
    </g>
  );
});
