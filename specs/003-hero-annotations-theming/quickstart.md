# Quickstart: Validating the Annotated Hero & Theme Switching

## Prerequisites

```bash
npm install
npm run type-check && npm run lint && npm test
```

## Run it

```bash
npm run dev
```

Open `http://localhost:3000/`.

## Validation scenarios

### Annotated hero

1. **Marks appear** (SC-001, FR-002): Load `/`. Within ~2s of the page becoming interactive, each of the three role phrases carries a hand-drawn mark. Confirm the marks differ from one another rather than repeating one style.
2. **Text is legible** (FR-006): Confirm every annotated phrase is readable with the mark applied — the mark sits behind or around the words, not over them.
3. **Reflow alignment** (SC-006, FR-004): Drag the window narrower until the hero text rewraps. Every mark re-aligns to its phrase. Also hard-reload on a throttled connection and confirm marks aren't stranded after the web font swaps in.
4. **Reduced motion** (SC-008, FR-003): Enable reduced motion in OS settings, reload. Marks are present and complete, but do not animate in.
5. **Content-editable** (C1, C3): Edit `roles` in `public/data/home.json` — change a phrase, then add a fourth. Reload. New phrasing appears, the fourth phrase is annotated too, no error.
6. **Mark styles not content-driven** (C4): Confirm adding a `style` key to a role in the JSON has no effect (and does not fail validation loudly in a way that blanks the hero).

### Hero layout

7. **Portrait beside text** (FR-007): At desktop width, the portrait sits to one side of the introduction, not above it.
8. **Mobile stacking** (FR-008, SC-005): Narrow to 320px. Portrait and text stack, everything is readable, no horizontal scrollbar.
9. **Composition** (FR-026, FR-027): Name, annotated phrases, intro line, and both CTA buttons are present. The "Core Expertise" card is **gone** — and the Skills chapter further down still shows that content.
10. **Placeholder** (FR-009): With no `imageSource` set, the intentional placeholder occupies the portrait slot. Set one, reload, confirm the photo swaps in with no layout break.

### Theme switching

11. **Control is present and keyboard-reachable** (T1, SC-009): Tab through the page from the top. The theme control receives focus with a visible focus ring and activates with Enter/Space.
12. **Whole page responds** (T2, SC-002): Toggle the theme. Scroll the entire story. Confirm every section, the background accent, and the hero annotations are all in the new theme — nothing stuck in the old one.
13. **Persistence** (T3, SC-003): Choose dark, reload — still dark. Quit and reopen the browser, load again — still dark.
14. **No flash** (T4, SC-004): With dark stored, hard-reload several times (throttle CPU in DevTools to exaggerate). The first paint must be dark; a white flash is a failure.
15. **Explicit choice beats OS** (FR-013): With dark stored, switch the OS to light. The site stays dark.
16. **OS default before any choice** (T5, FR-014): Clear site data, set OS to dark, load. Site opens dark without any stored choice.
17. **Contrast** (T6, SC-007): In both themes, check the hero, annotated phrases, and body text with an accessibility contrast inspector. All meet WCAG AA.

### Decision records

18. **ADRs exist and are indexed** (SC-010, FR-018): `docs/adr/README.md` lists 0009, 0010, and 0011 with statuses.
19. **Conflicts named** (FR-020): ADR 0009 states it amends ADR 0005 and its resulting status; ADR 0011 states what it supersedes in ADR 0006.
20. **Legible to a newcomer** (SC-011): Read any one record cold — you can state what was chosen, what was rejected, and what it costs.

## Automated checks

```bash
npm run type-check
npm run lint
npm test
npm run build
```

Then confirm the performance budget still holds (constitution: Lighthouse ≥ 90):

```bash
npm run start
# run Lighthouse against http://localhost:3000 in a fresh Chrome profile
```

Expected new/updated test coverage: annotation rendering and reduced-motion behaviour, theme persistence and precedence, hero composition (Core Expertise absent), and the updated content schema.
