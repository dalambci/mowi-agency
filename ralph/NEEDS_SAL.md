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

### S-002 wanted-but-out-of-scope - setup (2026-09-02)
- Needed: eight platforms in the dashboard's `config/shop_platforms.php` carry a `doc_url` pointing at a
  docs page that **does not exist** on mowi.agency, so the "lees de handleiding" link in the dashboard's
  own connect screen 404s today: `koppeling-lightspeed`, `koppeling-shopware`, `koppeling-magento`,
  `koppeling-bol`, `koppeling-prestashop`, `koppeling-hubspot`, `koppeling-guestplan`,
  `koppeling-calendly`. Only `woocommerce`, `shopify`, `pipedrive` and `google-agenda` resolve.
- Shipped instead: nothing - this is a dashboard-side bug found while sourcing grounding material, not a
  batch task. It is also **why** 7 of the 11 landers have no docs page to ground copy in (TASKS.md header).
- Suggested next step: decide whether the missing docs pages get written (they would ground both the
  landers and the dashboard link), or whether the dashboard should drop the `doc_url` for those eight
  until a page exists. Either is a separate job from this batch.

### S-003 wanted-but-out-of-scope - setup (2026-09-02)
- Needed: **Shopware, bol.com and Guestplan** are `implemented => true` in the dashboard - a customer can
  connect them today - but `koppelingen.html` still lists all three under "Op de planning". They are
  therefore out of scope under D2/D14 and have no lander.
- Shipped instead: nothing. The 11 landers cover only what the public hub page calls live.
- Suggested next step: one word from Sal. If those three are genuinely live, they become T12-T14 on the
  same spec and the hub page's cards move from "Op de planning" to "Nu al te koppelen" in the supervised
  T99 wiring pass - the hub page is a shared file, so it cannot move inside a loop run.

### S-004 wanted-but-out-of-scope - setup (2026-09-02)
- Needed: master's working tree had two uncommitted `.gitignore` additions (`out/` and
  `content/social-templates/.render-tmp.html`) that blocked the branch switch. They are parked in
  `stash@{0}` ("ralph phase0: master .gitignore additions...").
- Shipped instead: the same two lines were added to this branch's `.gitignore` directly, so the loop is
  not affected either way. The stash is a belt-and-braces copy, deliberately not dropped.
- Suggested next step: when the social-content workstream gets committed on master, `git stash pop` there
  (or just re-add the two lines) and drop the stash. Nothing in this batch depends on it.

### S-005 wanted-but-out-of-scope - setup (2026-09-02)
- Needed: commit `2f0991b` (2026-08-24, "Add accounting workflows and 3 boekhouding integrations from
  autoboeker.nl") lives on this branch only - it is not on `origin/master`. It edits `index.html` and
  `koppelingen.html`, and it adds **Twinfield, SnelStart and e-Boekhouden.nl** to the hub page's "Op de
  planning" list. `verify.mjs`'s `vendors` check treats "SnelStart" and "Twinfield" as forbidden names
  (D2), so the existing hub page now fails that check - new landers are unaffected, they never name them.
- Shipped instead: nothing changed. The commit predates this session and is unrelated to the batch.
- Suggested next step: decide whether that commit belongs on master at all, and whether "Op de planning"
  counts as naming a vendor for D2's purposes. If it does, the hub page needs a separate pass - it is a
  shared file and out of this batch's reach.
