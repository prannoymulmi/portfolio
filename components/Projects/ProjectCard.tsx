'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/types/portfolio';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
}

/**
 * One project in the gallery.
 *
 * Translucent rather than an opaque white card: the photograph is the surface
 * of the whole story (ADR 0015), and a solid card punches a hole in it. The
 * accent is the site's ember rather than the framework blue this carried
 * before — blue appeared nowhere else on the page.
 */
export function ProjectCard({ project, isSelected, onSelect }: ProjectCardProps) {
  return (
    <article
      className={`group chapter-panel cursor-pointer overflow-hidden rounded-2xl transition-colors ${
        isSelected ? 'border-[#f2540d]' : 'hover:border-[#f2540d]/60'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-pressed={isSelected}
    >
      {project.image && (
        <div className="h-40 overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            width={600}
            height={160}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      <div className="p-5">
        <h3 className="font-semibold tracking-tight transition-colors group-hover:text-[#f2540d]">
          {project.title}
        </h3>

        <p className="text-on-photo mt-2 line-clamp-3 text-sm leading-relaxed">
          {project.bodyText}
        </p>

        {project.tags && project.tags.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.tags.slice(0, 3).map((tag) => (
              <li
                key={tag}
                className="text-on-photo rounded-full border border-gray-400/50 px-2.5 py-0.5 text-xs font-medium"
              >
                {tag}
              </li>
            ))}
            {project.tags.length > 3 && (
              <li className="text-on-photo self-center font-mono text-xs opacity-70">
                +{project.tags.length - 3}
              </li>
            )}
          </ul>
        )}

        {project.links && project.links.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.links.map((link) => (
              <Link
                key={link.route}
                href={link.route}
                className="text-on-photo rounded-full border border-gray-400/60 px-3 py-1 text-xs font-medium transition-colors hover:border-[#f2540d]"
                target={link.route.startsWith('http') ? '_blank' : undefined}
                rel={link.route.startsWith('http') ? 'noopener noreferrer' : undefined}
                // The card is itself a button; a link inside it must not also
                // trigger the card's selection.
                onClick={(event) => event.stopPropagation()}
              >
                {link.text} ↗
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
