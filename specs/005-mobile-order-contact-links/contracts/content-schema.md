# Content Contract: `home.json` and `social.json`

**Feature**: 005-mobile-order-contact-links | **Date**: 2026-08-11

The site's only external interface is its content files: hand-edited JSON in
`public/data/`, fetched at runtime and validated by Zod before anything renders. This
document is the contract for the two files this feature touches — what a content editor
may write, and what the site guarantees in return.

---

## `public/data/home.json` — added `cv` key

### Contract

```jsonc
{
  // …existing keys unchanged…

  // OPTIONAL. Omit the whole object if there is no CV to link.
  "cv": {
    "label": "Download CV",                              // 2–40 characters
    "href": "https://example.com/prannoy-mulmi-cv.pdf"   // must be a valid absolute URL
  }
}
```

### Guarantees

| Editor writes | Site does |
|---|---|
| No `cv` key | Renders the opening section with no CV link. Not an error (FR-014). |
| Valid `cv` | Renders `label` as small text directly below the "View Work" / "Play Career" buttons, linking to `href` in a new tab. |
| `cv` with a label under 2 or over 40 characters | Fails validation at load — the opening section does not render. |
| `cv` with a malformed `href` | Fails validation at load, same as a malformed social address. |
| `cv.href` pointing at a dead or unreachable host | Renders the link normally. The site does not check the address and makes no promise about it. |

### Deliberate non-guarantees

- **The site never serves the CV.** `href` must be absolute and external. Committing a
  PDF to `public/` and pointing `cv.href` at it would contradict FR-010 and ADR 0017.
- **No download is forced.** The `download` attribute has no effect cross-origin;
  whether the CV opens inline or saves is the browser's and the host's decision.
- **No analytics.** Clicks are not counted.

---

## `public/data/social.json` — corrected value, unchanged shape

### Contract (unchanged)

```jsonc
{
  "social": [
    { "network": "LinkedIn", "href": "https://www.linkedin.com/in/prannoy-mulmi-0617026b/" },
    { "network": "GitHub",   "href": "https://github.com/prannoymulmi" }
  ]
}
```

`network` is matched case-insensitively against the glyph map in `SocialIcons.tsx`
(`linkedin`, `github`). An unrecognised network still renders as a working text link.
1–5 entries; each `href` must be a valid URL.

### New repository-level rule (FR-006, FR-007)

> **`public/data/social.json` is the only file in this repository that may define social
> link addresses.**

`app/data/social.json` is deleted by this feature. It was never served — `useContentLoader`
fetches `/data/*.json`, which resolves from `public/` — but it held a *different* LinkedIn
address from the served copy, and that divergence is why the wrong link survived. See
[ADR 0017](../../../docs/adr/) once written.

This rule cannot be expressed in a schema, so it is enforced by a test that fails if a
second `social.json` appears anywhere outside `public/data/`.

---

## UI contract: the CV link

What the rendered link must satisfy, independent of styling choices:

| Requirement | Contract |
|---|---|
| FR-008 | Appears in the opening section, directly below the two CTAs. Never in the navigation or footer. |
| FR-009 | Small plain text. Not a button, not sized or weighted like "View Work" / "Play Career". |
| FR-011 | Opens without closing or navigating away from the portfolio — the page keeps its scroll position. |
| FR-012 | Keyboard-reachable with a visible focus indicator; accessible name states it is the CV and that it opens in a new tab. |
| Contrast | Uses the `text-on-photo` token, already verified AA against the backdrop (ADR 0015). |
| Security | `rel="noopener noreferrer"` on the external target. |

---

## Reading-order contract: the opening section

Not a content contract, but the observable guarantee US1 makes:

| Viewport | Order |
|---|---|
| Narrow (below `lg`) | roles → intro → bio → CTAs → CV link → player card |
| Wide (`lg` and above) | text column left, player card right |
| Any | The announced order and the tab sequence match what is seen at that width — no `order-*` utility may reintroduce a divergence. |
