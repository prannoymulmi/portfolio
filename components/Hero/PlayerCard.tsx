'use client';

import Image from 'next/image';
import { ProfilePicturePlaceholder } from '@/components/Common/ProfilePicturePlaceholder';
import type { PlayerCard as PlayerCardData } from '@/lib/types/portfolio';

interface PlayerCardProps {
  name: string;
  card: PlayerCardData;
  imageSource?: string;
}

/**
 * The hero portrait, framed as a football player card — the same metaphor the
 * career and skills sections already run on (ADR 0004).
 *
 * Deliberately tonal rather than a bold slab: it borrows the page's own
 * surface and border treatment so it settles into the background, with the
 * kit blue from the #10 jersey as the only accent.
 */
export function PlayerCard({ name, card, imageSource }: PlayerCardProps) {
  return (
    <figure className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white/70 shadow-lg ring-1 ring-gray-900/10 backdrop-blur dark:bg-white/5 dark:ring-white/10 lg:mx-0 lg:ml-auto">
      <div className="relative">
        {imageSource ? (
          <Image
            src={imageSource}
            alt={`${name}, portrait`}
            width={720}
            height={540}
            className="aspect-[4/3] w-full object-cover"
            priority
          />
        ) : (
          <ProfilePicturePlaceholder className="aspect-[4/3] w-full rounded-none" />
        )}

        {/* Years of experience, in the rating slot a player card would use. */}
        <div className="absolute left-4 top-4 flex flex-col items-center rounded-xl bg-white/85 px-3 py-2 shadow-sm ring-1 ring-gray-900/10 dark:bg-gray-900/70 dark:ring-white/15">
          <span className="font-mono text-3xl font-bold leading-none text-blue-600 dark:text-blue-400">
            {card.yearsExperience}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest text-blue-600/70 dark:text-blue-400/70">
            yrs
          </span>
        </div>
      </div>

      <figcaption className="p-5">
        {/* The only place the name appears, so it carries the page's h1. */}
        <h1 className="text-center font-mono text-sm font-bold uppercase tracking-[0.18em] text-gray-900 dark:text-white">
          {name}
        </h1>

        <div className="mt-3 h-px w-full bg-gray-900/10 dark:bg-white/10" />

        <dl className="mt-4 space-y-3">
          {card.stats.map((stat) => (
            <div key={stat.label}>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {stat.label}
                </dt>
                <dd className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </dd>
              </div>
              <div
                className="mt-1 h-1 w-full rounded-full bg-gray-900/10 dark:bg-white/10"
                role="presentation"
              >
                <div
                  className="h-1 rounded-full bg-blue-600 dark:bg-blue-400"
                  style={{ width: `${stat.value}%` }}
                />
              </div>
            </div>
          ))}
        </dl>
      </figcaption>
    </figure>
  );
}
