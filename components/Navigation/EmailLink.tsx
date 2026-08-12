interface EmailLinkProps {
  /** Plain address, e.g. "prannoy.mulmi@gmail.com". */
  email: string;
}

/**
 * The contact address, beside the profile links in the floating nav.
 *
 * The envelope is drawn here rather than imported. `react-icons` is confined to
 * brand marks, and only inside SocialIcons.tsx (ADR 0014) — an envelope is a
 * generic glyph, not a trademark being used to link to its owner, so it does
 * not qualify for that exception.
 *
 * The address arrives plain and the `mailto:` is composed here, because the
 * Contact chapter shows the same value as readable text and would otherwise
 * have to strip the scheme back off.
 */
export function EmailLink({ email }: EmailLinkProps) {
  return (
    <a
      href={`mailto:${email}`}
      // The glyph is hidden from assistive tech, so the name has to be stated:
      // a link whose only content is a drawing is announced as nothing at all.
      aria-label={`Email ${email}`}
      className="flex items-center rounded p-1.5 text-gray-600 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
    >
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
        <path d="M3 6.5l9 6.5 9-6.5" />
      </svg>
    </a>
  );
}
