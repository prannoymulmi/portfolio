'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { prefersReducedMotion } from '@/lib/utils/animations';

/**
 * What the pill shows at rest — and, just as importantly, what the frame is
 * sized to. FULL_TEXT starts with it, so reverting to rest is a matter of
 * trimming back to this length rather than swapping in a different string.
 */
const BASE_TEXT = 'Built with Claude';

/** Typed out, character by character, start to finish, each cycle. */
const FULL_TEXT = `${BASE_TEXT} — click to see how`;

const TYPE_INTERVAL_MS = 70;

/** How long the finished line sits on screen before snapping back to rest. */
const HOLD_MS = 2000;

type Phase = 'typing' | 'holding' | 'rest';

/**
 * Runs one type -> hold -> revert cycle over FULL_TEXT. The first cycle
 * starts on mount (a page load/reload); after that `triggerCue` — bumped by
 * Hero on every pointer-enter of the pill — starts each subsequent one. A
 * bump is only honoured from 'rest', so re-hovering mid-cycle can neither
 * restart nor extend it.
 *
 * Reverting means trimming charCount back to BASE_TEXT.length rather than
 * clearing it, so the pill lands back on its resting label instead of
 * blanking out first.
 *
 * The rest -> typing kickoff on a cue bump happens during render (comparing
 * against a `prevCue` bit of state) — React's documented pattern for "adjust
 * state when a prop changes" — rather than an effect that calls setState
 * synchronously up front, which an earlier version of this hook did and
 * which tripped the `react-hooks/set-state-in-effect` lint rule. Every other
 * transition below fires from inside a timer callback for the same reason.
 */
function useTypedLine(triggerCue: number): string {
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && prefersReducedMotion());
  const [prevCue, setPrevCue] = useState(triggerCue);
  const [phase, setPhase] = useState<Phase>(reducedMotion ? 'rest' : 'typing');
  const [charCount, setCharCount] = useState(reducedMotion ? BASE_TEXT.length : 0);

  if (triggerCue !== prevCue) {
    setPrevCue(triggerCue);
    if (phase === 'rest' && !reducedMotion) {
      setPhase('typing');
      setCharCount(0);
    }
  }

  useEffect(() => {
    if (phase !== 'typing') return;

    let count = 0;
    const interval = setInterval(() => {
      count += 1;
      setCharCount(count);
      if (count >= FULL_TEXT.length) {
        clearInterval(interval);
        setPhase('holding');
      }
    }, TYPE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'holding') return;

    const timeout = setTimeout(() => {
      setPhase('rest');
      setCharCount(BASE_TEXT.length);
    }, HOLD_MS);

    return () => clearTimeout(timeout);
  }, [phase]);

  return FULL_TEXT.slice(0, charCount);
}

/**
 * The credit pill's label (Hero.tsx). The pill is a fixed frame: an
 * invisible sizer rendering BASE_TEXT holds the width open, and the live
 * line is absolutely positioned on top of it and clipped by
 * `overflow-hidden`, so the button never grows or shrinks as the text
 * changes. Once the typed line outgrows the frame it slides left — the way
 * a terminal scrolls its input rather than wrapping it — keeping the tail
 * and the caret in view.
 *
 * The slide is written straight to `style.transform` from a layout effect
 * rather than held in state: it has to be measured from the DOM after each
 * character lands, and pushing it through setState would mean a second
 * render per keystroke for a value only the DOM consumes.
 *
 * `aria-hidden` on the whole thing — the Link that renders this carries the
 * real accessible name as a static `aria-label`, so screen readers (and
 * tests) read the full sentence immediately instead of racing the typing.
 * This is decoration layered on top of that static name, not the name.
 */
export function CreditPillText({ triggerCue }: { triggerCue: number }) {
  const text = useTypedLine(triggerCue);
  const frameRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const line = lineRef.current;
    if (!frame || !line) return;

    // offsetWidth is the untransformed layout width, so this stays correct
    // no matter what translate the previous tick left behind.
    const overflow = frame.clientWidth - line.offsetWidth;
    line.style.transform = `translateX(${Math.min(0, overflow)}px)`;
  }, [text]);

  return (
    <span aria-hidden="true" className="inline-flex items-center gap-1 whitespace-nowrap">
      <span className="opacity-70">{'>_'}</span>
      <span ref={frameRef} className="relative inline-block overflow-hidden">
        {/* Sizer: never animates, never visible — it exists only to hold the
            frame open at its resting width. It mirrors the live line below
            structurally, caret included: sizing to the bare text would leave
            the frame narrower than the resting line by the caret and its
            margin, and the shift below would then slide that difference off
            the left edge, clipping the first letter. */}
        <span className="invisible flex items-center">
          {BASE_TEXT}
          <span className="ml-1 inline-block h-3 w-px shrink-0" />
        </span>
        <span ref={lineRef} className="absolute inset-y-0 left-0 flex items-center">
          {text}
          <span className="bg-primary ml-1 inline-block h-3 w-px shrink-0 animate-blink-caret" />
        </span>
      </span>
      {/* Always rendered, never conditional on phase: showing it only when
          the typing settled would change the pill's width mid-cycle, which
          is the one thing this frame exists to prevent. */}
      <svg
        className="h-3 w-3 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7 17L17 7" />
        <path d="M7 7h10v10" />
      </svg>
    </span>
  );
}
