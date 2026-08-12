'use client';

import { useSyncExternalStore } from 'react';

/**
 * Unfinished work ships behind this flag rather than on a branch: the code
 * stays in the tree and on the deployed site, but nothing reaches a visitor
 * unless the URL asks for it with `?experiment=true`.
 */
export const EXPERIMENT_PARAM = 'experiment';

function subscribe(onChange: () => void) {
  // The query string only changes under us through history navigation — the
  // site is one page and its links are hashes. popstate covers back/forward.
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

/**
 * Whether the current URL opts into experimental UI, read straight from the
 * address bar. Browser-only — call it from an effect or an event handler.
 *
 * Anything that *acts* on the flag must ask this rather than read the hook's
 * value, because the hook reports `false` for one render after hydration and
 * "not read yet" is indistinguishable from "off" in that value. An effect that
 * trusted it would fire its off-branch on every load, flag or no flag.
 */
export function isExperimentEnabled() {
  return new URLSearchParams(window.location.search).get(EXPERIMENT_PARAM) === 'true';
}

/**
 * Whether the current URL opts into experimental UI, for rendering.
 *
 * Read through `useSyncExternalStore` rather than `useSearchParams` on
 * purpose: `useSearchParams` opts the whole subtree out of static rendering
 * unless it is wrapped in Suspense, and this flag is consulted from chrome
 * that renders on every page. The server snapshot is always `false`, so the
 * server and the client's hydration render agree that the experiment is off
 * and the real answer swaps in on the next pass — which is also what we want
 * for rendering: off is the state everyone shares until proven otherwise.
 */
export function useExperimentEnabled() {
  return useSyncExternalStore(subscribe, isExperimentEnabled, () => false);
}
