# Contract: Legacy Route Redirects

This is the public URL contract visitors, search engines, and existing external links (resume, LinkedIn, etc.) depend on after the portfolio becomes a single scrolling story. It resolves FR-009 / SC-006 from [spec.md](../spec.md).

Implemented as `async redirects()` in `next.config.ts` (see [research.md](../research.md#5-redirecting-the-seven-legacy-page-urls)).

| Source (old page) | Destination (story anchor) | Type |
|---|---|---|
| `/skills` | `/#skills` | 308 permanent |
| `/career` | `/#career` | 308 permanent |
| `/education` | `/#education` | 308 permanent |
| `/projects` | `/#projects` | 308 permanent |
| `/playbook` | `/#playbook` | 308 permanent |
| `/about` | `/#about` | 308 permanent |
| `/contact` | `/#contact` | 308 permanent |

**Guarantees**:
- Every path above returns a 308 (permanent) redirect, never a 404.
- The destination anchor always matches a real `id` on an existing `StorySection` rendered in `app/page.tsx`.
- `/` itself is unaffected and continues to serve the full story from the top.

**Out of contract**: query strings or sub-paths beyond the seven exact source paths (e.g., `/projects/some-slug`) are not covered — none of the current pages have sub-routes, so none are expected.
