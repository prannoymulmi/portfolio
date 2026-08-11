/**
 * The block the reference gives its rating, holding the same position, display
 * size and weight — and printing a count of years instead of a score.
 *
 * ADR 0013 rejected a FIFA-style overall rating in as many words: "the card
 * should not state a number nobody computed." The mock's "91 OVR" is the one
 * thing from it this card deliberately does not reproduce. Keeping the block's
 * shape and changing what it says gets the anatomy without the invented figure,
 * which is why no ADR had to be reversed to build this.
 */
export function FigureBlock({
  years,
  abbrev,
  title,
}: {
  years: number;
  abbrev: string;
  title: string;
}) {
  return (
    <div>
      <p className="font-display text-card-ink text-6xl leading-none tracking-tight sm:text-7xl">
        {years}
      </p>
      <p className="font-display text-card-ink/80 mt-1 text-xl leading-none tracking-[0.18em]">
        YRS
      </p>

      <div className="bg-card-foil my-4 h-px w-24" />

      <p className="font-display text-card-accent text-4xl leading-none tracking-tight sm:text-5xl">
        {abbrev}
      </p>
      <p className="font-display text-card-ink mt-2 max-w-[9rem] text-sm uppercase leading-snug tracking-wide">
        {title}
      </p>
    </div>
  );
}
