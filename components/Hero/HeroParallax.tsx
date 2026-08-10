'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface HeroParallaxProps {
  children: ReactNode;
}

export function HeroParallax({ children }: HeroParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const y = useTransform(scrollY, [0, 500], [0, prefersReducedMotion ? 0 : 250]);

  return (
    <div ref={containerRef} className="relative overflow-hidden">
      {/* Parallax Background Layer.
          Overscanned top and bottom so the layer still covers the section once
          the scroll transform has pushed it down. */}
      <motion.div
        style={{ y, willChange: 'transform' }}
        className="pointer-events-none absolute inset-x-0 -top-[15%] -z-10 h-[130%] bg-gray-900"
        aria-hidden="true"
      >
        {/* The sunset photo is the page's light theme. In dark mode it stays
            as a low ember behind the near-black, rather than disappearing. */}
        <div
          className="h-full w-full bg-cover bg-center opacity-100 dark:opacity-40"
          style={{ backgroundImage: "url('/images/normal.jpg')" }}
        />
      </motion.div>

      {/* Content Layer */}
      {children}
    </div>
  );
}
