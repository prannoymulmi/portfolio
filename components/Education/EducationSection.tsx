'use client';

import React from 'react';
import Image from 'next/image';
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
        <p className="mt-2 text-on-photo">
          Formal education and professional certifications
        </p>
      </div>

      {/* Rows on the open surface, matching the work showcase and the career
          timeline. The qualification is the heading and the institution the
          line under it — the reverse of what the cards did, which buried the
          awarding body in small grey text. */}
      <div className="divide-y divide-gray-400/40 border-t border-gray-400/40">
        {educationList.map((item, idx) => (
          <article key={idx} className="grid gap-6 py-10 md:grid-cols-[1fr_14rem] md:items-start">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{item.cardTitle}</h3>
              <p className="mt-1 text-sm font-medium text-[#f2540d]">{item.cardSubtitle}</p>

              {item.cardDetailedText && (
                <p className="text-on-photo mt-4 max-w-xl text-sm leading-relaxed">
                  {item.cardDetailedText}
                </p>
              )}

              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-on-photo mt-5 inline-block rounded-full border border-gray-400/60 px-4 py-1.5 text-xs font-medium transition-colors hover:border-[#f2540d]"
                >
                  Learn more ↗
                </a>
              )}
            </div>

            {item.media?.type === 'IMAGE' && (
              <div className="chapter-panel relative h-32 w-full overflow-hidden rounded-xl">
                <Image
                  src={item.media.source.url}
                  alt={item.media.name}
                  fill
                  sizes="(min-width: 768px) 14rem, 100vw"
                  className="object-contain p-3"
                />
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
