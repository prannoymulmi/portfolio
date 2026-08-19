'use client';

import type { ReactNode } from 'react';
import { useUi } from '@/components/Common/LocaleProvider';
import type { Ui } from '@/lib/i18n/uiSchema';

interface ChapterProps {
  id: string;
  label: string;
  className?: string;
  children: ReactNode;
}

/**
 * Resolves a landmark's locale-aware aria-label from `ui.a11y`, one literal
 * property access per case — never `ui.a11y[id]`, which would bypass the
 * parity test's ability to prove a key is actually used
 * (contracts/ui-dictionary.md §Access rule). Extended one case at a time as
 * landmark labels are extracted into the dictionary (T031); `label` is the
 * fallback for any id not yet in the switch, so a caller can pass an English
 * literal until its key lands.
 */
function resolveAriaLabel(ui: Ui, id: string, label: string): string {
  switch (id) {
    case 'hero':
      return ui.a11y.landmarks.hero;
    case 'skills':
      return ui.a11y.landmarks.skills;
    case 'career':
      return ui.a11y.landmarks.career;
    case 'technologies':
      return ui.a11y.landmarks.technologies;
    case 'education':
      return ui.a11y.landmarks.education;
    case 'projects':
      return ui.a11y.landmarks.projects;
    case 'contact':
      return ui.a11y.landmarks.contact;
    default:
      return label;
  }
}

/**
 * Thin `<section>` wrapper so `app/page.tsx` can stay a server component
 * (and keep its `metadata` export) while a chapter landmark's aria-label
 * still follows the active locale — the one piece of client-side locale
 * awareness this needs is isolated here (research.md R-008, ADR 0024). No
 * behaviour beyond rendering a `<section>`.
 */
export function Chapter({ id, label, className, children }: ChapterProps) {
  const ui = useUi();

  return (
    <section id={id} aria-label={resolveAriaLabel(ui, id, label)} className={className}>
      {children}
    </section>
  );
}
