# Quickstart: Manual Verification

A checklist someone can run by hand against a dev server to confirm every
acceptance scenario in [spec.md](./spec.md). Each item names the requirement
it proves.

## Setup

```bash
npm install --legacy-peer-deps   # ADR 0007 — required in every environment
npm run dev
```

Open `http://localhost:3000/#career`. The career chapter opens on the most
recent chapter (chapter 5, AViV) by default.

Automated gates, run before the manual pass:

```bash
npm run type-check
npm run lint
npm test
```

---

## US1 — Selection feels smooth, not like a state toggle (P1)

- [x] **1.1 Ball travels, panel does not wait.** With chapter 3 (Novomind)
      active, click chapter 5 (AViV). The detail panel switches to AViV
      immediately, while a small ball animates from chapter 3's position to
      chapter 5's and comes to rest there. *(FR-002)*
- [x] **1.2 No queued animations on rapid clicks.** Click three different
      players in quick succession, faster than the animation completes. Exactly
      one ball is on the pitch throughout, and it redirects toward each new
      target from wherever it currently is — it never restarts from the
      previous player, and no second ball appears. *(FR-004, SC-002)*
- [x] **1.3 Reduced motion skips the travel.** In DevTools → Rendering →
      "Emulate CSS prefers-reduced-motion: reduce", reload, then select a
      different chapter. The active chapter updates instantly with no
      travelling ball. *(FR-003)* Reload is required — the preference is read
      once at mount.
- [x] **1.4 No browser focus ring after a click.** Click a player. No
      blue/white default outline appears on or around it. The orange halo is
      the only "active" mark. *(FR-001, SC-002)*
- [x] **1.5 Clicking the active player does nothing.** Click the already-active
      player. No ball movement, panel unchanged. *(Edge case)*

## Keyboard parity

- [x] **K.1 Focus is visible and deliberate.** Tab until a player takes focus.
      A distinct focus ring appears — visually different from the orange halo,
      not the browser default. *(FR-001, FR-010)*
- [x] **K.2 Enter and Space both select.** With a player focused, press Enter;
      then focus another and press Space. Both open the chapter and both show
      the same ball travel a click produces. *(FR-010, edge case)*
- [x] **K.3 The focus ring is keyboard-only.** After clicking a player with the
      mouse, the keyboard focus ring is not shown; after tabbing to it, it is.
      *(FR-001)*
- [x] **K.4 Labels still announce.** Inspect a player: it keeps its
      `role="button"` and an `aria-label` naming the chapter, company, and
      role. The number, abbreviation, and name labels are not separately
      focusable and do not intercept clicks. *(FR-010)*

## US2 — The pitch identifies who each player is (P1)

- [x] **2.1 Everything readable without interaction.** Reload and click
      nothing. Every player shows its order number, an abbreviation directly
      beneath the number, and the shortened company name near the dot.
      *(FR-005, SC-001)*
- [x] **2.2 Derived values are correct.** Confirm the five labels read, oldest
      to newest: `CLAN` / Clansweb.de, `LUST` / Lustita, `NOVO` / Novomind,
      `OTTO` / Otto, `AVIV` / AViV. In particular AViV shows no "(Formerly
      Immowelt GmbH)" and Otto shows no "GmbH & Co KG". *(FR-013)*
- [x] **2.3 No overlap at any width.** Resize the browser from ~360 px to full
      desktop width. No name or abbreviation overlaps another player's number,
      abbreviation, or name, and nothing runs outside the pitch bounds.
      *(FR-006)*
- [x] **2.4 Still SVG.** Inspect the pitch — it is an `<svg>` element; no
      `<canvas>` anywhere in the section. *(FR-011)*

## US3 — The detail panel matches the showcase's compact style (P2)

- [x] **3.1 Showcase section pattern present.** The active chapter's panel
      shows a "What I built" summary, an achievements list, and a technologies
      list rendered as rounded bordered tags in the same pattern as the Work
      showcase cards at `/#skills`. *(FR-008)*
- [x] **3.2 Nothing lost.** For AViV (six `workDescription` lines), count the
      lines rendered: the summary sentence plus the achievement bullets must
      account for all six, with no line appearing twice and none missing.
      *(FR-009)*
- [x] **3.3 Panel is no taller than before.** Measure the panel's rendered
      height for the fullest chapter (AViV) at a fixed viewport width, and
      compare against the same measurement on `main`. The reworked panel is
      the same height or shorter. *(FR-009, SC-003)*
      **T003 baseline (pre-change, `div.chapter-panel.rounded-2xl.p-7`,
      1440×1000 viewport, career section default-active AViV chapter):
      height = 518px, column width ≈ 487px.**
      **T040 post-rework measurement (same viewport/chapter): height = 487px
      — 31px shorter than baseline. First attempt at the restructure (with a
      separate `p-6` "What I built" block and `p-7`→`p-6` padding only) came
      in at 589.5px, taller than baseline — the new section's own label and
      paragraph cost more than the one achievement line it removed. Fixed by
      merging `years` onto the "Chapter N · position" line, dropping padding
      to `p-5`, tightening every `mt-*`/`space-y-*` step, and using
      `leading-snug` instead of `leading-relaxed`.**
- [x] **3.4 Fallback tags appear.** No entry in `experiences.json` records
      `technologies`, so every chapter should show exactly the fallback tags —
      AWS, Java, Terraform, TypeScript — and no empty technologies section.
      *(FR-012)*
- [x] **3.5 Full company name in the panel.** The panel heading shows the full
      `AViV GmbH (Formerly Immowelt GmbH)`-style name, not the shortened
      on-pitch display name. *(spec Key Entities — only the pitch label is
      shortened)*

## US4 — A short tip explains the pitch (P3)

- [x] **4.1 Tip is present and one line.** Below the pitch sits a single short
      line of text saying players are clickable (and how to step between
      chapters). It is visible without any interaction and is visually distinct
      from the panel and the controls above. *(FR-007, SC-004)*

## Unaffected surfaces (regression)

- [x] **R.1 Controls intact.** Prev/next, the "Chapter N / 5" readout, and
      "Play in order" all still work, and Play still stops at the newest
      chapter rather than looping. *(spec Assumptions)*
- [x] **R.2 Pill list retained.** The company pill list above the pitch is
      still present and still jumps to any chapter — it was explicitly kept,
      not retired. *(clarification 4)*
- [x] **R.3 Route and pass lines intact.** The faint dashed route across all
      players and the solid orange pass line into the active chapter both still
      render.
- [x] **R.4 Dark mode.** Append `?experiment=true`, switch to dark, and confirm
      the new labels, focus ring, ball, and panel all remain legible (ADR 0019).
