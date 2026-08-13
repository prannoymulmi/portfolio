'use client';

import { useContent } from '@/components/Common/ContentProvider';

/**
 * The story's endpoint: an eyebrow, a big statement, and a button row —
 * matching the reference design's Contact section (showcase/, gitignored).
 *
 * Two deliberate departures from that reference:
 *
 * - No icons on the GitHub/LinkedIn buttons. The reference draws them with
 *   `lucide-react`; this project's icon set is `react-icons`, scoped by the
 *   constitution (Principle IV, ADR 0014) to `SocialIcons.tsx` alone, and
 *   `lucide-react` isn't part of the stack — adding it would be a new
 *   dependency requiring an ADR + amendment for two glyphs already drawn
 *   elsewhere on the page. Text-only pills carry the same button row without
 *   either.
 * - No local footer line ("Designed and built from scratch · 2026"). The
 *   site already has one, `components/Navigation/Footer.tsx`, mounted once
 *   in the root layout — a second one here would duplicate it.
 *
 * The address is still printed as readable text as well as linked, because
 * someone reading the page — or writing it down, or on a device with no mail
 * client wired up — needs the address itself rather than a "get in touch"
 * that hides it behind an href. No obfuscation: scrambling it would cost the
 * people who want to read it more than it costs a scraper, which reads the
 * DOM either way.
 */
export function ContactSection() {
  const { social } = useContent();
  const email = social.data?.email;
  const links = social.data?.social ?? [];

  return (
    <div className="relative isolate text-center">
      {/* A soft glow behind the heading, not a panel — same "lift, don't
          lid" rule every chapter-panel already follows (ADR 0015): translucent,
          never an opaque fill. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <p className="label-mono text-primary">Contact</p>
      <h2 className="text-foreground mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        Got a gnarly system? <span className="text-gradient-accent">Let&rsquo;s talk.</span>
      </h2>
      <p className="text-on-photo mx-auto mt-5 max-w-lg">
        I reply to every message within a day or two — happy to trade notes on architecture even if
        there&rsquo;s no role attached.
      </p>

      {/* A failed content fetch leaves the eyebrow/heading/description in
          place rather than an empty chapter — the same shape SocialIcons
          uses. email/links are both derived from the same fetch, so an empty
          array and an undefined email naturally render no buttons here. */}
      {(email || links.length > 0) && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {email && (
            <a
              href={`mailto:${email}`}
              // Text on the primary fill uses `foreground`, not
              // `primary-foreground` (research R1 — primary-foreground
              // measures 3.26:1 against primary).
              className="shadow-glow inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
            >
              {email}
            </a>
          )}
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border inline-flex items-center gap-2 rounded-full border px-6 py-3 text-sm transition-colors hover:bg-card"
            >
              {link.network}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
