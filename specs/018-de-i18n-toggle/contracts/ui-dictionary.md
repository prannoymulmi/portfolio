# Contract: UI Dictionary

Internal contract (no public API). Governs the shape and rules for
`lib/i18n/ui.<locale>.json`.

## Shape

A nested object grouped by page area. Top-level groups (extend as needed,
do not rename once shipped without updating every consumer in the same
commit):

```
nav, hero, work, career, technologies, education, projects, contact,
footer, errors, a11y
```

Leaves are strings. No group nesting deeper than 2 levels
(`career.workTypes.fullTime`, not deeper) — flat enough to scan, per
Principle I.

## Schema

```ts
// lib/i18n/uiSchema.ts
import { z } from 'zod';

export const UiSchema = z.object({
  nav: z.object({ jumpTo: z.string().min(1), /* ... */ }),
  hero: z.object({ /* ... */ }),
  // one object per top-level group, every leaf z.string().min(1)
});

export type Ui = z.infer<typeof UiSchema>;
```

Every locale file is parsed against `UiSchema` (at minimum in the parity
test; optionally also at `useUi()` call time in development) — an empty
string or wrong-typed leaf fails validation, not just a missing key.

## Completeness rule (enforced by test, not by the compiler)

`tests/unit/i18n/ui-parity.test.ts`:
1. Loads `ui.en.json` (the source of truth) and every other `ui.<code>.json`
   that exists.
2. Recursively flattens each to dot-path keys (e.g. `nav.jumpTo`).
3. Asserts each non-English locale's flattened key set is **exactly equal**
   to English's — fails on any missing key *and* any extra key.
4. Asserts every leaf value validates against `UiSchema` (non-empty
   string).

This test is part of `pnpm test`, which CI runs on every PR and blocks
merge on failure (Development Workflow, constitution) — the same
enforcement strength as a compile error, just surfaced by the test suite
instead of `tsc`.

## Access rule

Always static property access:

```ts
const ui = useUi();
<span>{ui.nav.jumpTo}</span>
```

**Never** dynamic key lookup (`ui[key]`, `t('nav.jumpTo')`). Dynamic lookup
bypasses both the schema validation and the parity test's ability to prove
a key is actually used correctly, and reintroduces indirection Principle I
disfavors when direct property access is equally simple.

## Interpolation

For strings with a variable, use `{name}`-style placeholders and resolve
through `format()`:

```ts
// dictionary
"company": "Technologies used at {company}"

// call site
format(ui.technologies.company, { company: experience.subtitle })
```

`format()` (`lib/i18n/format.ts`) is a pure function: template string in,
substituted string out. Unknown placeholders are left intact rather than
throwing (fail visibly-but-not-fatally in dev, per Principle I — no
clever fallback logic).

## Loading

`ui.en.json` / `ui.de.json` are statically imported (`import uiEn from
'./ui.en.json'`), bundled at build time like any other module — not
fetched at runtime. This matters because the site's chrome (nav, buttons)
has no loading skeleton today; a runtime fetch would risk rendering empty
labels before the request resolves, which a build-time import cannot.

## Scope rule

Any string a visitor can read or hear belongs in the dictionary, including
every `aria-label`, `alt` text, and screen-reader-only text — not just
visible copy. Authored long-form content (bio paragraphs, project
descriptions, experience bullet points) stays in the Locale Content Set
(the fetched, Zod-validated JSON under `public/data/<locale>/`), not here
— see `contracts/locale-content-set.md` for that boundary.
