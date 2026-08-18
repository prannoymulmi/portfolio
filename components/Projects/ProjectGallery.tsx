'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useContent } from '@/components/Common/ContentProvider';
import { ProjectCard } from './ProjectCard';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ProjectsSkeleton } from '@/components/Common/LoadingState';
import {
  nextProjectHighlightToken,
  PROJECT_HIGHLIGHT_EVENT,
  type ProjectHighlightDetail,
} from '@/lib/utils/projectHighlight';

// Root of every per-project GitHub link already present in projects.json —
// not a new value, just its profile-level prefix (research.md, data-model.md).
const GITHUB_PROFILE_URL = 'https://github.com/prannoymulmi';

// Matches the `.project-card-highlight` animation in globals.css (1.4s per
// loop, 3 loops) — kept here rather than derived from the CSS so the ring's
// removal happens after it has spun a whole number of times, never cut off
// mid-loop.
const HIGHLIGHT_DURATION_MS = 1400 * 3;

export function ProjectGallery() {
  const { projects } = useContent();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  // The project the hero's "Built with Claude" pill just pointed a visitor
  // at (components/Hero/Hero.tsx), if any — cleared automatically once the
  // border-light animation has finished. `token` changes on every highlight
  // request, even repeats of the same `id`, so ProjectDetailModal can force
  // the CSS animation to restart rather than relying on `id` alone flipping
  // React state (it doesn't, on a repeat click).
  const [highlight, setHighlight] = useState<{ id: string; token: number } | null>(null);
  // Captures the card that opened the modal so focus can return to it on
  // close (FR-005), without inventing a second piece of state alongside
  // selectedProjectId (research.md).
  const triggerRef = useRef<HTMLElement | null>(null);
  // Holds the pending "clear the ring" timer. A ref, not a local inside the
  // effect below, because the ring is now started from two places — that
  // effect and the card's own onSelect — and both have to be able to cancel
  // a still-running clear so a second open doesn't inherit the first one's
  // remaining time.
  const highlightTimeoutRef = useRef<number | undefined>(undefined);
  const projectList = projects.data?.projects ?? [];

  // Starts the ring on whichever project is open and schedules its removal.
  // Stable identity (no deps) so the effect below can depend on it without
  // re-subscribing its listener on every render.
  const startHighlight = useCallback((targetId: string, token: number) => {
    setHighlight({ id: targetId, token });
    window.clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = window.setTimeout(
      () => setHighlight(null),
      HIGHLIGHT_DURATION_MS,
    );
  }, []);

  useEffect(() => () => window.clearTimeout(highlightTimeoutRef.current), []);

  // Two independent ways to arrive at a highlight, covering the two ways
  // this page can be reached: a same-page click (the hero's dispatched
  // CustomEvent) and a fresh load of a `/#project-<id>` link, bookmarked or
  // refreshed, where that click never happened — so only the hash exists.
  useEffect(() => {
    if (projectList.length === 0) return undefined;

    const openWithHighlight = (targetId: string, token: number) => {
      const exists = projectList.some(
        (project, idx) => (project.id || idx.toString()) === targetId,
      );
      if (!exists) return;

      // Opening the detail modal is the point of the pill now, not merely
      // scrolling to the card: the ring runs on the opened modal, so the
      // modal has to be what's on screen for there to be anything to ring.
      // Focus returns to the matching card on close (the card is the thing
      // behind the modal once the hash scroll lands), keeping the close
      // path the same as a card-initiated open.
      setSelectedProjectId(targetId);
      triggerRef.current = document.getElementById(`project-${targetId}`);
      startHighlight(targetId, token);
    };

    const onHighlightEvent = (event: Event) => {
      const detail = (event as CustomEvent<ProjectHighlightDetail>).detail;
      if (detail?.id) openWithHighlight(detail.id, detail.token);
    };

    const hashMatch = window.location.hash.match(/^#project-(.+)$/);
    if (hashMatch) {
      openWithHighlight(decodeURIComponent(hashMatch[1]), nextProjectHighlightToken());
    }

    window.addEventListener(PROJECT_HIGHLIGHT_EVENT, onHighlightEvent);
    return () => window.removeEventListener(PROJECT_HIGHLIGHT_EVENT, onHighlightEvent);
  }, [projectList, startHighlight]);

  if (projects.loading) {
    return <ProjectsSkeleton />;
  }

  if (projects.error || !projects.data) {
    return (
      <section className="py-12">
        <p className="text-center text-red-600">Failed to load projects</p>
      </section>
    );
  }

  const selectedProject =
    selectedProjectId === null
      ? null
      : (projectList.find((project, idx) => (project.id || idx.toString()) === selectedProjectId) ??
        null);

  const closeModal = () => {
    setSelectedProjectId(null);
    if (triggerRef.current instanceof HTMLElement) {
      triggerRef.current.focus();
    }
  };

  return (
    <section className="space-y-8 py-12">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="text-3xl font-bold">Featured Projects</h2>
          <a
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-on-photo/70 hover:text-primary text-sm transition-colors"
          >
            More on GitHub ↗
          </a>
        </div>
        <p className="text-on-photo mt-2">
          Case studies showcasing problem-solving, technical decisions, and measurable impact
        </p>
      </div>

      {/* Projects grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projectList.map((project, idx) => {
          const id = project.id || idx.toString();
          return (
            <ProjectCard
              key={id}
              project={project}
              projectId={id}
              isSelected={selectedProjectId === id}
              onSelect={() => {
                triggerRef.current = document.activeElement as HTMLElement;
                setSelectedProjectId(id);
                // Same ring the hero pill produces — opening a card from the
                // gallery is the same arrival at the same modal, so it gets
                // the same treatment rather than a quieter one.
                startHighlight(id, nextProjectHighlightToken());
              }}
            />
          );
        })}
      </div>

      <ProjectDetailModal
        project={selectedProject}
        onClose={closeModal}
        isHighlighted={highlight !== null && highlight.id === selectedProjectId}
        highlightToken={highlight?.id === selectedProjectId ? (highlight?.token ?? null) : null}
      />
    </section>
  );
}
