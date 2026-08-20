'use client';

import { useContent } from '@/components/Common/ContentProvider';
import { SocialGlyph } from '@/components/Navigation/SocialIcons';
import { useUi } from '@/components/Common/LocaleProvider';

/**
 * The story's endpoint: an eyebrow, a big statement, and a button row —
 * matching the reference design's Contact section (showcase/, gitignored).
 *
 * One deliberate departure from that reference:
 *
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
  const { social, home } = useContent();
  const ui = useUi();
  const email = social.data?.email;
  const links = social.data?.social ?? [];
  const contactNote = home.data?.contactNote;

  return (
    <div className="relative isolate text-center">
      {/* A soft glow behind the heading, not a panel — same "lift, don't
          lid" rule every chapter-panel already follows (ADR 0015): translucent,
          never an opaque fill. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]"
      />

      <p className="label-mono text-primary">{ui.contact.eyebrow}</p>
      <h2 className="text-foreground mt-4 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
        {ui.contact.headingLead} <span className="text-gradient-accent">{ui.contact.headingAccent}</span>
      </h2>
      {/* Authored prose, not chrome (contracts/ui-dictionary.md §Scope rule,
          T039) — sourced from home.json's contactNote alongside intro,
          not from the ui dictionary. Renders nothing when the field or the
          content itself hasn't loaded, same as email/links below. */}
      {contactNote && <p className="text-on-photo mx-auto mt-5 max-w-lg">{contactNote}</p>}

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
              <SocialGlyph network={link.network} className="h-4 w-4" />
              {link.network}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
