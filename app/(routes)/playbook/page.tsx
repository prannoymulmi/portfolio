import type { Metadata } from 'next';
import { PlaybookGrid } from '@/components/Playbook/PlaybookGrid';

export const metadata: Metadata = {
  title: 'Technical Playbook | Prannoy Mulmi',
  description:
    'Core engineering principles and best practices: architecture, cloud strategy, security, backend design, DevOps, and engineering excellence.',
  openGraph: {
    title: 'Technical Playbook | Prannoy Mulmi',
    description:
      'Core engineering principles and best practices: architecture, cloud strategy, security, backend design, DevOps, and engineering excellence.',
    type: 'website',
  },
};

export default function PlaybookPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <PlaybookGrid />
      </div>
    </main>
  );
}
