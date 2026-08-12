import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found | Prannoy Mulmi',
  description: 'The page you are looking for does not exist.',
};

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <p className="text-6xl font-bold text-blue-600">404</p>
      <h1 className="mt-4 text-3xl font-bold text-gray-900">Off the pitch</h1>
      <p className="mt-3 max-w-md text-gray-600">
        We couldn&apos;t find the page you were looking for. It may have been moved or never
        existed.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Return to home
      </Link>
    </section>
  );
}
