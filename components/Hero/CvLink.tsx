import type { CvLink as CvLinkData } from '@/lib/types/portfolio';

interface CvLinkProps {
  /** Undefined when no address is configured — the link is then not rendered. */
  cv?: CvLinkData;
}

/**
 * A quiet way out of the page for someone who wants the CV.
 *
 * Sits under "View Work" and "Play Career" and is deliberately not a third
 * button: those two are the calls to action, and a recruiter looking for a CV
 * is already looking. Small text is enough.
 *
 * The document lives on someone else's host; this is only a pointer to it
 * (ADR 0017). That also rules out the `download` attribute, which browsers
 * ignore cross-origin — whether the CV opens inline or saves is the host's
 * decision, not ours.
 *
 * Colour comes from `text-on-photo` rather than a grey: the backdrop's darkest
 * region measures 0.293 relative luminance, which puts gray-600 and gray-700
 * below WCAG AA against it (ADR 0015).
 */
export function CvLink({ cv }: CvLinkProps) {
  if (!cv) return null;

  return (
    <a
      href={cv.href}
      target="_blank"
      rel="noopener noreferrer"
      // The visible text says "Download CV"; the accessible name has to also
      // say where it goes, because a link that opens a tab without warning is
      // a surprise for anyone who cannot see the new tab appear.
      aria-label={`${cv.label} (opens in a new tab)`}
      className="mt-4 inline-block text-sm font-medium text-on-photo underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93280f] focus-visible:ring-offset-2 dark:focus-visible:ring-[#ffa62b]"
    >
      {cv.label}
    </a>
  );
}
