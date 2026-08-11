---
name: "speckit-feature-branch"
description: "Cut a feature branch off main before a new spec is written. Registered as a before_specify hook."
argument-hint: "The feature description passed to /speckit-specify"
compatibility: "Requires a git repository and the .specify/ directory"
metadata:
  author: "prannoy"
  source: "local hook — spec-kit's git extension is not installed in this project"
user-invocable: true
disable-model-invocation: false
---

# Cut the feature branch

Spec Kit's core `/speckit-specify` deliberately does not create branches — it
delegates that to a `before_specify` hook. The official hook ships with the git
extension, which is not installed here, so this skill stands in for it.

Without it every spec lands on whatever branch is checked out, which has been
`main`. Features 001–004 were committed straight to `main` for exactly this reason.

## Steps

1. **Read the feature description** — the argument passed through from
   `/speckit-specify`. If it is empty, stop and report that there is nothing to
   name a branch after.

2. **Check the current branch.**

   ```sh
   git branch --show-current
   git status --porcelain
   ```

   - If already on a `feat/`, `fix/`, or `docs/` branch, **do not create another**.
     Report the existing branch and stop — the user is likely adding a second spec
     to work already in progress.
   - If the working tree has uncommitted changes, stop and report them. Switching
     branches with a dirty tree drags unrelated edits onto the new branch.
   - Otherwise continue.

3. **Pick a prefix.** The constitution
   (`.specify/memory/constitution.md`, § Development Workflow) fixes the format as
   `feat/<slug>`, `fix/<slug>`, or `docs/<slug>`. Choose from the description:
   repairs to existing behaviour are `fix/`, documentation-only work is `docs/`,
   everything else is `feat/`. When a description mixes them — a bug fix plus a new
   capability — use `feat/`.

4. **Derive the slug** — 2–4 words, kebab-case, from the most meaningful terms in
   the description. Preserve technical terms and acronyms. This is the *branch*
   name; it is deliberately **not** the same as the numbered `NNN-<slug>` spec
   directory `/speckit-specify` will create.

5. **Create the branch off an up-to-date main.**

   ```sh
   git fetch origin main --quiet
   git checkout -b <prefix>/<slug> origin/main
   ```

   If `origin` does not exist, branch off local `main` instead and say so.
   If the branch name is already taken, append a short disambiguator rather than
   failing.

6. **Compute the next feature number** by scanning `specs/` for the highest
   existing `NNN-` prefix and adding one. This is advisory — `/speckit-specify`
   does its own numbering — but the hook contract expects it.

7. **Report** as JSON so the calling command can pick the values up:

   ```json
   { "BRANCH_NAME": "feat/example-slug", "FEATURE_NUM": "006" }
   ```

   Follow it with one plain sentence naming the branch and what it was cut from.

## Rules

- **Never create a branch from a dirty tree.** Stop and report instead.
- **Never commit anything.** This skill only creates and switches branches; the
  spec files do not exist yet.
- **Never force-delete or reset an existing branch.**
- If any git command fails, stop and report the error rather than continuing —
  a spec written on the wrong branch is worse than a spec not started.
