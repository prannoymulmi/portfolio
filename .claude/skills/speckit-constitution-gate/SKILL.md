---
name: "speckit-constitution-gate"
description: "Check a proposed feature against the project constitution before the spec is written. Registered as a before_specify hook."
argument-hint: "The feature description passed to /speckit-specify"
compatibility: "Requires .specify/memory/constitution.md"
metadata:
  author: "prannoy"
  source: "local hook"
user-invocable: true
disable-model-invocation: false
---

# Constitution gate

Run the proposed feature past `.specify/memory/constitution.md` **before** the spec
is written, not after. `/speckit-plan` already has a Constitution Check gate, but by
then the spec has committed to an approach — and a spec that assumes a fourth
animation library or a CMS is a spec that has to be rewritten, not adjusted.

This gate reports. It stops the workflow only for a plain contradiction of a
NON-NEGOTIABLE principle, because guessing at violations from a one-line
description would make it noise.

## Steps

1. **Read `.specify/memory/constitution.md` in full.** If it is missing, say so and
   return control immediately — the absence of a constitution is not a failure.

2. **Extract the binding constraints**, not the whole document:
   - Every principle marked **NON-NEGOTIABLE**.
   - The fixed technology stack under Principle IV, including the "no substitution
     or extension without an amendment" rule.
   - The Technology & Quality Constraints section (contrast tokens, inline-style
     limits, dark-mode selector rules, performance floor).
   - Any rule requiring an ADR.

3. **Match them against the feature description.** For each constraint that the
   described work would touch, note it. Be concrete: name the principle and what it
   demands of *this* feature.

4. **Classify the outcome** as one of three:

   | Outcome | Meaning | What to do |
   |---|---|---|
   | **Clear** | Nothing in the description touches a binding constraint. | Report briefly and continue. |
   | **Constrained** | The work is allowed but the constitution dictates how. | Report the constraints as a short list the spec must respect, then continue. |
   | **Conflict** | The description plainly requires something a NON-NEGOTIABLE forbids — a new dependency in a fixed slot, a CMS or database, a fourth animation library, CSS-in-JS, a `prefers-color-scheme` dark mode. | **Stop.** Name the principle, quote the clause, and give the user the choice: change the approach, or amend the constitution first (which needs an ADR *and* a constitution amendment in the same PR). |

5. **Flag ADR obligations early.** If the work would add or remove a dependency,
   change the site's structure or URLs, change how content is stored, loaded, or
   validated, or commit the design to a metaphor, say so now — Principle VI requires
   the ADR to land in the same PR, and it is much cheaper to plan for than to
   retrofit.

6. **Report** in at most a dozen lines. Lead with the outcome. This runs before
   every spec; a wall of text every time will train the reader to skip it.

## Rules

- **Do not rewrite the constitution**, and do not propose amendments as part of this
  gate. Report the conflict and let the user decide.
- **Do not block on "Constrained".** Constraints are guidance for the spec, not a
  veto. Only a plain contradiction of a NON-NEGOTIABLE stops the workflow.
- **Do not restate principles the feature does not touch.** Relevance is the whole
  value here.
- When uncertain whether something is a conflict, treat it as **Constrained** and
  say what would make it a conflict. A false stop is more expensive than a note.
