'use client';

import { useContent } from '@/components/Common/ContentProvider';

/**
 * The story's endpoint: one address, shown plainly.
 *
 * The address is printed as text as well as linked, because someone reading
 * the page — or writing it down, or on a device with no mail client wired up —
 * needs the address itself rather than a "get in touch" that hides it behind
 * an href.
 *
 * No obfuscation. Scrambling it would cost the people who want to read it more
 * than it costs a scraper, which reads the DOM either way.
 */
export function ContactSection() {
  const { social } = useContent();
  const email = social.data?.email;

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold text-foreground dark:text-white">Contact</h2>

      {/* A failed content fetch leaves the heading in place rather than an
          empty chapter or a thrown error — the same shape SocialIcons uses. */}
      {email && (
        <p className="text-on-photo">
          <a
            href={`mailto:${email}`}
            className="underline decoration-1 underline-offset-4 transition-colors hover:text-[#93280f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#93280f] focus-visible:ring-offset-2 dark:hover:text-[#ffa62b] dark:focus-visible:ring-[#ffa62b]"
          >
            {email}
          </a>
        </p>
      )}
    </div>
  );
}
