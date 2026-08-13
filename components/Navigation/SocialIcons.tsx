'use client';

import type { IconType } from 'react-icons';
// Subpath import so only the two glyphs used reach the bundle, rather than the
// whole icon set.
import { FaGithub, FaLinkedin } from 'react-icons/fa6';
import { useContent } from '@/components/Common/ContentProvider';

/**
 * Network name → glyph. Keyed lowercase so content can write "GitHub",
 * "Github" or "github" and still match.
 *
 * These are trademarks used to link to the profiles they belong to, which is
 * nominative use. See docs/adr/0014-icon-set-dependency.md
 */
const GLYPHS: Record<string, IconType> = {
  linkedin: FaLinkedin,
  github: FaGithub,
};

/**
 * The two profile links, small, in the persistent nav.
 *
 * Ink navy rather than a mid grey. These sit on a translucent pill with the
 * photograph showing through, where a grey glyph loses its edges against the
 * lighter parts of the image; the reference design draws them near-black for
 * the same reason.
 *
 * Lives here rather than in a chapter so they are reachable in one click from
 * any scroll position — the About chapter that used to hold them is gone.
 */
export function SocialIcons() {
  const { social } = useContent();
  const entries = social.data?.social;

  // Nothing to show is not an error: the nav's own links, progress bar and
  // theme toggle must keep working if this content fails to load.
  if (!entries || entries.length === 0) return null;

  return (
    <ul className="flex items-center gap-2">
      {entries.map((link) => {
        const Glyph = GLYPHS[link.network.toLowerCase()];

        return (
          <li key={link.href}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.network}
              className="flex items-center rounded p-1.5 text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-100 dark:hover:text-blue-400"
            >
              {Glyph ? (
                <Glyph aria-hidden="true" className="h-5 w-5" />
              ) : (
                // A network with no glyph still has to be a usable link.
                <span className="text-sm font-medium">{link.network}</span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
