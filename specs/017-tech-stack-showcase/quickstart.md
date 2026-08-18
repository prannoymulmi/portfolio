# Quickstart: Validating the Technologies Chapter

How to prove this feature works end to end. Details of shapes and rules live in
[data-model.md](./data-model.md) and [contracts/](./contracts/); this document
is the run guide.

## Prerequisites

```bash
pnpm install        # pinned via package.json "packageManager" (ADR 0022)
```

## Automated checks

```bash
pnpm test           # jest
pnpm lint
pnpm typecheck      # confirm the script name in package.json
```

The suites that must be green for this feature:

| Suite | Proves |
|---|---|
| `tests/unit/technologies/techDuration.test.ts` | `dateText` parsing (en dash, `Present`, malformed → `null`), interval union incl. adjacent ranges, level thresholds, round-down formatting. |
| `tests/unit/validation.test.ts` | `TechnologiesFileSchema` accepts the real file and rejects: unknown `category`, empty `matches`, duplicate `name`, out-of-range `note`. |
| `tests/unit/components/TechnologiesChapter.test.tsx` | Renders every technology with category + duration; category filter narrows to one category; hover, focus, and click each update the detail panel; single-result filter renders; loading and error states. |
| `tests/integration/content-sources.test.ts` | Every `matches` string exists in `experiences.json`; every technology resolves to ≥ 1 role; every `dateText` in `experiences.json` parses. This is the SC-004 guard. |
| `tests/integration/story-page.test.tsx` | `#technologies` exists, sits between the principle band and `#education`, carries no `ChapterGradientOverlay`, and its `h2` scale matches `ThreeSystems`'. |

## Manual validation

```bash
pnpm dev            # http://localhost:3000
```

1. **SC-001** — scroll to Technologies. Without interacting, at least one
   technology shows a name, a category, and a duration.
2. **SC-002** — click one category button. The list narrows in a single
   interaction; `All` restores it.
3. **SC-003** — hover a row, then Tab to a row, then (in device emulation) tap a
   row. All three update the detail panel; no navigation occurs.
4. **User Story 3** — pick any technology and check its duration against
   `public/data/experiences.json` by hand. Roles listed in the panel must be
   roles that actually name it.
5. **FR-005** — the Claude Code / spec-driven sentence appears exactly once in
   the chapter, at body-copy size.
6. **FR-006** — open the "This Portfolio, Spec-Driven" card in Projects. It
   names Claude Code and spec-driven development, and its position and size in
   the gallery are unchanged from `main`.
7. **FR-008** — compare against the other chapters at 100% zoom. Technologies
   must not read as the loudest thing on the page.
8. **FR-010** — check at 375px, 768px, and 1440px. The two-column layout stacks
   on narrow widths and the detail panel remains reachable.
9. **Reduced motion** — enable the OS setting, reload, and confirm the chapter
   appears without entrance animation.
10. **Failure path** — temporarily rename `public/data/technologies.json` and
    confirm the chapter shows the failure line rather than an empty section or a
    crash. Restore it.

## Definition of done

- All suites above pass; lint and type-check clean.
- ADR `docs/adr/0023-*.md` added and listed in `docs/adr/README.md`, in the same
  PR as the implementation (Principle VI).
- Lighthouse performance ≥ 90 on a production build of the page.
