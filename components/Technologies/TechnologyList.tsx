'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import type { TechnologyUsage } from '@/lib/utils/techDuration';
import { formatDuration, barWidthClass } from '@/lib/utils/techDuration';
import { prefersReducedMotion } from '@/lib/utils/animations';

// Read once during the first render, not in an effect — an effect runs
// after the first paint, so a visitor who asked for reduced motion would
// still see one frame of the staggered entrance before it turned off.
function useReducedMotionOnce(): boolean {
  const [reduced] = useState(() => typeof window !== 'undefined' && prefersReducedMotion());
  return reduced;
}

/**
 * How many rows get a staggered delay before the delay is clamped flat —
 * without this a long "All" list would leave the last rows visibly lagging
 * behind the category buttons above them.
 */
const MAX_STAGGERED_ROWS = 12;

/**
 * `hasEntered` is an explicit, per-row `initial`/`animate` prop rather than
 * `variants` inherited from an ancestor's `whileInView` — see the bug this
 * replaced, documented at the call site. `index` recreates the visual stagger
 * without relying on parent-orchestrated `staggerChildren`, which requires
 * exactly the inherited-variant mechanism being avoided here.
 */
function rowMotionProps(reduced: boolean, hasEntered: boolean, index: number) {
  if (reduced) {
    return { initial: false as const, animate: { opacity: 1, y: 0 }, transition: { duration: 0 } };
  }
  return {
    initial: false as const,
    animate: hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    transition: { duration: 0.3, delay: Math.min(index, MAX_STAGGERED_ROWS) * 0.04 },
  };
}

interface TechnologyListProps {
  usages: TechnologyUsage[];
  activeTechName: string;
  onSelect: (name: string) => void;
}

/**
 * The filterable list of selectable technology rows. Each row is a real
 * `<button type="button">` reachable by Tab, so hover is never required to
 * reach the detail it drives (FR-003, FR-009) — `onMouseEnter`, `onFocus`,
 * and `onClick` all set the same active technology, and `onClick` is what
 * gives a tap on a touch device the identical result a mouse hover would
 * (spec Edge Cases).
 */
export function TechnologyList({ usages, activeTechName, onSelect }: TechnologyListProps) {
  const reduced = useReducedMotionOnce();

  // `useInView` (`once: true`) rather than `whileInView`'s built-in viewport
  // trigger driving `variants` inherited by children: a `motion.li` that is
  // filtered out (category switch) and later filtered back in is a brand-new
  // component instance with a brand-new key — React remounts it, it does not
  // resurrect the old one. `whileInView`'s trigger fires once and disconnects,
  // and a child mounting afterward never receives the "become visible" signal
  // that inherited variants depend on, so it renders stuck at its `hidden`
  // opacity forever (reproduced by mounting the same technology under two
  // different category filters and inspecting computed opacity — see
  // TechnologyList.test.tsx).
  //
  // `hasEntered` below is `useInView`'s own returned boolean, not a second,
  // separately-latched state: with `once: true` that boolean already flips
  // `false` -> `true` exactly once and then never resets (the hook's internal
  // "leave view" branch is skipped once `once` is set), so it already *is*
  // the monotonic "has this list ever entered view" flag this fix needs — no
  // extra `useState`/`useEffect` pair required to shadow it.
  //
  // The fix passes it down as an explicit prop and gives every row its own
  // `initial`/`animate` (rowMotionProps) instead of inherited `variants` — a
  // row mounting after `hasEntered` is already `true` renders directly at
  // full opacity with no dependency on any observer having fired for that
  // specific element.
  const ref = useRef<HTMLUListElement>(null);
  const hasEntered = useInView(ref, { once: true, amount: 0.2 });

  return (
    <ul ref={ref} aria-label="Technologies" className="divide-border divide-y">
      {usages.map((usage, index) => {
        const isActive = usage.name === activeTechName;
        const duration = formatDuration(usage.totalMonths);

        return (
          <motion.li key={usage.name} {...rowMotionProps(reduced, hasEntered, index)}>
            <button
              type="button"
              aria-current={isActive || undefined}
              onMouseEnter={() => onSelect(usage.name)}
              onFocus={() => onSelect(usage.name)}
              onClick={() => onSelect(usage.name)}
              className={`focus-visible:ring-primary flex w-full flex-col gap-2 rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                isActive ? 'bg-primary/10 shadow-glow' : 'hover:bg-card/60'
              }`}
            >
              <span className="flex items-baseline justify-between gap-4">
                <span className="font-display font-semibold tracking-tight">{usage.name}</span>
                {duration && (
                  <span className="font-mono-ui text-muted-foreground text-xs">{duration}</span>
                )}
              </span>
              {/* Decorative — duration above already carries the
                  information as text, so the bar is aria-hidden. One
                  rounded, gradient-filled track rather than discrete cells
                  (matches the detail panel's depth bar), drawn without any
                  inline style or interpolated class string: the width class
                  is one of a fixed, literal lookup (research R-006). */}
              <span aria-hidden="true" className="bg-border block h-1.5 w-full overflow-hidden rounded-full">
                <span
                  className={`from-primary to-accent block h-full rounded-full bg-gradient-to-r ${barWidthClass(usage.totalMonths)}`}
                />
              </span>
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
