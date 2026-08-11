import type { SoftSkill } from '@/lib/types/portfolio';
import { SUNGLOW } from './palette';

const MAX_LEVEL = 5;

interface SkillBarsProps {
  skills: SoftSkill[];
}

/**
 * The strip of bars in the card's bottom right, where the reference card puts
 * its attribute meters.
 *
 * The rest of the card is years, which are checkable (ADR 0013). These aren't
 * — so they're drawn in whole fifths and labelled "self-rated", rather than
 * given the false precision of a 0–100 score. Same standing as the star rating
 * already printed beside them.
 */
export function SkillBars({ skills }: SkillBarsProps) {
  return (
    <div>
      <p className="font-mono text-[9px] font-bold uppercase leading-none tracking-widest text-white/45">
        Self-rated
      </p>
      <ul className="mt-2 space-y-1.5">
        {skills.map((skill) => (
          <li key={skill.label} className="flex items-center gap-2">
            <span className="w-[5.5rem] shrink-0 truncate font-mono text-[9px] font-bold uppercase leading-none tracking-wider text-white">
              {skill.label}
            </span>
            <span
              role="meter"
              aria-label={skill.label}
              aria-valuenow={skill.level}
              aria-valuemin={1}
              aria-valuemax={MAX_LEVEL}
              aria-valuetext={`${skill.level} out of ${MAX_LEVEL}`}
              className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/20"
            >
              <span
                aria-hidden="true"
                className="block h-full rounded-full"
                style={{
                  width: `${(skill.level / MAX_LEVEL) * 100}%`,
                  backgroundColor: SUNGLOW,
                }}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
