import Image from 'next/image';
import { GRADIENT_LAYERS, HeroDrift } from './HeroParallax';

/**
 * The four gradient washes behind the Hero's foreground content.
 *
 * Purely decorative — aria-hidden, no alt text — so screen readers skip
 * straight to the role bars and portrait. Rendered before them in
 * source order, and absolutely positioned within the Hero section, so they
 * sit behind everything else without taking part in the grid layout.
 *
 * Each layer drifts at its own speed on scroll via HeroDrift, inheriting its
 * reduced-motion handling and transform-only movement for free rather than
 * re-implementing either here.
 */
export function HeroGradientLayers() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {GRADIENT_LAYERS.map((layer) => (
        <HeroDrift key={layer.src} strength={layer.strength} className="absolute inset-0">
          <Image src={layer.src} alt="" fill sizes="100vw" className={`object-cover ${layer.className}`} />
        </HeroDrift>
      ))}
    </div>
  );
}
