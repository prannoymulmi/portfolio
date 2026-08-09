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
      {/* Parallax Background Layer */}
      <motion.div
        style={{ y, willChange: 'transform' }}
        className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-blue-100 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800"
        aria-hidden="true"
      />

      {/* Content Layer */}
      {children}
    </div>
  );
}
