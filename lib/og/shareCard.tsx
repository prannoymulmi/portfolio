import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { HomeSchema } from '@/lib/utils/validation';
import { CREAM, EMBER, INK, TEAL } from '@/components/Hero/palette';

/**
 * Shared by `app/opengraph-image.tsx` and `app/twitter-image.tsx` — both
 * platforms want the same 1200x630 card, and duplicating this JSX in two
 * files would just be two copies to keep in sync. Neither of those files
 * is itself importable elsewhere (Next treats their exact filenames
 * specially), so the actual generation lives here instead.
 *
 * See `opengraph-image.tsx`'s own doc comment for why this exists at all:
 * without an explicit share image, crawlers fell back to scraping
 * `Backdrop.tsx`'s sunset photo — the largest `<img>` in the page, not a
 * card that identifies the site.
 */

// Same three-colour subsystem the real role bars use (components/Hero/palette.ts).
const HIGHLIGHT_COLORS = [INK, EMBER, TEAL] as const;

export const SHARE_CARD_SIZE = { width: 1200, height: 630 };

export async function renderShareCard(): Promise<ImageResponse> {
  const raw = await readFile(join(process.cwd(), 'public/data/en/home.json'), 'utf-8');
  const home = HomeSchema.parse(JSON.parse(raw));

  // next/og's <img> needs a real src (data URI or remote URL) — next/image
  // isn't available in this rendering context, so the portrait is read and
  // inlined directly, the same "local asset via fs" pattern Next's own
  // opengraph-image docs use.
  const portraitPath = join(process.cwd(), 'public', home.imageSource ?? '/images/hero_portrait.png');
  const portraitData = await readFile(portraitPath);
  const portraitSrc = `data:image/png;base64,${portraitData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          // A lighter echo of the backdrop photo's sunset wash (palette.ts'
          // own doc comment: "burnt orange in the lower left to pink and
          // near-white across the top") rather than embedding the 1.7MB
          // photo itself into every generated card.
          background: 'linear-gradient(135deg, #fff5ec 0%, #ffe3c9 45%, #ffcda3 100%)',
        }}
      >
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 40px 0 72px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              letterSpacing: 4,
              color: EMBER,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            {home.name}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 28 }}>
            {home.roles.map((role, index) => (
              <div
                key={role}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  // Satori (next/og's renderer) doesn't support `width:
                  // fit-content` — the parent's `flexDirection: 'column'`
                  // defaults children to stretch, so `alignSelf: flex-start`
                  // is what actually shrinks this bar to its text instead
                  // of running the full column width.
                  alignSelf: 'flex-start',
                  background: HIGHLIGHT_COLORS[index % HIGHLIGHT_COLORS.length],
                  color: CREAM,
                  fontSize: 48,
                  fontWeight: 800,
                  padding: '4px 20px',
                  borderRadius: 6,
                }}
              >
                {role}.
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: 24,
              color: '#3d2318',
              maxWidth: 540,
              marginTop: 32,
              lineHeight: 1.5,
            }}
          >
            {home.intro}
          </div>
        </div>

        <div
          style={{
            width: 460,
            height: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- next/og
              renders through satori, not the DOM: it requires a plain
              <img>, next/image cannot run in this context.
              Explicit width+height, not just one of them: satori computes
              the other dimension from the image's intrinsic aspect ratio
              when only one is set, and `hero_portrait.png`'s real ratio
              (929x1197) rendered wider than this 460px column, overflowing
              past the card's own right edge. 440 is the binding
              constraint here (fits the column); 566 is 440 scaled to the
              source ratio, not an independent guess. */}
          <img
            src={portraitSrc}
            alt=""
            width={440}
            height={566}
            style={{ objectFit: 'contain' }}
          />
        </div>
      </div>
    ),
    { ...SHARE_CARD_SIZE },
  );
}
