'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { prefersReducedMotion } from '@/lib/utils/motion';

export type AnnotationType = 'highlight' | 'circle' | 'underline' | 'box' | 'bracket';

interface RoughAnnotationProps {
  children: ReactNode;
  type: AnnotationType;
  /** Delay before drawing, in ms — lets a group of marks draw in sequence. */
  delay?: number;
  /**
   * Overrides the default palette. The caller owns contrast when it sets this:
   * for `highlight` the colour becomes the text's background, so it must clear
   * WCAG AA against whatever text sits on top.
   */
  color?: string;
  /** Multiplier on the mark's thickness relative to the text box. */
  padding?: number;
}

// `highlight` fills the box behind the glyphs, so its colour becomes the text's
// effective background and must stay pale — a saturated blue-600 fill measured
// 2.84:1 against the body text, well under WCAG AA. The outline marks (circle,
// underline, box, bracket) don't sit behind glyphs, so they can be saturated.
const FILL_COLOR = { light: '#fef08a', dark: '#1e3a8a' } as const;
const STROKE_COLOR = { light: '#2563eb', dark: '#60a5fa' } as const;

function markColor(type: AnnotationType, isDark: boolean): string {
  const palette = type === 'highlight' ? FILL_COLOR : STROKE_COLOR;
  return isDark ? palette.dark : palette.light;
}

/**
 * Draws a hand-drawn mark over its children.
 *
 * The children always render as plain text — the annotation is emphasis, not
 * the carrier of meaning, so a failure to draw degrades to normal text.
 * See docs/adr/0009-rough-notation-third-animation-library.md
 */
export function RoughAnnotation({
  children,
  type,
  delay = 0,
  color,
  padding,
}: RoughAnnotationProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let cancelled = false;
    let annotation: { show: () => void; remove: () => void } | undefined;
    let elementObserver: ResizeObserver | undefined;
    let layoutObserver: ResizeObserver | undefined;
    let lastRect = '';
    let hasDrawn = false;

    const draw = async (force = false) => {
      if (cancelled) return;

      // rough-notation draws an absolutely-positioned SVG from the element's
      // measured rect, so a redraw is only needed when that rect actually
      // moved or resized. Comparing first keeps observer churn from
      // re-triggering the draw animation on every unrelated layout tick.
      const { top, left, width, height } = element.getBoundingClientRect();
      const rect = `${Math.round(top + window.scrollY)}:${Math.round(left + window.scrollX)}:${Math.round(width)}:${Math.round(height)}`;
      if (!force && hasDrawn && rect === lastRect) return;
      if (width === 0 || height === 0) return;
      lastRect = rect;

      const { annotate } = await import('rough-notation');
      if (cancelled) return;

      annotation?.remove();
      annotation = annotate(element, {
        type,
        color: color ?? markColor(type, resolvedTheme === 'dark'),
        // Only the very first draw animates; later redraws are corrections
        // after a layout shift and should land silently.
        animate: !hasDrawn && !prefersReducedMotion(),
        animationDuration: 700,
        strokeWidth: 2,
        iterations: 2,
        multiline: true,
        ...(padding !== undefined ? { padding } : {}),
      });
      annotation.show();
      hasDrawn = true;
    };

    const start = async () => {
      // A late web-font swap changes text metrics, which would strand a mark
      // drawn against the fallback font's box.
      if (typeof document !== 'undefined' && document.fonts?.ready) {
        await document.fonts.ready;
      }
      if (cancelled) return;

      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        if (cancelled) return;
      }

      await draw(true);
      if (cancelled) return;

      // The element's own box catches reflow onto more lines...
      elementObserver = new ResizeObserver(() => void draw());
      elementObserver.observe(element);

      // ...but the common failure is the element being pushed *down* by
      // content loading above it, which leaves its own size unchanged. Watch
      // the document too, and compare rects before redrawing.
      layoutObserver = new ResizeObserver(() => void draw());
      layoutObserver.observe(document.documentElement);

      window.addEventListener('load', onLoad);
    };

    const onLoad = () => void draw();

    void start();

    return () => {
      cancelled = true;
      window.removeEventListener('load', onLoad);
      elementObserver?.disconnect();
      layoutObserver?.disconnect();
      annotation?.remove();
    };
  }, [type, delay, resolvedTheme, color, padding]);

  return (
    <span ref={ref} className="relative inline-block">
      {children}
    </span>
  );
}
