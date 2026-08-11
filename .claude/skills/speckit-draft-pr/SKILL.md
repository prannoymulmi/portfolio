---
name: "speckit-draft-pr"
description: "Commit the spec artefacts and open a draft PR for the feature. Registered as an after_specify hook."
argument-hint: "None — reads the feature directory from .specify/feature.json"
compatibility: "Requires git, an authenticated gh CLI, and a remote named origin"
metadata:
  author: "prannoy"
  source: "local hook"
user-invocable: true
disable-model-invocation: false
---

# Open the draft PR

Opens the pull request as soon as there is something to put in it — the spec.

A PR cannot exist at `before_specify`: there is no branch, no spec file, and no
commits, and GitHub rejects a pull request whose head and base have nothing between
them. Immediately *after* the spec is written is the earliest honest point, and it
still gives a link to watch from the very start of the feature.

## Steps

1. **Confirm there is something to open a PR from.**

   ```sh
   git branch --show-current
   ```

   - If the current branch is `main`, **stop**. The `before_specify` branch hook
     either did not run or failed; opening a PR from `main` is not recoverable.
     Report it clearly.
   - Read the feature directory from `.specify/feature.json`.

2. **Check whether a PR already exists** for this branch:

   ```sh
   gh pr list --head "$(git branch --show-current)" --state open --json number,url
   ```

   If one is open, report its URL and stop — this hook runs on every `/speckit-specify`,
   and a second spec on the same branch must not open a second PR.

3. **Commit the spec artefacts.** Stage only the feature directory — nothing else
   should be swept in:

   ```sh
   git add specs/<feature-dir>/
   ```

   Write the message in the constitution's format,
   `<type>(<scope>): <what> — <why>` (Principle III), as `docs(specs)`. State what
   the feature is for, not that a spec was generated.

   **Never add `Co-Authored-By` or `Claude-Session` trailers** — the user has ruled
   these out for this repository.

4. **Push and open the PR as a draft:**

   ```sh
   git push -u origin "$(git branch --show-current)"
   gh pr create --draft --base main --title "<feature title>" --body "<body>"
   ```

   The body should carry, briefly:
   - what the feature is and why it exists, in the user's terms;
   - a link to the spec path so a reviewer can read it;
   - an explicit note that this is **spec only** — no implementation yet;
   - any `[NEEDS CLARIFICATION]` markers still open in the spec, so a reviewer knows
     what is unsettled.

   Keep it short. It will be rewritten as the feature fills in.

5. **Report** the PR URL and that it is a draft.

## Rules

- **Draft, always.** `--draft` is not optional here: the PR contains a spec and no
  code, and a review-ready PR at that stage wastes a reviewer's time.
- **Stage only the feature directory.** Never `git add -A` — unrelated working-tree
  changes must not ride along.
- **Never open a second PR** for a branch that already has one.
- **Never mark the PR ready for review**, and never merge it. That is the user's
  call, after the implementation lands.
- If `gh` is not authenticated or `origin` is missing, commit the spec locally,
  report why the PR could not be opened, and stop. Losing the commit is worse than
  missing the PR.
