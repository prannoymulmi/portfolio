'use client';

import Link from 'next/link';

export function ValueProp() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center sm:gap-6">
      {/* View Work Button */}
      <Link
        href="/#projects"
        className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-700 hover:shadow-lg active:scale-95 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        View Work
        <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7l5 5m0 0l-5 5m5-5H6"
          />
        </svg>
      </Link>

      {/* Play Career Button */}
      <Link
        href="/#career"
        className="inline-flex items-center justify-center rounded-lg border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-900 transition-all hover:border-gray-400 hover:bg-gray-50 active:scale-95 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800"
      >
        <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        Play Career
      </Link>
    </div>
  );
}
