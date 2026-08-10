'use client';

import Image from 'next/image';
import { ProfilePicturePlaceholder } from '@/components/Common/ProfilePicturePlaceholder';
import type { PlayerCard as PlayerCardData } from '@/lib/types/portfolio';
import { FLAGS, FLAG_CLASS, type CountryCode } from './Flags';
import { StarRating } from './StarRating';

interface PlayerCardProps {
  name: string;
  role: string;
  card: PlayerCardData;
  imageSource?: string;
}

/**
 * A collectible-style player card, following the football-card anatomy the
 * rest of the site's metaphor already sets up (ADR 0004): number block, stat
 * pills, portrait, country, and a name banner with a rating.
 *
 * Deep navy with an amber accent — the same floodlight amber the hero's first
 * highlight bar uses, so the card and the headline read as one system.
 */
export function PlayerCard({ name, role, card, imageSource }: PlayerCardProps) {
  return (
    <figure className="mx-auto w-full max-w-sm overflow-hidden rounded-2xl bg-[#0e1f3d] p-2.5 shadow-2xl ring-1 ring-white/10 lg:mx-0 lg:ml-auto">
      <div className="rounded-xl border border-white/15">
        {/* Top bar: what he plays, and the headline figure */}
        <div className="flex items-stretch justify-between gap-3 border-b border-white/15 p-3">
          <p className="self-center font-mono text-[11px] font-bold uppercase leading-tight tracking-[0.15em] text-white">
            {role}
          </p>
          <div className="flex shrink-0 flex-col items-center rounded-md bg-amber-400 px-2.5 py-1">
            <span className="font-mono text-xl font-extrabold leading-none text-[#0b1220]">
              {card.yearsExperience}
            </span>
            <span className="font-mono text-[8px] font-bold uppercase leading-none tracking-widest text-[#0b1220]/70">
              yrs
            </span>
          </div>
        </div>

        {/* Portrait, flanked by stat pills and the country block */}
        <div className="relative flex gap-2 p-3">
          {/* Sunburst behind the portrait, as on the reference card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.13]"
            style={{
              background:
                'repeating-conic-gradient(from 0deg at 50% 42%, #ffffff 0deg 6deg, transparent 6deg 12deg)',
            }}
          />

          <ul className="relative z-10 flex shrink-0 flex-col gap-2">
            {card.stats.map((stat) => (
              <li key={stat.label} className="w-14 text-center">
                <p className="rounded-md bg-amber-400 px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase leading-tight tracking-wider text-[#0b1220]">
                  {stat.label}
                </p>
                <p className="font-mono text-lg font-extrabold leading-tight text-white">
                  {stat.value}
                </p>
              </li>
            ))}
          </ul>

          <div className="relative z-10 min-w-0 flex-1">
            {imageSource ? (
              <Image
                src={imageSource}
                alt={`${name}, portrait`}
                width={480}
                height={560}
                className="aspect-[4/5] w-full rounded-lg object-cover"
                priority
              />
            ) : (
              <ProfilePicturePlaceholder className="aspect-[4/5] w-full rounded-lg" />
            )}
          </div>

          <div className="relative z-10 flex w-14 shrink-0 flex-col items-center gap-1.5">
            <div className="flex w-full flex-col items-center gap-2 rounded-md border border-white/15 p-2">
              {card.countries.map((code) => {
                const key = code as CountryCode;
                const Flag = FLAGS[key];
                return Flag ? <Flag key={code} className={FLAG_CLASS[key]} /> : null;
              })}
            </div>
            <span className="font-mono text-[7px] font-bold uppercase tracking-wider text-white/50">
              Country
            </span>
          </div>
        </div>

        {/* Name banner and rating */}
        <div className="border-t border-white/15 px-3 pb-3 pt-3">
          <div className="-mx-3 bg-amber-400 px-3 py-1.5">
            <h1 className="font-mono text-sm font-extrabold uppercase tracking-[0.12em] text-[#0b1220]">
              {name}
            </h1>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={card.rating} />
            <span className="font-mono text-[11px] font-bold text-white/70">
              {card.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
