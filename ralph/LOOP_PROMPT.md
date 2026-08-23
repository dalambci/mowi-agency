# Ralph loop prompt - mowi.agency site batch

You are **one iteration** of a Ralph loop. Each iteration is a **separate `claude -p` process with no
memory of any earlier iteration** (see `ralph/run.sh`) - not a compacted memory, none at all. **FILES ARE
THE ONLY STATE.** Trust `ralph/TASKS.md` and `git`, never recollection. Do exactly one task, then stop.

## Step 0 - RECOVER

Run `git status --porcelain`.

- Clean -> continue to Step 1.
- ` M .gitignore` -> **sanctioned branch-setup state. Leave it exactly as it is.** It carries the ignore
  rules for `.claude/ralph-loop.local.md` and `ralph/logs/`, and `run.sh` writes every transcript into
  `ralph/logs/`. Never revert it, never edit it, never log it as an incident. It may appear on its own or
  alongside real dirt; either way it is not dirt.
- Dirt **only** inside the current first-unchecked task's allowed paths, or inside `ralph/` ->
  a previous iteration was interrupted. Adopt that work and continue it as this iteration's task.
- Anything else (any path outside those) -> revert it before doing anything else:
  tracked files `git checkout -- <path>`, untracked files `git clean -f -- <path>` naming the exact path.
  **Never `git clean -fd`, and never `git clean -f` without a pathspec** - at the repo root that deletes the
  entire untracked `ralph/` directory, `verify.mjs` included. There is no `rm` in your tool allowlist and
  you do not need one. Then log the incident in `ralph/NEEDS_SAL.md` under category `guardrail incident`
  and continue to Step 1.

## Step 1 - RE-READ (read, do not skim)

Every iteration, without exception, because you have no memory of having read them:

- `ralph/TASKS.md` (whole file)
- `ralph/SPEC.md`, six sections: **Guardrails** (3), **Lander page spec** (4), **IT-partner sheet spec** (5),
  **Verification** (6), **Allowed-paths gate** (7), **Content sources** (9). Section 7 holds the revert
  procedure and commit rules that Step 5 below only summarises; section 9 holds the truth order and the Gap
  rule, which is the only instruction you have about where copy comes from.

## Step 2 - PICK

Take the **first** task in the active run that is unchecked `[ ]`, not `[SUPERVISED]`, not `[blocked]`.
A blocked task is written `- [blocked] T0N - ...`: the checkbox is **replaced**, never annotated.
The active run is named in the loop command ("Active run: RUN 1"). Tasks from other runs are not yours.
No such task left -> go to **Finishing**.

## Step 3 - BUILD

Build **only** that task, and only inside its allowed paths.

- Copy `<header>` and `<footer>` **verbatim** from `test.html` (the chrome canon). Remove nothing except:
  landers get **no** `aria-current="page"` anywhere, because they are not in the nav.
- Read the current cache-bust `?v=` strings **live from `index.html`** at build time. Never hardcode them
  and never carry them over from a previous iteration's memory.
- Never edit a file that existed before this branch.

## Step 4 - VERIFY

```
node ralph/verify.mjs <built files>
node ralph/verify.mjs --dom <built files>
```

Fix and re-run until both exit 0. **Maximum 3 fix rounds.** Still red after 3 -> rewrite the task's line as
`- [blocked] T0N - ...` in `ralph/TASKS.md`, log why in `ralph/NEEDS_SAL.md` under category
`blocked reason`, commit **only** the `ralph/` updates, end the iteration.

`[blocked]` means "I built it and the gate still refuses it", never "this looks hard". See **Finishing**
for what a blocked entry has to contain.

## Step 5 - PATHS GATE

Run `git status --porcelain` again. Every listed path must be inside this task's allowed paths or inside
`ralph/`, with the single exception of ` M .gitignore` (Step 0: sanctioned, never reverted). Any violation
-> revert it (`git checkout -- <path>` if tracked, `git clean -f -- <path>` if untracked, never `-d`, never
without a pathspec), log it in `ralph/NEEDS_SAL.md`, **then re-run `verify.mjs`**: if the page only passed
because of the file you just reverted, the attempt failed and counts toward the 3 rounds.

## Step 6 - RECORD

- Mark the task `[x]` in `ralph/TASKS.md`.
- Append 3-5 lines to `ralph/PROGRESS.md` in the documented entry format.
- Add the page's entry to `ralph/REVIEW.md`.

## Step 7 - COMMIT by explicit path

```
git add <each built file> ralph/
git commit -m "ralph: <task-id> <slug>"
```

**NEVER `git add -A`. NEVER `git add .`.**

## Step 8 - STOP

Do not start a second task. Do not "get a head start" on the next one. The loop will call you again.

---

## Finishing

The completion promise is a **checkable predicate**, not a feeling:

> every task in the active run is `[x]` or `[blocked]`, **and** every `[blocked]` task has a
> matching `blocked reason` entry in `ralph/NEEDS_SAL.md`, **and** at least one task in the active
> run is `[x]`

`[blocked]` is earned, not declared. A task may be marked `[blocked]` only if its `ralph/PROGRESS.md` entry
**names the file(s) that were actually built and quotes the `verify.mjs` check ids that were still FAIL
after the third fix round.** "No groundable content" is not a blocked reason: a thin page plus a
`missing fact` entry is the correct outcome for a content gap (SPEC section 9, Gap rule), and the page still
gets built.

If **no** task in the active run is `[x]`, you may not emit the promise from this section at all. Go to the
**Stall rule** instead and finish through that path, which writes the `## STALLED` banner Sal needs in order
to tell an empty run from a real one.

Open `ralph/TASKS.md` and confirm all three clauses are literally true, task by task. Only then output the
active run's promise as the very last thing you say, wrapped exactly like this and with nothing after it:

- RUN 1 -> `<promise>RUN 1 DONE</promise>`
- RUN 2 -> `<promise>SITE BATCH DONE</promise>`

Apart from that one final line, never emit a promise string: not in a commit message, not in a file you
write, not quoted back "as an example", not in a progress note. One true promise, once, at the end.

## Stall rule

Read the last 3 entries of `ralph/PROGRESS.md`. Take this path if **either** is true:

- 3 consecutive iterations produced no new `[x]`; or
- there is no pickable task left in the active run and **no** task in it is `[x]` (the case Finishing hands
  you). A run that produced nothing must end loudly, not by looping until the iteration cap.

Then:

1. Write a `## STALLED` banner at the **top** of `ralph/NEEDS_SAL.md` listing exactly what is stuck,
   **plus one `S-xxx` `blocked reason` entry per task you are about to mark `[blocked] (stalled)`.** Those
   per-task entries are what the Finishing predicate checks for; the banner alone does not satisfy it.
   Tasks already marked `[blocked]` in an earlier iteration already have their own entry: do not duplicate.
2. Rewrite every remaining workable task as `- [blocked] (stalled) T0N - ...` in `ralph/TASKS.md`.
3. Commit.
4. Output the active run's promise, wrapped exactly as above, as the very last thing you say. The stall path
   is the one case where the "at least one task is `[x]`" clause does not apply: the `## STALLED` banner
   replaces it as the signal to Sal.

Why a stalled run still ends through the same promise: `run.sh` exact-matches **one** promise string per
run, so there is no separate "failed" exit. The `## STALLED` banner is how Sal tells a stall from a clean
finish, and the iteration cap is the backstop if even this rule does not fire.

## NEVER list

- Never edit any file that existed before this branch: `css/*`, `js/*` (`docs-nav.js` above all),
  `build-blog.js`, `test.html`, `serve.js`, `sitemap.xml` (generated), `CLAUDE.md`, `.claude/*`,
  every existing page and stub.
- Never `git push`. Never `ssh`, `scp`, or anything pointed at Cloudways or any host.
- Never run `build-blog.js` or `generate-it-sheets.js` (T99 only, supervised, with Sal).
- Never an em dash **anywhere inside `<main>`, attribute values included** (`alt`, `aria-label`, `title`, an
  `href`), nor in the meta description, nor in any JSON-LD string. Every spelling counts: `—`, `&mdash;`,
  `&#8212;`, `&#08212;`, `&#x2014;`, `&#X02014;`. The `<title>`'s `" — Mowi"` is the only exempt one.
  The 4 `docs/koppeling-*.html` pages are full of em dashes and predate the rule: never paste a sentence
  from one verbatim, rewrite the dash as a comma, a colon, or a full stop.
- Never "je"/"jij". Dutch, formal **u**, always.
- Never a capability claim you cannot point at in live copy (koppelingen.html, the 4 docs pages,
  pricing.html, security.html). **`workflows.html` has an empty `<main>`: it supplies nav fragment names
  only and can ground nothing.** Gaps go to `ralph/NEEDS_SAL.md` + conservative copy.
- Never name Salesforce, SnelStart, SAP, Dynamics 365, Twinfield or Excel as something Mowi koppelt.
- Never invent prices or dashboard click-paths.
- Never output a promise that is not literally true.
- Never do the vault session-logging mid-loop. That happens once at run end, with Sal.
