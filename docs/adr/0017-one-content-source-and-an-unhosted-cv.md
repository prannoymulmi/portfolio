# ADR 0017: One content source, and a CV the site does not host

- **Status**: Accepted
- **Date**: 2026-08-11
- **Amends**: [ADR 0001](0001-json-files-over-cms.md) — removes half of the
  second content directory that ADR records the existence of.

## Context

Two content-storage questions came up together while fixing a wrong LinkedIn
link and adding a CV link. Both change how content is stored, which is what
makes them ADR material rather than housekeeping.

**The duplicate.** [ADR 0001](0001-json-files-over-cms.md) chose JSON files in
`public/`, and noted in passing that "a second set of JSON files exists under
`app/data/`". `useContentLoader` fetches `/data/*.json`, which resolves from
`public/` — so the `app/data/` copies have never been served. Feature 004
identified them as dead and drifted and deferred cleanup as separable work.

That deferral had a cost nobody had priced. The two `social.json` files
disagreed, and the *unserved* one held the **correct** LinkedIn address while
the served one pointed at a profile that is not the owner's. Anyone who checked
"is the LinkedIn link right?" by opening a `social.json` had even odds of
opening the reassuring file and concluding it was fine. The link stayed broken
through four features.

**The CV.** The site had nothing for a recruiter to take away. The obvious
implementation is a PDF in `public/` with a `download` attribute pointing at
it. But a CV routinely carries a home address and a phone number, and this
repository is public: committing the file publishes those permanently into git
history, where deleting the file later does not remove them.

## Decision

**`public/data/` is the only place content may live.** `app/data/social.json`
is deleted. Because no schema can express "only one file may define this", the
rule is enforced by a test in `tests/integration/content-sources.test.ts` that
walks the repository and fails if a second `social.json` appears anywhere.

The other four files under `app/data/` are equally dead and equally
unreferenced, but removing them is not this change's job; they stay, and the
rule above is enforced only for the file that actually caused harm. That is a
deliberately narrow enforcement, not an oversight — see Consequences.

**The CV is referenced, never hosted.** `home.json` gains an optional
`cv: { label, href }`, where `href` is an absolute external URL validated by
`z.string().url()`. The site renders a link and nothing more: it does not
fetch the document, does not check that the address resolves, and never holds
a copy. `CvLinkSchema` in `lib/utils/validation.ts` is the contract; the field
is optional, and its absence renders no link at all rather than an error.

## Consequences

**Positive**

- The class of bug that hid the LinkedIn error is gone for social links: there
  is one file, so "which copy is real?" has no answer to get wrong.
- The test enforces a repository invariant that no type or schema can. It fails
  on restoration of the file, not merely on its absence today.
- No personal contact details enter git history. The owner can rotate, redact,
  or withdraw the CV at any time by changing what the external host serves,
  with no commit and no deploy.
- The CV link is content, so its label and address are editable without a code
  change — the same workflow as every other link on the site (ADR 0001).
- The absent state is a designed case with a test, so the feature shipped
  complete before the address existed.

**Negative**

- **Availability of the CV is outside our control.** If the host goes down or
  the address goes stale, the link breaks and nothing here notices. Deliberate:
  health-checking an external document is a service, and this site is a static
  page.
- **`download` does not work cross-origin.** Browsers ignore the attribute for
  external documents, so whether the CV opens inline or saves is the host's
  decision. Self-hosting would have bought that control, at the cost above.
- **The enforcement is narrower than the principle.** Four dead files remain
  under `app/data/`, and the test only guards `social.json`. A future editor
  could still find `app/data/skills.json` and edit it to no effect. Widening
  the test means deleting those files first, which is the separable work
  feature 004 scoped and this change is not.
- **The CV is still public.** Off-repository is not private: anyone with the
  address can fetch it. This decision limits permanence, not reach.

## Alternatives rejected

- **Sync the two `social.json` files instead of deleting one**: keeps a file
  that looks authoritative, is never read, and can drift again the moment
  someone edits one and not the other. It preserves exactly the trap that cost
  four features.
- **Delete all of `app/data/` in this change**: correct eventually, but four of
  the five files are unrelated to the bug being fixed, and mixing them in makes
  a content-correction commit unreviewable.
- **Commit the CV to `public/` and use `download`**: the conventional answer,
  and the one that puts a home address and phone number into a public
  repository's history forever. Rejected on privacy; the convenience it buys is
  a `download` attribute the owner does not need.
- **Put the CV in `social.json` alongside LinkedIn and GitHub**: it is an
  outbound link, so this is tempting. But `SocialIcons` renders every entry as
  a brand glyph, and a CV has none — it would fall through to the text fallback
  and sit as a word in a row of icons. It is hero content that happens to point
  outward, so it lives with the hero content.
