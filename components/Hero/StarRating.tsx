const STAR_PATH = 'M12 2.5l2.9 6.1 6.6.9-4.8 4.6 1.2 6.6L12 17.6 6.1 20.7l1.2-6.6L2.5 9.5l6.6-.9z';

interface StarRatingProps {
  /** Out of 5, in half steps — 4.5 renders four full stars and one half. */
  rating: number;
  className?: string;
}

export function StarRating({ rating, className }: StarRatingProps) {
  const stars = [0, 1, 2, 3, 4];

  return (
    <div className={`flex gap-1 ${className ?? ''}`} role="img" aria-label={`${rating} out of 5`}>
      {stars.map((index) => {
        // Portion of this star that should be filled: 1, 0.5, or 0.
        const fill = Math.max(0, Math.min(1, rating - index));
        const clipId = `star-clip-${index}`;

        return (
          <svg key={index} viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
            <defs>
              <clipPath id={clipId}>
                <rect x="0" y="0" width={24 * fill} height="24" />
              </clipPath>
            </defs>
            {/* Empty star underneath, filled portion clipped over it. */}
            <path d={STAR_PATH} className="fill-white/20" />
            {fill > 0 && (
              <path d={STAR_PATH} className="fill-amber-400" clipPath={`url(#${clipId})`} />
            )}
          </svg>
        );
      })}
    </div>
  );
}
