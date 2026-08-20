import type { CvLink as CvLinkData } from '@/lib/types/portfolio';
import { useUi } from '@/components/Common/LocaleProvider';
import { format } from '@/lib/i18n/format';

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
 * the person rather than a third thing being asked of the visitor.
 *
 * The size and tracking match the name line at the top of the opening, not a
 * value near it: a second almost-identical letterspacing would read as drift
 * rather than as the same voice. (Both were the player card's scouting line
 * before the card was removed — see ADR 0018.)
 *
 * The document lives on someone else's host; this is only a pointer to it
 * (ADR 0017), and `href` is content the site owner can repoint at any time
 * with no code change — as it was, from a Drive "view" page to the direct
 * `uc?export=download` address it is now, which is what makes this a genuine
 * download rather than a document opened in a viewer. No `download`
 * attribute is added here — browsers ignore it cross-origin regardless — the
 * download behaviour comes entirely from the host's own response headers for
 * the address `href` currently points at, not from anything this component
 * does.
 *
 * Resting colour comes from `text-on-photo` rather than a grey: the backdrop's
 * darkest region measures 0.293 relative luminance, and `--on-photo` resolves
 * to `--foreground`, which measures 5.30:1 against it — `--muted-foreground`
 * would measure 2.01:1 and fail (specs/009-typography-color-refresh,
 * research R1). Hover moves to the section's ember/sunglow accent — the two
 * hues already spent on the focus ring below, so hovering introduces no
 * colour the hero does not already use.
 */
export function CvLink({ cv }: CvLinkProps) {
  const ui = useUi();
  if (!cv) return null;

  return (
    <a
      href={cv.href}
      target="_blank"
      rel="noopener noreferrer"
      // The visible label comes from content; the accessible name has to also
      // say where it goes, because a link that opens a tab without warning is
      // a surprise for anyone who cannot see the new tab appear.
      aria-label={format(ui.hero.cvOpensInNewTab, { label: cv.label })}
      className="text-on-photo decoration-current/30 font-mono-ui inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] underline decoration-1 underline-offset-[6px] transition-colors hover:text-[#93280f] hover:decoration-current focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93280f] focus-visible:ring-offset-2 dark:hover:text-[#ffa62b] dark:focus-visible:ring-[#ffa62b]"
    >
      {/* A download tray, matching what the label now says and the address
          now does — the Drive "view" link this used to point at was a
          record to open, not a file to take away, and carried a ruled-sheet
          glyph for that reason; the direct-download address it points at
          now genuinely transfers a file, so the icon does too. */}
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
        <path d="M12 3.5v11" />
        <path d="M7.5 10.5 12 15l4.5-4.5" />
        <path d="M5 17.5v1.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-1.5" />
      </svg>
      {cv.label}
    </a>
  );
}
