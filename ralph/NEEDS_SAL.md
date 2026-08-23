# NEEDS_SAL

Everything the loop could not resolve on its own. Sal reads this once at run end; the loop writes to
it mid-run and never waits for an answer. Writing an entry here and shipping conservative copy is the
**correct** outcome for a gap - it is not a failure, and it never justifies inventing a fact.

If the stall rule fires, a `## STALLED` banner is written at the **top** of this file, above
everything else.

## Categories

| Category | Means |
| --- | --- |
| `missing fact` | Copy needed something not in live site copy or the vault. Page shipped conservative; the specific claim was left out. |
| `blocked reason` | A task is marked `[blocked]` in TASKS.md. Every `[blocked]` task must have an entry here - the completion promise checks for it. |
| `guardrail incident` | The loop touched, or nearly touched, something outside its allowed paths. What happened, what was reverted, whether verify still passed afterwards. |
| `wanted-but-out-of-scope` | A real improvement noticed while building that this batch may not do (needs an existing file edited, a new claim, or a decision). Parked for Sal. |

## Entry format

```
### <ID> <category> - <task-id> <slug>
- Needed: <what is missing, in one or two sentences>
- Shipped instead: <the conservative fallback that is live in the file right now>
- Suggested next step: <the smallest concrete thing Sal can do to unblock it>
```

IDs run `S-001`, `S-002`, ... Never renumber; never delete an entry once written. The next free ID is
always one past the highest ID already in **Open items**; there is no example entry to confuse it with.

---

## Open items

### S-001 wanted-but-out-of-scope - setup - RESOLVED 2026-08-23, before RUN 1
- Needed: `.gitignore` did not list `.claude/ralph-loop.local.md`. The `ralph-loop` plugin writes its
  state file there, so it would show up as untracked dirt in every Step 0 / Step 5 `git status` check
  and risk being read as a guardrail violation.
- Shipped instead: n/a - resolved during setup. The branch-setup hunk adds 6 lines to `.gitignore`:
  `.claude/ralph-loop.local.md` (plugin state, kept for the D5 path even though D10 uses `run.sh`) and
  `ralph/logs/` (where `run.sh` writes every transcript). That `.gitignore` edit is the one pre-existing
  file legitimately changed on this branch, done during setup, not by the loop. The loop must never edit
  it again **and must never revert it**: ` M .gitignore` in `git status` is sanctioned state, not dirt.
- Suggested next step: none. Left in place as the record of why that line exists.
