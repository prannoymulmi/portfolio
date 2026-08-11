import { CalendarIcon, PinIcon } from './CardIcons';
import { FLAGS, FLAG_CLASS, type CountryCode } from './Flags';

interface MetaColumnProps {
  location: string;
  countries: string[];
  years: number;
}

/**
 * Where he is, where he is from, and how long he has been doing this — three
 * icon-and-fact rows, as the reference lays them out under the job title.
 *
 * The years row repeats the figure block above it. That repetition is in the
 * reference and is kept on purpose: the block is the headline, the row is the
 * caption, and a reader scanning either one lands on the same checkable number.
 */
export function MetaColumn({ location, countries, years }: MetaColumnProps) {
  return (
    <ul className="text-card-ink space-y-2.5 text-sm">
      <li className="flex items-center gap-2.5">
        <PinIcon className="text-card-accent h-4 w-4 shrink-0" />
        <span>{location}</span>
      </li>

      <li className="flex items-center gap-2.5">
        {/* Reuses the flags already drawn for the previous card rather than
            redrawing them — they were never the part that needed replacing. */}
        <span className="flex shrink-0 items-center gap-1.5">
          {countries.map((code) => {
            const key = code as CountryCode;
            const Flag = FLAGS[key];
            return Flag ? <Flag key={code} className={FLAG_CLASS[key]} /> : null;
          })}
        </span>
        <span className="font-medium tracking-wide">{countries.join(' · ')}</span>
      </li>

      <li className="flex items-center gap-2.5">
        <CalendarIcon className="text-card-accent h-4 w-4 shrink-0" />
        <span>{years}+ Years Experience</span>
      </li>
    </ul>
  );
}
