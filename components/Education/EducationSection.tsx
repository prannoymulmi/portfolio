'use client';

import React from 'react';
import Image from 'next/image';
import { useContent } from '@/components/Common/ContentProvider';
import { EducationSkeleton } from '@/components/Common/LoadingState';
import { gradeBadgeLabel, isGradeBand } from '@/components/Education/grade';
import { useUi } from '@/components/Common/LocaleProvider';
import { format } from '@/lib/i18n/format';

export function EducationSection() {
  const { education } = useContent();
  const ui = useUi();

  if (education.loading) {
    return <EducationSkeleton />;
  }

  if (education.error || !education.data) {
    return (
      <section className="py-12">
        <p className="text-center text-red-600">{ui.education.failedToLoad}</p>
      </section>
    );
  }

  const { education: educationList } = education.data;

  return (
    <section className="space-y-8 py-12">
      <div>
        <h2 className="text-3xl font-bold">{ui.education.heading}</h2>
        <p className="text-on-photo mt-2">{ui.education.subheading}</p>
      </div>

      {/* Rows on the open surface, matching the work showcase and the career
          timeline. The qualification is the heading and the institution the
          line under it — the reverse of what the cards did, which buried the
          awarding body in small grey text. */}
      <div className="divide-border border-border divide-y border-t">
        {educationList.map((item, idx) => {
          const gradeKey = gradeBadgeLabel(item.cardDetailedText);
          const badgeLabel = gradeKey && isGradeBand(gradeKey) ? ui.education.grades[gradeKey] : gradeKey;

          // Two independent, mutually exclusive image sources: `media` is an
          // externally-hosted certification badge (Credly), `icon` is a
          // locally-stored institution logo (Essex, HAW Hamburg). Neither
          // entry in the content carries both, so resolving to one `logo`
          // here keeps the JSX below to a single image slot instead of two
          // near-identical conditional blocks.
          const logo =
            item.media?.type === 'IMAGE'
              ? { src: item.media.source.url, alt: item.media.name }
              : item.icon
                ? {
                    src: item.icon.src,
                    alt: format(ui.education.logoAlt, { institution: item.cardSubtitle }),
                  }
                : null;

          return (
            <article key={idx} className="grid gap-6 py-10 md:grid-cols-[1fr_14rem] md:items-start">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{item.cardTitle}</h3>
                <p className="text-primary mt-1 text-sm font-medium">{item.cardSubtitle}</p>

                {badgeLabel && (
                  <span className="border-border text-on-photo mt-4 inline-block rounded-full border px-4 py-1.5 text-xs font-medium">
                    {badgeLabel}
                  </span>
                )}

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-on-photo border-border hover:border-primary mt-5 inline-block rounded-full border px-4 py-1.5 text-xs font-medium transition-colors"
                  >
                    {ui.education.learnMore}
                  </a>
                )}
              </div>

              {logo && (
                <div className="chapter-panel relative h-32 w-full overflow-hidden rounded-xl">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    fill
                    sizes="(min-width: 768px) 14rem, 100vw"
                    className="object-contain p-3"
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
