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
 * is already looking.
 *
 * That subordinate role is carried by the typeface rather than by size alone.
 * The buttons are Geist Sans at 18px semibold; setting this in mono micro-caps
 * gives it a records voice instead, so the line reads as a document *about*
 * the person rather than a third thing being asked of the visitor. Same reason
 * the glyph is a ruled sheet and not a download tray.
 *
 * The size and tracking match the name line at the top of the opening, not a
 * value near it: a second almost-identical letterspacing would read as drift
 * rather than as the same voice. (Both were the player card's scouting line
 * before the card was removed — see ADR 0018.)
 *
 * The document lives on someone else's host; this is only a pointer to it
 * (ADR 0017). That also rules out the `download` attribute, which browsers
 * ignore cross-origin — whether the CV opens inline or saves is the host's
 * decision, not ours.
 *
 * Resting colour comes from `text-on-photo` rather than a grey: the backdrop's
 * darkest region measures 0.293 relative luminance, which puts gray-600 and
 * gray-700 below WCAG AA against it (ADR 0015). Hover moves to the section's
 * ember/sunglow accent — the two hues already spent on the focus ring below,
 * so hovering introduces no colour the hero does not already use.
 */
export function CvLink({ cv }: CvLinkProps) {
  if (!cv) return null;

  return (
    <a
      href={cv.href}
      target="_blank"
      rel="noopener noreferrer"
      // The visible label comes from content; the accessible name has to also
      // say where it goes, because a link that opens a tab without warning is
      // a surprise for anyone who cannot see the new tab appear.
      aria-label={`${cv.label} (opens in a new tab)`}
      className="text-on-photo decoration-current/30 inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.16em] underline decoration-1 underline-offset-[6px] transition-colors hover:text-[#93280f] hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93280f] focus-visible:ring-offset-2"
    >
      {/* A ruled team sheet, not a download tray: nothing is fetched here, and
          the page it points at is a record rather than a file transfer. */}
      <svg
        aria-hidden="true"
        className="h-3.5 w-3.5 shrink-0"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 3.5h9l5 5v12H5z" />
        <path d="M14 3.5v5h5" />
        <path d="M8.5 12.5h7M8.5 16h7M8.5 9h2.5" />
      </svg>
      {cv.label}
    </a>
  );
}
