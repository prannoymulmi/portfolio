'use client';

import Image from 'next/image';
import { ProfilePicturePlaceholder } from '@/components/Common/ProfilePicturePlaceholder';
import type { PlayerCard as PlayerCardData } from '@/lib/types/portfolio';
import { FLAGS, FLAG_CLASS, type CountryCode } from './Flags';
import { CARD_INK, SUNGLOW, SUNGLOW_TEXT } from './palette';
import { StarRating } from './StarRating';

interface PlayerCardProps {
  name: string;
  card: PlayerCardData;
  imageSource?: string;
}

/**
 * A collectible-style player card, following the football-card anatomy the
 * rest of the site's metaphor already sets up (ADR 0004): title bar, stat
 * pills, portrait, country, and a name banner with a rating.
 *
 * Every figure on it is a count of years, so the card says the same thing four
 * ways instead of mixing years with an invented 0–100 score: the block up top
 * is the career total, each pill is the years spent in that area.
 *
 * Deep navy carrying the backdrop photo's own orange, so the card reads as the
 * one cool object on a warm page.
 */
export function PlayerCard({ name, card, imageSource }: PlayerCardProps) {
  return (
    <figure
      className="mx-auto w-full max-w-md overflow-hidden rounded-2xl p-3 shadow-2xl ring-1 ring-white/10 lg:mx-0 lg:ml-auto"
      style={{ backgroundColor: CARD_INK }}
    >
      <div className="rounded-xl border border-white/15">
        {/* Title bar: the job, and the career total it took to get there */}
        <div className="flex items-stretch justify-between gap-3 border-b border-white/15 p-4">
          <p className="self-center font-mono text-xs font-bold uppercase leading-snug tracking-[0.16em] text-white sm:text-sm">
            {card.title}
          </p>
          <div
            className="flex shrink-0 flex-col items-center justify-center rounded-md px-3 py-1.5"
            style={{ backgroundColor: SUNGLOW }}
          >
            <span
              className="font-mono text-3xl font-extrabold leading-none"
              style={{ color: SUNGLOW_TEXT }}
            >
              {card.yearsExperience}
            </span>
            <span
              className="mt-0.5 font-mono text-[9px] font-bold uppercase leading-none tracking-widest"
              style={{ color: SUNGLOW_TEXT }}
            >
              yrs
            </span>
          </div>
        </div>

        {/* Portrait, flanked by stat pills and the country block */}
        <div className="relative flex gap-2.5 p-4">
          {/* Sunburst behind the portrait, as on the reference card */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.13]"
            style={{
              background:
                'repeating-conic-gradient(from 0deg at 50% 42%, #ffffff 0deg 6deg, transparent 6deg 12deg)',
            }}
          />

          <ul className="relative z-10 flex w-[4.5rem] shrink-0 flex-col justify-center gap-3">
            {card.stats.map((stat) => (
              <li key={stat.label} className="text-center">
                <p
                  className="truncate rounded-md px-1.5 py-1 font-mono text-[9px] font-bold uppercase leading-none tracking-wider"
                  style={{ backgroundColor: SUNGLOW, color: SUNGLOW_TEXT }}
                >
                  {stat.label}
                </p>
                <p className="mt-1.5 flex items-baseline justify-center gap-0.5 font-mono leading-none text-white">
                  <span className="text-2xl font-extrabold">{stat.value}</span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/55">
                    yrs
                  </span>
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

          <div className="relative z-10 flex w-[4.5rem] shrink-0 flex-col items-center justify-center gap-2.5">
            <div className="flex w-full flex-col items-center gap-2.5 rounded-md border border-white/15 py-2.5">
              {card.countries.map((code) => {
                const key = code as CountryCode;
                const Flag = FLAGS[key];
                return Flag ? <Flag key={code} className={FLAG_CLASS[key]} /> : null;
              })}
            </div>
            <span className="font-mono text-[8px] font-bold uppercase tracking-wider text-white/50">
              Country
            </span>
          </div>
        </div>

        {/* Name banner and rating */}
        <div className="border-t border-white/15 px-4 pb-4 pt-4">
          <div className="-mx-4 px-4 py-2" style={{ backgroundColor: SUNGLOW }}>
            <h1
              className="font-mono text-base font-extrabold uppercase tracking-[0.14em] sm:text-lg"
              style={{ color: SUNGLOW_TEXT }}
            >
              {name}
            </h1>
          </div>

          <div className="mt-4 flex items-center gap-2.5">
            <StarRating rating={card.rating} />
            <span className="font-mono text-sm font-bold text-white/70">
              {card.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
