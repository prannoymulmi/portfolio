'use client';

import dynamic from 'next/dynamic';
import { ProjectsSkeleton } from '@/components/Common/LoadingState';

// Client-only wrapper: defers the projects gallery bundle until after
// the page frame paints. Cards depend on next/image + link handling
// that don't need to be in the initial HTML response.
export const ProjectGalleryLazy = dynamic(
  () => import('./ProjectGallery').then((mod) => ({ default: mod.ProjectGallery })),
  {
    ssr: false,
    loading: () => <ProjectsSkeleton />,
  },
);
