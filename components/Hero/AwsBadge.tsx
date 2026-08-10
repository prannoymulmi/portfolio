import { SUNGLOW } from './palette';

/**
 * The cloud half of the card's right rail: a cloud mark over an "AWS"
 * wordmark, with the swoosh the platform's own branding trails underneath.
 *
 * Drawn rather than imported so it inherits the card's accent instead of
 * dropping a foreign brand colour into a navy-and-ember card.
 */
export function AwsBadge({ className }: { className?: string }) {
  return (
    <div
      className={`flex w-full flex-col items-center gap-1 rounded-md border border-white/15 bg-white/[0.04] px-1 py-2 ${className ?? ''}`}
      role="img"
      aria-label="Amazon Web Services"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true" fill={SUNGLOW}>
        <path d="M6.75 19.5a4.5 4.5 0 0 1-.53-8.97 5.25 5.25 0 0 1 10.06-2.16 3 3 0 0 1 3.05 3.37A3.75 3.75 0 0 1 18 19.5z" />
      </svg>
      <span className="font-mono text-[11px] font-extrabold leading-none tracking-[0.12em] text-white">
        AWS
      </span>
      {/* The swoosh, kept as a hairline so it reads as an underline, not a logo. */}
      <svg viewBox="0 0 40 8" className="h-1.5 w-9" aria-hidden="true">
        <path
          d="M1 2.5c7.5 4.6 30 4.6 37.5-1"
          fill="none"
          stroke={SUNGLOW}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M39 0.5l0.8 3.4-3.4-0.6z" fill={SUNGLOW} />
      </svg>
    </div>
  );
}
