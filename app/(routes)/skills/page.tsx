import type { Metadata } from 'next';
import { SkillsFormation } from '@/components/Skills/SkillsFormation';

export const metadata: Metadata = {
  title: 'Skills & Expertise | Prannoy Mulmi',
  description: 'Technical skills organized by specialization: backend, cloud, frontend, and DevOps.',
  openGraph: {
    title: 'Skills & Expertise | Prannoy Mulmi',
    description: 'Technical skills organized by specialization: backend, cloud, frontend, and DevOps.',
    type: 'website',
  },
};

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <SkillsFormation />
      </div>
    </main>
  );
}
