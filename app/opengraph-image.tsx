import { renderShareCard, SHARE_CARD_SIZE } from '@/lib/og/shareCard';

/**
 * The share card WhatsApp/Telegram/LinkedIn/etc. render when this site's
 * link is shared. Without this file, no `og:image` meta tag existed at all
 * (`app/layout.tsx`'s metadata never set `openGraph.images`), so crawlers
 * fell back to scraping the page and picked up `Backdrop.tsx`'s sunset
 * photo — the single largest `<img>` in the initial HTML, but not a card
 * that says anything about who this site belongs to.
 *
 * Generated once at build time (predictable values, no request-time
 * data) via the shared generator in `lib/og/shareCard.tsx` — see that
 * file for the actual composition; `twitter-image.tsx` reuses the same
 * one rather than duplicating it.
 */
export const alt = 'Prannoy Mulmi — Senior Software Engineer, Security Advocate, AI enthusiast';
export const size = SHARE_CARD_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return renderShareCard();
}
