import type { Metadata } from 'next';
import { AboutSection } from '@/components/About/AboutSection';

export const metadata: Metadata = {
  title: 'About Me | Prannoy Mulmi',
  description: 'Learn about my background, experience, and passion for building scalable cloud systems.',
  openGraph: {
    title: 'About Me | Prannoy Mulmi',
    description: 'Learn about my background, experience, and passion for building scalable cloud systems.',
    type: 'website',
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <AboutSection />
      </div>
    </main>
  );
}
