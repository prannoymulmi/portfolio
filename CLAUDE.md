@AGENTS.md
# Multi-Agent Development Workflow

This project uses three specialized Claude Code agents:

- `architect` → Opus
- `coder` → Sonnet
- `release` → Haiku

The agents have clearly separated responsibilities.

---

## 1. Default Workflow

For a new feature or significant change, follow this workflow:

1. Use `architect` for requirements and Spec Kit planning.
2. Use `coder` for implementation.
3. Use `coder` for tests and normal debugging.
4. If the coder encounters a genuinely difficult reasoning or architectural
   problem, escalate to `architect`.
5. After implementation is complete and tests pass, use `release`.
6. `release` handles commits, pushes, and pull requests.

The normal flow is:

User
→ Architect
→ Coder
→ optional Architect escalation
→ Coder
→ Release

---

# 2. Architect Agent

The architect agent uses Opus.

Use it for reasoning-heavy work:

- Requirements analysis
- Architecture
- `/speckit.specify`
- `/speckit.clarify`
- `/speckit.plan`
- `/speckit.checklist`
- `/speckit.tasks`
- `/speckit.analyze`
- Security-sensitive design decisions
- Complex technical decisions
- Difficult problems escalated by the coder

The architect should prefer reasoning and planning over implementation.

---

# 3. Coder Agent

The coder agent uses Sonnet.

Use it for:

- `/speckit.implement`
- Production code
- Tests
- Normal debugging
- Refactoring
- Documentation required by the implementation

Sonnet should attempt normal debugging before escalating.

---

# 4. Escalation From Sonnet to Opus

The coder should escalate to the architect when the problem requires
substantial reasoning. Ask before changing to Opus from sonnet and tell me which effort you used and after a manual yes you can switch to Opus.

Escalate when:

- Multiple reasonable fixes have failed.
- The specification is ambiguous or contradictory.
- The implementation plan appears incorrect.
- An architectural decision is required.
- The problem involves difficult concurrency.
- The problem involves distributed-system behavior.
- The problem involves a significant security decision.
- The problem requires a non-trivial algorithmic solution.
- The fix would require substantial changes across unrelated components.
- The coder cannot confidently determine the correct solution.

Do NOT escalate:

- Simple syntax errors.
- Straightforward compilation errors.
- Normal test failures.
- Simple API mistakes.
- Ordinary debugging that Sonnet can reasonably solve.
- If the user denies the request to jump to Opus

When escalating, provide the architect with:

- The problem
- What was attempted
- Error messages
- Relevant files
- Relevant specification/task
- The architectural decision that needs to be made

The architect should provide reasoning and a recommended solution.

The coder then continues the implementation.

---

# 5. Release Agent Git Ownership

The `release` agent is responsible for repository-changing Git operations.

Only the `release` agent may perform:

- `git add`
- `git commit`
- `git push`
- `git reset`
- `git rebase`
- `git merge`
- `gh pr create`
- `gh pr merge`

The architect and coder must NOT perform these operations.

Read-only Git commands are allowed when needed:

- `git status`
- `git diff`
- `git log`
- `git branch`

---

# 6. Spec Kit Commit Policy

Do NOT automatically create a Git commit after every Spec Kit phase.

The following phases should normally modify artifacts without committing:

- `/speckit.specify`
- `/speckit.clarify`
- `/speckit.plan`
- `/speckit.checklist`
- `/speckit.tasks`
- `/speckit.analyze`

The architect must not commit these changes.

Once the planning workflow is complete, continue to implementation.

The release agent may create a commit when explicitly requested or when the
workflow reaches the release stage.

---

# 7. Implementation Workflow

After planning is complete:

1. Read the specification.
2. Read the plan.
3. Read the tasks.
4. Implement the tasks using the `coder`.
5. Run relevant tests.
6. Fix normal failures using Sonnet.
7. Escalate difficult problems to the `architect`.
8. Continue implementation after receiving architectural guidance.
9. Verify the implementation.
10. Hand off to `release`.

---

# 8. Release Workflow

After implementation and testing are complete:

1. Use the `release` agent.
2. Inspect `git status`.
3. Inspect the diff.
4. Verify the changes correspond to the requested work.
5. Create an appropriate commit.
6. Push the branch when appropriate.
7. Create the pull request when requested.

The release agent should not redesign or substantially modify the application.

## 8.1 Commit Message Format

Commit format is governed by the constitution
(`.specify/memory/constitution.md`, Principle III) — it is the source of
truth; this section only surfaces the split so it isn't missed:

- **`release`-agent commits** (implementation/release-stage work, step 5
  above): a haiku — three lines, 5-7-5 syllables, no `<type>(<scope>)`
  prefix. No Claude/Anthropic trailers on any commit, release or otherwise.
- **Every other commit** (including `docs(specs)` Spec Kit hook commits,
  e.g. `speckit-draft-pr`, and constitution/governance changes): the full
  `<type>(<scope>): <what> — <why>` format.

If the constitution and this file ever disagree, the constitution wins —
amend it first, then update this section to match.

---

# 9. Model Strategy

Prefer the cheapest model capable of doing the work.

Use:

Opus
→ reasoning, architecture, planning, difficult problems

Sonnet
→ implementation, testing, normal debugging

Haiku
→ Release: commits, pushes, PRs, mechanical release work

Do not use Opus for ordinary coding when Sonnet can reasonably handle it.

Do not use Sonnet or Haiku for architectural decisions that require Opus.

---

# 10. General Rule

Do not make architectural decisions merely to make an implementation pass.

When there is uncertainty about requirements or architecture, stop and
escalate to the architect.

Keep implementation focused on the approved specification and tasks.