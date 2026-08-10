# Contract: Hero Content Schema

The editable-content contract for the hero. This is what the owner may change without touching code (FR-005), and what the runtime validator enforces.

File: `public/data/home.json` · Validator: `HomeSchema` in `lib/utils/validation.ts`

## Shape

```json
{
  "name": "Prannoy Mulmi",
  "intro": "I build scalable cloud systems and lead engineering teams.",
  "roles": ["Software Engineer", "AI enthusiast", "Security Nerd"]
}
```

| Field | Required | Rule | Breaking change from current |
|---|---|---|---|
| `name` | yes | 1–100 chars | none |
| `intro` | yes | 20–200 chars | **new field** — currently hardcoded in `Hero.tsx` |
| `roles` | yes | 2–5 entries, each 3–40 chars | **semantics changed** — was 1–3 article-prefixed titles with only the first rendered; now all entries render, each annotated |

## Guarantees

| # | Guarantee | Requirement |
|---|---|---|
| C1 | Editing `name`, `intro`, or `roles` changes the hero with no code change and no redeploy of code | FR-005 |
| C2 | Every entry in `roles` receives a hand-drawn mark — none renders unannotated | FR-002 |
| C3 | Adding or removing a role still produces a coherent set of marks, with no error | FR-025 |
| C4 | Mark style is **not** settable from this file | FR-024 |
| C5 | A file failing validation surfaces the existing content-error fallback rather than a blank hero | existing `ContentProvider` behaviour |

## Separation from site metadata

The professional site-wide description (FR-022) is **not** in this file. It lives with the page metadata and is maintained independently, so editing hero copy never rewrites what appears in search results, and vice versa (FR-023).

Reference wording: *"Senior software engineer and cloud architect, with a focus on AI and security."*

## Out of contract

- Mark styles, colours, and ordering — code-defined (FR-024).
- The CTA button labels and destinations — unchanged by this feature.
