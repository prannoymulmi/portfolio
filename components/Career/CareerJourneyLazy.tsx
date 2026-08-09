'use client';

import dynamic from 'next/dynamic';
import { CareerSkeleton } from '@/components/Common/LoadingState';

// Client-only wrapper so pages can server-render immediately while the
// GSAP-dependent CareerJourney bundle streams in on the client.
export const CareerJourneyLazy = dynamic(
  () => import('./CareerJourney').then((mod) => ({ default: mod.CareerJourney })),
  {
    ssr: false,
    loading: () => <CareerSkeleton />,
  },
);
