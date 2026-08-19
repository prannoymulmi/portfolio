'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { TechnologyUsage } from '@/lib/utils/techDuration';
import { formatDuration, barWidthClass } from '@/lib/utils/techDuration';
import { prefersReducedMotion } from '@/lib/utils/animations';
import { useLocale, useUi } from '@/components/Common/LocaleProvider';
import { displayDateText } from '@/lib/i18n/displayDateText';

interface TechnologyDetailProps {
  usage: TechnologyUsage;
}

/**
 * The sticky detail panel: what the selected technology is, how long it's
 * been used, and where. `aria-live="polite"` so a screen-reader user hears
 * the panel change when they Tab to a different row (FR-003, FR-009) — hover
 * is never required to reach this content.
 */
export function TechnologyDetail({ usage }: TechnologyDetailProps) {
  const { name, category, note, totalMonths, level, roles } = usage;
  const { locale } = useLocale();
  const ui = useUi();
  const duration = formatDuration(totalMonths, locale, ui.technologies.units);

  // Read once during the first render, not in an effect — see
  // TechnologyList's identical comment for why.
  const [reduced] = useState(() => typeof window !== 'undefined' && prefersReducedMotion());

  return (
    // The outer element stays mounted across selection changes so
    // aria-live="polite" keeps announcing updates; only the content inside
    // cross-fades (AnimatePresence needs a stable host to animate within).
    // `chapter-panel` is the one surface a chapter may raise above the photo
    // scrim (ADR 0015) — the same translucent card `ChapterDetail.tsx` and
    // `ProjectDetailModal.tsx` use, rather than a one-off `bg-card`/`border`
    // combination invented for this panel alone.
    <div aria-live="polite" className="chapter-panel sticky top-24 rounded-2xl p-6 lg:p-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={name}
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduced ? 1 : 0 }}
          transition={{ duration: reduced ? 0 : 0.15 }}
        >
          <p className="label-mono text-primary text-xs">{category}</p>
          {/* font-display named explicitly, matching the reference's
              equivalent name treatment — see TechnologiesChapter's heading
              comment for why this is stated rather than left implicit. */}
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{name}</h3>

          {/* Duration and level are omitted entirely when totalMonths is
              null — spec Edge Cases: a technology with no traceable history
              must not show a fabricated "0" duration or level. */}
          {duration && (
            <p className="text-on-photo mt-3 text-sm">
              <span className="font-mono-ui font-semibold">{duration}</span>
              {level && <span className="ml-2">&middot; {ui.technologies.levels[level]}</span>}
            </p>
          )}

          {/* Decorative — the duration above already carries the
              information as text, so the bar is aria-hidden rather than
              announced twice. One rounded, gradient-filled track, matching
              the list rows' bar language — the width class is one of a
              fixed, literal lookup, never an interpolated string
              (research R-006). */}
          <div aria-hidden="true" className="bg-border mt-3 h-2 w-full overflow-hidden rounded-full">
            <div
              className={`from-primary to-accent h-full rounded-full bg-gradient-to-r ${barWidthClass(totalMonths)}`}
            />
          </div>

          <p className="text-on-photo mt-5 text-sm leading-relaxed">{note}</p>

          {roles.length > 0 && (
            <div className="border-border mt-6 border-t pt-4">
              <p className="label-mono text-muted-foreground text-xs">{ui.technologies.whereItWasUsed}</p>
              <ul className="mt-3 space-y-2">
                {roles.map((role) => (
                  <li key={`${role.title}-${role.employer}`} className="text-on-photo text-sm">
                    <span className="font-medium">{role.title}</span>
                    <span className="text-muted-foreground"> &middot; {role.employer}</span>
                    <span className="text-muted-foreground block text-xs">
                      {displayDateText(role.dateText, ui.career.present)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
