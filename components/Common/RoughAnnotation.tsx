'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useTheme } from 'next-themes';
import { prefersReducedMotion } from '@/lib/utils/animations';

export type AnnotationType = 'highlight' | 'circle' | 'underline' | 'box' | 'bracket';

interface RoughAnnotationProps {
  children: ReactNode;
  type: AnnotationType;
  /** Delay before drawing, in ms — lets a group of marks draw in sequence. */
  delay?: number;
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
export function RoughAnnotation({ children, type, delay = 0 }: RoughAnnotationProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let cancelled = false;
    let annotation: { show: () => void; remove: () => void } | undefined;
    let observer: ResizeObserver | undefined;

    const draw = async () => {
      // rough-notation measures layout, so it can only run in the browser.
      const { annotate } = await import('rough-notation');
      if (cancelled) return;

      annotation?.remove();
      annotation = annotate(element, {
        type,
        color: markColor(type, resolvedTheme === 'dark'),
        animate: !prefersReducedMotion(),
        animationDuration: 700,
        strokeWidth: 2,
        iterations: 2,
        multiline: true,
      });
      annotation.show();
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

      await draw();

      // Redraw when the element's box changes — resize, orientation change, or
      // text reflowing onto a different number of lines.
      if (cancelled) return;
      observer = new ResizeObserver(() => void draw());
      observer.observe(element);
    };

    void start();

    return () => {
      cancelled = true;
      observer?.disconnect();
      annotation?.remove();
    };
  }, [type, delay, resolvedTheme]);

  return (
    <span ref={ref} className="relative inline-block">
      {children}
    </span>
  );
}
