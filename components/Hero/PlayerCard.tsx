'use client';

import Image from 'next/image';
import { ProfilePicturePlaceholder } from '@/components/Common/ProfilePicturePlaceholder';
import type { PlayerCard as PlayerCardData } from '@/lib/types/portfolio';
import { CardCrest } from './CardCrest';
import { CardFrame } from './CardFrame';
import { FigureBlock } from './FigureBlock';
import { FoilSheen } from './FoilSheen';
import { HonoursList } from './HonoursList';
import { MetaColumn } from './MetaColumn';

interface PlayerCardProps {
  name: string;
  card: PlayerCardData;
  imageSource?: string;
}

/**
 * A collectible player card, following the anatomy of the reference design:
 * figure block and position over a meta column on the left, portrait on the
 * right, name across the full width, honours list beneath, crest at the foot.
 *
 * Every figure printed here is a count of years or a fact from content. The
 * reference leads with "91 OVR"; this does not, because ADR 0013 rejected an
 * invented composite score and that rule still stands. The block keeps the
 * reference's position and weight and prints the career total instead.
 *
 * Colour is entirely token-driven — see app/globals.css. There is not a single
 * `dark:` utility or inline colour in this tree, and that is the point: the
 * dark edition is a change of six values, not a second set of markup.
 *
 * The card's height follows its content rather than a locked aspect ratio, so
 * on a narrow screen it grows taller than the reference's proportion instead of
 * shrinking its text below the 14px floor (FR-020a).
 */
export function PlayerCard({ name, card, imageSource }: PlayerCardProps) {
  return (
    <figure className="relative mx-auto w-full max-w-lg lg:mx-0 lg:ml-auto">
      <CardFrame>
        <FoilSheen />

        <div className="px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
          {/* Upper half: the identity block, with the portrait beside it. The
              portrait column is narrower than the mock's because the text has
              to hold 14px at 320px — see FR-020a. */}
          <div className="flex gap-3">
            <div className="min-w-0 flex-1">
              <FigureBlock
                years={card.yearsExperience}
                abbrev={card.positionAbbrev}
                title={card.title}
              />
              <div className="mt-5">
                <MetaColumn
                  location={card.location}
                  countries={card.countries}
                  years={card.yearsExperience}
                />
              </div>
            </div>

            <div className="relative w-[42%] shrink-0 self-end">
              {imageSource ? (
                /* The reference cuts the figure out and lets it stand past the
                   frame. No background-removed asset exists, and matting one
                   from the studio photograph was spiked and fails — the grey
                   backdrop and the subject's white shirt and black jacket
                   occupy the same region of colour space, so no threshold
                   separates them (research §5).

                   This is FR-007a's stated fallback: the portrait is framed
                   rather than cut out. Swapping in a real cut-out is a content
                   edit plus deleting the mask below — nothing structural. */
                <div className="border-card-foil/40 relative aspect-[3/4] w-full overflow-hidden rounded-xl border">
                  <Image
                    src={imageSource}
                    alt={`${name}, portrait`}
                    width={420}
                    height={560}
                    sizes="(min-width: 640px) 220px, 40vw"
                    className="h-full w-full object-cover object-top"
                    priority
                  />
                  {/* Grounds the photograph in the card's own colour so a
                      rectangular crop does not read as pasted on. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,var(--card-edge)_100%)] opacity-70"
                  />
                </div>
              ) : (
                <ProfilePicturePlaceholder className="aspect-[3/4] w-full rounded-xl" />
              )}
            </div>
          </div>

          {/* Name banner */}
          <div className="mt-5 text-center">
            <h1 className="font-display text-card-ink text-3xl uppercase leading-none tracking-tight sm:text-4xl">
              {name}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="bg-card-foil h-px w-10" />
              <svg viewBox="0 0 12 12" className="fill-card-foil h-2.5 w-2.5" aria-hidden="true">
                <path d="M6 0l1.6 4H12l-3.5 2.5L9.8 12 6 9 2.2 12l1.3-5.5L0 4h4.4z" />
              </svg>
              <span className="bg-card-foil h-px w-10" />
            </div>
          </div>

          <div className="mt-4">
            <HonoursList achievements={card.achievements} />
          </div>

          <CardCrest />
        </div>
      </CardFrame>
    </figure>
  );
}
