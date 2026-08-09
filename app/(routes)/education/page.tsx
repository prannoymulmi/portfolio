import type { Metadata } from 'next';
import { EducationSection } from '@/components/Education/EducationSection';

export const metadata: Metadata = {
  title: 'Education & Certifications | Prannoy Mulmi',
  description: 'Educational background, degrees, and professional certifications.',
  openGraph: {
    title: 'Education & Certifications | Prannoy Mulmi',
    description: 'Educational background, degrees, and professional certifications.',
    type: 'website',
  },
};

export default function EducationPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <EducationSection />
      </div>
    </main>
  );
}
