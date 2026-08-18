'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { Project } from '@/lib/types/portfolio';

interface ProjectCardProps {
  project: Project;
  projectId: string;
  isSelected: boolean;
  /** True for the ~4s the hero's "Built with Claude Code" pill has just
   * pointed a visitor at this card — see `.project-card-highlight` in
   * globals.css and the hash-driven effect in ProjectGallery. */
  isHighlighted: boolean;
  onSelect: () => void;
}

/**
 * One project in the gallery.
 *
 * Translucent rather than an opaque white card: the photograph is the surface
 * of the whole story (ADR 0015), and a solid card punches a hole in it. The
 * accent is `--primary` (specs/009-typography-color-refresh) rather than the
 * framework blue this carried before — blue appeared nowhere else on the page.
 */
export function ProjectCard({ project, projectId, isSelected, isHighlighted, onSelect }: ProjectCardProps) {
  return (
    <article
      // Anchor target for the hero's `/#project-<id>` link — the browser's
      // own `scroll-behavior: smooth` (globals.css) carries the scroll, no
      // manual scrollIntoView needed.
      id={`project-${projectId}`}
      className={`group chapter-panel scroll-mt-24 cursor-pointer overflow-hidden rounded-2xl transition-colors ${
        isSelected ? 'border-primary' : 'hover:border-primary/60'
      } ${isHighlighted ? 'project-card-highlight' : ''}`}
      onClick={(e) => {
        // Explicit focus rather than relying on default click-to-focus
        // behaviour (inconsistent across browsers for non-form elements):
        // the detail modal returns focus here on close (FR-005), so this
        // element must reliably be the one holding focus when it opens.
        e.currentTarget.focus();
        onSelect();
      }}
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
        <h3 className="font-semibold tracking-tight transition-colors group-hover:text-primary">
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
                className="text-on-photo label-mono rounded-full border border-border px-2.5 py-0.5 text-xs"
              >
                {tag}
              </li>
            ))}
            {project.tags.length > 3 && (
              <li className="text-on-photo font-mono-ui self-center text-xs opacity-70">
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
                className="text-on-photo rounded-full border border-border px-3 py-1 text-xs font-medium transition-colors hover:border-primary"
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
