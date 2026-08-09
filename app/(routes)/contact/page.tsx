import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact | Prannoy Mulmi',
  description: 'Get in touch',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-white">Contact</h1>
        <p className="text-gray-600 dark:text-gray-300">Contact content coming soon.</p>
      </div>
    </main>
  );
}
