import { renderShareCard, SHARE_CARD_SIZE } from '@/lib/og/shareCard';

/**
 * Twitter/X's own crawler generally accepts `og:image` as a fallback for
 * `twitter:image`, but this repo's metadata already declares
 * `twitter.card: 'summary_large_image'` (app/layout.tsx) without ever
 * setting an image — an explicit `twitter-image` file closes that gap
 * directly rather than relying on fallback behaviour. Same card as
 * `opengraph-image.tsx`, via the shared generator in `lib/og/shareCard.tsx`.
 */
export const alt = 'Prannoy Mulmi — Senior Software Engineer, Security Advocate, AI enthusiast';
export const size = SHARE_CARD_SIZE;
export const contentType = 'image/png';

export default async function Image() {
  return renderShareCard();
}
