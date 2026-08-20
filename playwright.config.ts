import { defineConfig } from '@playwright/test';

// Dual-target selection lives entirely in this one env var — no separate
// playwright.local.config.ts / playwright.ci.config.ts pair to drift, no CLI
// flag to remember (research.md Decision 1, contracts/e2e-target-contract.md).
// Unset locally: drive against an auto-managed dev server on localhost. Set
// by CI: drive straight at that PR's already-running Vercel preview, with no
// local server started at all.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL,
  },
  // Only defined when PLAYWRIGHT_BASE_URL is unset (i.e. baseURL is still
  // the localhost default) — when it's set, the target is an external URL
  // Playwright didn't start and has no business managing the lifecycle of.
  // Playwright's own webServer runner probes `url` before spawning
  // `command`, so an already-running `pnpm run dev` is reused rather than
  // double-started (reuseExistingServer: true), and torn down again when
  // the run finishes only if this config started it (research.md
  // Decision 1, FR-003).
  ...(process.env.PLAYWRIGHT_BASE_URL
    ? {}
    : {
        webServer: {
          command: 'pnpm run dev',
          url: 'http://localhost:3000',
          reuseExistingServer: true,
        },
      }),
});
