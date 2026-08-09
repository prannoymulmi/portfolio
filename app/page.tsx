import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Home | Prannoy Mulmi',
  description: 'Senior software engineer portfolio - home',
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-white px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl space-y-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
          Portfolio Under Construction
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300">
          Phase 1: Project setup is complete. Navigation and content components coming soon.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/skills"
            className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            View Skills
          </a>
          <a
            href="/career"
            className="rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
          >
            Career Journey
          </a>
        </div>
      </div>
    </main>
  );
}
