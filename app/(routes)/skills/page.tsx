import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Skills | Prannoy Mulmi',
  description: 'Technical skills and expertise',
};

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">Skills</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Skills content coming soon. This page will display technical expertise organized as a football
          formation.
        </p>
      </div>
    </main>
  );
}
