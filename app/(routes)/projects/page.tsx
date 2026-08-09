import type { Metadata } from 'next';
import { ProjectGallery } from '@/components/Projects/ProjectGallery';

export const metadata: Metadata = {
  title: 'Projects & Case Studies | Prannoy Mulmi',
  description: 'Featured projects showcasing technical solutions, impact metrics, and technology decisions.',
  openGraph: {
    title: 'Projects & Case Studies | Prannoy Mulmi',
    description: 'Featured projects showcasing technical solutions, impact metrics, and technology decisions.',
    type: 'website',
  },
};

export default function ProjectsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <ProjectGallery />
      </div>
    </main>
  );
}
