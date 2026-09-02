# DECISIONS

Running log of binding decisions for the `ralph/site-batch` build. Entries are dated and never
rewritten - if a decision changes, add a new entry that supersedes the old one by ID and say so.
Seeded entries D1-D9 were agreed with Sal before the loop started and are **binding**: the loop may
not relitigate them, only follow them or raise a conflict in `ralph/NEEDS_SAL.md`.

**D5 is superseded by D10. D2's pilot ORDER is superseded by D11.** Read to the bottom of this file
before treating any entry as current.

---

### D1 - Agent pages are dropped from this batch (2026-08-23)

This batch builds **integration landers + IT-partner sheets only**. No per-agent product pages.

Reason: the 4 old agent pages (CRM sync, Invoice processing, Lead enrichment, Report generator) were
deleted on **2026-08-11** as phantom products - they described things Mowi does not sell. Rebuilding
them under a new name would reintroduce exactly the claim problem that deletion solved. The real
product lineup lives on `/workflows` and that stays the single source of truth for it.

### D2 - Scope is the 11 LIVE integrations, and only those (2026-08-23)

From `koppelingen.html` `#live`: Exact Online, Pipedrive, WooCommerce, Shopify, Lightspeed eCom,
PrestaShop, Magento Open Source, HubSpot, Moneybird, Google Agenda, Calendly.

RUN 1 pilots = **Exact Online + Pipedrive**. RUN 2 = the remaining 9 plus the SEO cross-pass.

**Forbidden as capability claims:** Salesforce, SnelStart, SAP, Dynamics 365, Twinfield, Excel.
These were deliberately removed on **2026-08-21** because they are not in the dashboard's real
`config/shop_platforms.php` registry - they were leftovers from a superseded pre-rebrand plan that
still linger in the homepage marquee. Naming any of them as something Mowi koppelt re-creates a
claim Sal already decided to retract. Anything on the "Op de planning" list is equally out of scope:
planned is not live.

### D3 - Flat-root URLs: `koppeling-<slug>.html` (2026-08-23)

Landers live at repo root as `koppeling-<slug>.html`, served extensionless as
`https://mowi.agency/koppeling-<slug>` via the existing try_files fallback. Canonical tag uses the
extensionless form.

Why not `/koppelingen/<slug>`: a directory named `koppelingen/` sitting next to the existing root
`koppelingen.html` would shadow that page under the server's try_files resolution, and the exact
rewrite precedence on this host is **unverified**. The flat form needs no server change at all and
matches how every other page on the site already resolves. Not worth risking the live hub page for
a prettier path.

### D4 - One CTA, one destination (2026-08-23)

Canonical markup for this batch:

```html
<a href="https://my.mowi.agency/aanmelden" class="btn-primary page-cta" data-event="Signup Click">Start gratis</a>
```

Exactly **1** `btn-primary` inside `<main>`; **4** on the page in total (2 in the header chrome,
1 in main, 1 in the footer CTA) - measured against `koppelingen.html`, which is the rule. No colored
variant exists in the design system; page-scoped modifiers stack onto `btn-primary`.

### D5 - Loop mechanism: the `ralph-loop` plugin (2026-08-23) - SUPERSEDED BY D10

From the `claude-plugins-official` marketplace. It runs **in-session** via a Stop hook that blocks
exit and re-feeds the same prompt. Completion is signalled by emitting the promise wrapped in
`<promise>...</promise>`; only **one** promise string can be matched per run, which is why a stalled
run must also exit through that same promise (see the stall rule in `ralph/LOOP_PROMPT.md`).
Options in use: `--max-iterations N`, `--completion-promise "TEXT"`.
Plugin state file: `.claude/ralph-loop.local.md` - **must be gitignored**.

Fallback if the plugin misbehaves: a plain bash loop re-invoking `claude -p` with
`ralph/LOOP_PROMPT.md` as the prompt and a fixed iteration cap. Same files, same protocol, same
promise predicate - only the re-feeding mechanism changes, so nothing else in this repo depends on
which one is used.

### D6 - IT-partner sheets live in `downloads/` as HTML (2026-08-23)

`downloads/it-partner-<slug>.html`, `noindex`. The 4 existing PDFs in `downloads/` are orphaned
(afas, exact-online, pipedrive, snelstart - nothing links to them, and two of those vendors are on
the D2 forbidden list). The new sheets are HTML so they are cheap to fix, verifiable by
`verify.mjs`, and printable from the browser. `noindex` because they are a leave-behind for an IT
contact, not a search landing page - and because indexing them would put a second, thinner page in
competition with the lander for the same query.

### D7 - Landers get no mega-menu entry (2026-08-23)

The header nav is **duplicated verbatim into every page's header**, so adding one menu item means
editing every existing page - which is exactly what the guardrails forbid, and would put ~11 links
into a menu that is already at its comfortable limit. Discovery instead runs through the
`koppelingen.html` cards (wired in T99, supervised) and the sitemap. Landers therefore also carry
**no** `aria-current="page"` on any nav link: they are not in the nav.

### D8 - Title 45-70 chars, ending `" — Mowi"` (2026-08-23)

Supersedes the ungrounded "50-60" figure from the original spec, which is too tight for Dutch.

Grounded in the site's own SEO precedent: the blog posts are the only pages written for search, and
their titles measure **56, 67 and 78** characters, all ending in `" — Mowi"`. The existing product
pages (index 35, workflows 16, koppelingen 18, pricing 14, security 18, demo 29) are navigational,
not SEO targets, so they are not the precedent to copy. 45 is the floor because a shorter Dutch
title cannot carry both the integration name and the intent; 70 is the ceiling so the title is not
truncated in results, which is why we do not go as far as the 78-char outlier.

Meta description: **120-155** characters. Blog precedent measures 143, 149, 149.

### D9 - The em-dash ban is scoped to visible `<main>` prose (2026-08-23)

The no-em-dash rule (2026-08-19) applies to **new visible prose**, not to the file.

Grounded: the shared chrome alone contributes about **7** em dashes to every page, and every page
`<title>` on the site uses the `"X — Mowi"` separator. A file-wide check would fail every valid page
on the site, including `test.html`. The em dashes inside `<main>` on `koppelingen.html` and
`pricing.html` are all inside HTML comments (developer notes). Blog posts carry 10-25 in real prose
because they predate the rule.

So the check is: take the `<main>` slice, strip HTML comments and `<script>` blocks, then fail on a
literal U+2014 or `&mdash;` in what remains. Also check the meta description. The `<title>`'s
`" — Mowi"` separator is **exempt** - it is site convention and D8 requires it.

---

## New decisions (append below)

### D10 - Loop mechanism: a bash loop, not the `ralph-loop` plugin (2026-08-23)

**Supersedes D5.** `ralph/run.sh` is the runner. D5's "fallback" is now the primary, and the plugin is not
used at all.

Measured on this machine, and the reason for the switch: `bash` resolves to WSL2's `bash.exe`, which cannot
execute a script given a Windows path (exit 127), and the plugin registers its Stop hook as
`bash "${...}/stop-hook.sh"`. Forced through Git Bash, the hook then dies on `jq: command not found`, also
127. A failed Stop hook does **not** block exit, so the plugin would have run exactly one iteration and
looked like a clean finish, which is the worst possible failure mode for an unsupervised run.

What this changes for anything reading these files: each iteration is a **separate `claude -p` process with
no memory of any earlier one**. Not compacted memory, not summarised memory, none. `ralph/TASKS.md`, the
other `ralph/` files and `git` are the entire state. It also means the tool allowlist in `run.sh` is a brake
the harness enforces rather than one the prompt merely asks for.

Unchanged by this: the promise protocol. `run.sh` exact-matches one wrapped promise string per run, so a
stalled run still exits through that same promise plus a `## STALLED` banner.

### D11 - RUN 1 pilot order: Pipedrive first, Exact Online second (2026-08-23)

**Supersedes the order implied by D2** (the pilot set is unchanged: still Exact Online + Pipedrive).

RUN 1 exists to prove the pipeline, so it should run the best-grounded integration first. Pipedrive is
grounded end to end: `docs/koppeling-pipedrive.html` (237 lines) covers the hero, what the koppeling does
("alleen lezend: er wordt nooit iets in uw Pipedrive aangepast"), which agents use it, three real
"Problemen oplossen" questions for the FAQ, and a complete "Voor uw IT-partner" block that is essentially
the sheet already written; `shop_platforms.php` adds a 5-entry `instructions[]` and the `API-token` field
label.

Exact Online is the opposite and is deliberately second: no docs page, one sentence of card copy, and an
`oauth` entry with `fields => []` and Mowi-owned client credentials, which means the IT-partner sheet has
almost nothing legitimate to ask for. Four of its lander sections and most of its sheet fall back to
conservative copy plus `NEEDS_SAL.md` entries, which is *correct* behaviour under the Gap rule but a poor
first proof of the pipeline. Hitting it second, with the mechanics already proven, keeps the two failure
kinds separate: "the pipeline is broken" versus "this integration has no material".

### D12 - The branch was refreshed onto current origin/master before RUN 1 (2026-09-02)

This branch was cut 2026-08-23 and by 2026-09-02 sat **56 commits behind `origin/master`**. Measured
before merging: the `<head>` block, the `<header>` and the `<footer>` of `koppelingen.html` all differed
from origin's, and the sitewide cache-bust had moved `20260823-2` -> `20260829-5`.

That is not cosmetic. `LOOP_PROMPT.md` Step 3 copies the chrome **verbatim from `test.html`** and reads
the `?v=` strings **live from `index.html`**, so every one of the 11 landers would have shipped with
2026-08-23 chrome and a stale cache-bust: 11 files of rework, discovered only at Sal's review.

Done: `git merge-tree --write-tree` first (clean, no working tree touched), then a real merge
(commit `114f5b4`). Nothing pushed, nothing deployed - guardrail 3 is untouched by a local merge.
`verify.mjs` needed no change, because it reads both canons live rather than hardcoding them; re-smoke-
tested afterwards against `koppelingen.html`, where `chrome` and `cachebust` both PASS.

Carried along, and **not** on `origin/master`: commit `2f0991b` (2026-08-24, "Add accounting workflows
and 3 boekhouding integrations from autoboeker.nl"), which edits `index.html` and `koppelingen.html`.
It predates this session and is unrelated to the batch, but it rides along in any merge back to master.
See `S-005`.

### D13 - Sal's parked social-content files are sanctioned state, never cleaned (2026-09-02)

Six untracked paths sit in the working tree, last touched 2026-08-27/28: `gratis.html`,
`PUBLISHING-SOCIAL.md`, `build-carousels.js`, `content/social/`, `content/social-templates/`,
`.claude/skills/mowi-content/`. Checked against `origin/master` and every local branch: they exist in
**no commit anywhere**. The working tree is the only copy.

`LOOP_PROMPT.md` Step 0 previously told the loop to `git clean -f -- <path>` anything untracked outside
the active task's allowed paths. On iteration 1 that would have permanently destroyed all six. Step 0 now
names them as sanctioned pre-existing state, in the same breath as ` M .gitignore`, with an explicit
"a `git clean` on any of them destroys the only copy that exists".

`.gitignore` on this branch also re-adds `out/` and `content/social-templates/.render-tmp.html`, which
were in master's uncommitted `.gitignore` and are parked in `stash@{0}` (see `S-004`) - without them the
build output of that workstream shows up as dirt in the paths gate every single iteration.

### D14 - The dashboard now implements 14 platforms; the batch stays at the site's 11 (2026-09-02)

`config/shop_platforms.php` in the Mowi Dashboard repo now has `implemented => true` for **14**
platforms - three more than when D2 was written: **Shopware, bol.com, Guestplan**. All three are still
listed under **"Op de planning"** on the public `koppelingen.html`.

D2 stands unchanged: planned on the site is out of scope. A lander that says a platform is connectable
today, one click from a hub page that says it is not, is a contradiction Sal has not sanctioned - and the
hub page is a shared file this batch may not edit. The task list stays at 11. `S-003` records it; one
word from Sal moves those three in as T12-T14.
