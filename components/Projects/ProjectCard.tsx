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

export function ProjectCard({ project, isSelected, onSelect }: ProjectCardProps) {
  return (
    // A generic element, because `article` has an implicit role that ARIA does
    // not allow `button` to override.
    <div
      className={`group rounded-lg border-2 bg-white shadow-md transition-all hover:shadow-lg dark:bg-gray-800 ${
        isSelected ? 'border-blue-500 dark:border-blue-400' : 'border-gray-200 dark:border-gray-700'
      }`}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect();
        }
      }}
      aria-pressed={isSelected}
    >
      {/* Project thumbnail */}
      {project.image && (
        <div className="h-40 overflow-hidden bg-gray-200 dark:bg-gray-700">
          <Image
            src={project.image}
            alt={project.title}
            width={600}
            height={160}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      {/* Project content */}
      <div className="p-4">
        <h3 className="mb-2 font-bold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
          {project.title}
        </h3>

        <p className="mb-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
          {project.bodyText}
        </p>

        {/* Technology tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {project.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs text-gray-600 dark:text-gray-400">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA links */}
        {project.links && project.links.length > 0 && (
          <div className="flex gap-2">
            {project.links.map((link, idx) => (
              <Link
                key={idx}
                href={link.route}
                className="inline-block rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                target={link.route.startsWith('http') ? '_blank' : undefined}
                rel={link.route.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {link.text}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
