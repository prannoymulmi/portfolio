import type { Achievement } from '@/lib/types/portfolio';
import { ACHIEVEMENT_ICONS } from './CardIcons';

/**
 * The honours rows: an icon tile beside one or two lines of text, separated by
 * hairlines, with a single row carried in the accent colour.
 *
 * This is where the card's evidence now lives. It replaces the stat pills and
 * the self-rated bars the previous card carried — specific things done, rather
 * than a self-assessment (see the ADR amending 0013 for what that trade gives
 * up as well as what it gains).
 *
 * Rows are `items-start` and the text is unclamped so a longer line grows the
 * row rather than overlapping its neighbour (US3 scenario 3). The 80-character
 * cap in the schema keeps that growth bounded.
 */
export function HonoursList({ achievements }: { achievements: Achievement[] }) {
  return (
    <ul className="divide-card-foil/30 border-card-foil/30 divide-y border-y">
      {achievements.map((achievement) => {
        const Icon = ACHIEVEMENT_ICONS[achievement.icon];
        return (
          <li key={achievement.text} className="flex items-start gap-3 py-2.5">
            <span className="border-card-foil/40 bg-card-edge/50 mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border">
              <Icon
                className={`h-5 w-5 ${achievement.emphasis ? 'text-card-accent' : 'text-card-ink/70'}`}
              />
            </span>
            <p
              className={`min-w-0 text-[15px] leading-snug ${
                achievement.emphasis ? 'text-card-accent font-semibold' : 'text-card-ink'
              }`}
            >
              {achievement.text}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
