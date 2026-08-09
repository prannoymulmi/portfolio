'use client';

import React from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { EducationSkeleton } from '@/components/Common/LoadingState';

export function EducationSection() {
  const { education } = useContent();

  if (education.loading) {
    return <EducationSkeleton />;
  }

  if (education.error || !education.data) {
    return (
      <section className="py-12">
        <p className="text-center text-red-600">Failed to load education</p>
      </section>
    );
  }

  const { education: educationList } = education.data;

  return (
    <section className="space-y-8 py-12">
      <div>
        <h2 className="text-3xl font-bold">Education & Certifications</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Formal education and professional certifications
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {educationList.map((item, idx) => (
          <article
            key={idx}
            className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {item.cardTitle}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.cardSubtitle}</p>
              </div>
              {item.icon && (
                <div className="text-4xl">{item.icon.src}</div>
              )}
            </div>

            {/* Additional details */}
            {item.cardDetailedText && (
              <p className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                {item.cardDetailedText}
              </p>
            )}

            {/* Media */}
            {item.media && (
              <div className="mt-4 rounded-lg overflow-hidden">
                {item.media.type === 'IMAGE' && (
                  <img
                    src={item.media.source.url}
                    alt={item.media.name}
                    className="h-48 w-full object-cover"
                    loading="lazy"
                  />
                )}
              </div>
            )}

            {/* URL link */}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
              >
                Learn More
              </a>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
