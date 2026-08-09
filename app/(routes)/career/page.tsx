import type { Metadata } from 'next';
import { CareerJourneyLazy } from '@/components/Career/CareerJourneyLazy';

export const metadata: Metadata = {
  title: 'Career Journey | Prannoy Mulmi',
  description: 'Interactive timeline of my career growth, from early roles to leadership positions.',
  openGraph: {
    title: 'Career Journey | Prannoy Mulmi',
    description: 'Interactive timeline of my career growth, from early roles to leadership positions.',
    type: 'website',
  },
};

export default function CareerPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <CareerJourneyLazy />
      </div>
    </main>
  );
}
