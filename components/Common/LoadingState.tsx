'use client';

type SkeletonType = 'hero' | 'skill' | 'card' | 'text-block' | 'image';

interface LoadingStateProps {
  type?: SkeletonType;
  count?: number;
}

const skeletonConfigs: Record<SkeletonType, { height: string; width: string; rounded: string }> = {
  hero: { height: 'h-64', width: 'w-full', rounded: 'rounded-lg' },
  skill: { height: 'h-48', width: 'w-full', rounded: 'rounded-lg' },
  card: { height: 'h-32', width: 'w-full', rounded: 'rounded-lg' },
  'text-block': { height: 'h-20', width: 'w-full', rounded: 'rounded' },
  image: { height: 'h-96', width: 'w-full', rounded: 'rounded-lg' },
};

function SkeletonLoader({ type = 'card' }: { type: SkeletonType }) {
  const config = skeletonConfigs[type];
  return (
    <div
      className={`${config.height} ${config.width} ${config.rounded} animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200`}
      style={{
        backgroundSize: '200% 100%',
      }}
    />
  );
}

export function LoadingState({ type = 'card', count = 1 }: LoadingStateProps) {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonLoader key={i} type={type} />
      ))}
    </div>
  );
}

// Specific skeleton variants for common sections
export function HeroSkeleton() {
  return (
    <div className="space-y-6 p-8">
      <SkeletonLoader type="hero" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SkeletonLoader type="card" />
        <SkeletonLoader type="card" />
      </div>
    </div>
  );
}

export function SkillsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonLoader key={i} type="skill" />
      ))}
    </div>
  );
}

export function CareerSkeleton() {
  return (
    <div className="space-y-6 p-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonLoader key={i} type="card" />
      ))}
    </div>
  );
}

export function EducationSkeleton() {
  return (
    <div className="space-y-6 p-8">
      {Array.from({ length: 2 }).map((_, i) => (
        <SkeletonLoader key={i} type="card" />
      ))}
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonLoader key={i} type="image" />
      ))}
    </div>
  );
}

export function PlaybookSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 p-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonLoader key={i} type="card" />
      ))}
    </div>
  );
}
