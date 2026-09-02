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

### D15 - Landers carry one page-scoped `<style>` block (2026-09-02)

Sal asked for less space between sections. The shared `.section` is `padding: 5rem 0`, so two stacked
sections put 10rem between blocks. It is used by every page on the site, so changing it would move all
of them and, per CLAUDE.md's cache-busting rule, force a `?v=` bump across ~30 pages.

A page-scoped block is what `RALPH_SITE_BATCH.md` section 3.1 explicitly permits ("New pages get
page-scoped styles only"). This supersedes the earlier SPEC line banning `<style>` on a lander, which
was this project's own tightening, not the governing file's rule.

Two traps found while doing it, both now written into the SPEC block itself:
- The comment must not spell the stylesheet's filename. The `cachebust` check counts every occurrence
  of it in the file and requires each to carry the current `?v=`, so a prose mention fails the page.
- The comment must not contain the literal string `<main`. The `structure` check reads raw source and
  would count it as a second opening tag.

### D16 - The koppeling preview, and the three copy rules that came with it (2026-09-02)

Sal asked for "one image graph per page, like the dashboard start page images used for the widgets".
Those are not image files: they are the HTML/CSS mock in
`resources/views/components/discover-preview.blade.php` (`.discover-preview` / `.dp-*`). Ported to the
site's monochrome tokens inside the D15 block, which means **no new asset**, no binary in the repo, and
the site showing the same picture the product shows.

The component's own honesty rule is carried over verbatim and matters more than the styling: real
labels only where they carry meaning, masked values (`&bull;` runs) and grey bars everywhere else.
Its source comment says it plainly, and it applies exactly as much on a public lander: *"Inventing
plausible customer names, subject lines or shop names would put fake data on a page the client reads
before any of it is true."* The dashboard's green "success" chip becomes a black fill, because the
site's v2 design system is monochrome.

Three copy decisions landed in the same pass, all now SPEC rules:
1. **The platform logo appears once**, in the hero above the `<h1>`. The original plan said text pills
   only, no third-party logos. That was superseded in practice: `koppelingen.html` already ships all 29
   logo files live, so a lander using one adds no asset and no new trademark exposure.
2. **A step is an action the client performs.** An alternative route to the same screen, or a
   confirmation that it worked, folds into the step before it. Pipedrive went 5 to 4, Exact Online 3 to
   2. Sal: "make it look very easy and quick to do, which it is."
3. **Fewest words that still carry the meaning.** Cut openers and restatements; keep every qualifier
   that changes what is true (alleen lezend, the NL-only limit, who owns a token). Shorter, never vaguer.

### D17 - Full lander redesign: question-first, keyword-grounded, the new template (2026-09-02)

Sal, after seeing the D15/D16 pilot pages live: "redesign it completely, in terms of spacing,
responsiveness, image sizing and positioning... and then we use that as new template. just do it for
exact online then we can adjust the other landing pages using a cheaper model." Applied in full to
`koppeling-exact-online.html` (commit `5e3b2bc`); T01/T03/T04 still carry the D15/D16 shape and are
queued as retrofit tasks, T05-T11 build to this template directly. **This section supersedes SPEC.md
section 4 in full** - the old 7-section/label-heading spec is replaced below, not amended.

**Why the old shape was wrong, not just plain.** Section 4's original spec (built 2026-08-23, before
this redesign) produced pages structured as a specification document: a label per section
("Wat de koppeling doet", "Werkt met deze agents en workflows"), an `<h1>` that was a title
("Automatiseren in Exact Online.") rather than a question, no image anywhere, one CTA buried at the
bottom in its own section. It was internally consistent and passed every `verify.mjs` check, but it was
never built against what a person actually searches for - `RALPH_SITE_BATCH.md` never asked for that,
and neither did the original SPEC.md. Sal supplied three real Google Keyword Planner numbers mid-review
("exact online ai" 30/mo, "koppelingen exact online" 50/mo, "pipedrive exact online" 10/mo) that the
old page addressed nowhere. This is exactly the gap the vault's AI Search Blog Method note
(Website/Blog/Mowi - AI Search Blog Method.md) was written to close for blog posts; D17 is that method
applied to landers for the first time.

**The method, applied to a lander (not a blog post - adapted, see divergences below):**
1. `<h1>` is the question a person would say out loud, not a product label. Built from the seed keyword:
   `exact_online` -> "Wat kunt u met AI automatiseren in Exact Online?"
2. `<title>` carries the head terms Sal supplied, still 45-70 chars ending in the site's usual em-dash
   " Mowi" suffix: "Exact Online koppeling met AI: wat kunt u automatiseren? — Mowi" (63 chars).
3. Hero body is the **direct answer**, 50-70 words, every claim traceable to config/docs exactly as
   section 9's Gap rule already required - keyword-grounding changes phrasing, never truthfulness.
4. Every `<h2>` is a sub-question; the paragraph or line immediately under it answers it in the first
   sentence. Sub-questions come from: (a) what the platform's own config supports (grounded, as before),
   (b) an adjacent real search Sal supplies (e.g. "pipedrive exact online" -> a dedicated H2 answering it
   honestly - Mowi does not sync the two, both koppelingen are independently read-only). Never invent a
   sub-question with no keyword or grounding behind it just to hit a count.
5. **Divergence from the blog Method, deliberate:** no praktijkvoorbeeld/non-commodity-ingredient section
   (Method rule 4) - a lander is a product page, not an article, and inventing a scene or number here
   would violate the Gap rule harder than skipping the section does. No author box (Method rule 8) or
   Bronnen list (anatomy item 11) - not article conventions this page type carries. Table (anatomy item
   6) only where a real comparison exists to show (none does here, so it's absent, not stubbed).

**Layout: the site's own landing-page kit, not the blank `.section`/`.page-heading` skeleton.**
Section 1 (hero) is now `<section class="hero container lp-hero hero-tight-bottom" id="lander-hero">` -
the exact class set `e-mail-agent.html` and `call-agent.html` use - not `<section class="section">`.
This is what most of "spacing, responsiveness, image sizing" meant: the D15 page-scoped rhythm override
is gone, because the shared `.hero`/`.lp-hero`/`.lp-card-grid`/`.split`/`.lp-steps`/`.lp-trust-note`
classes already carry the right rhythm - fighting them with a parallel `.section` override was solving a
problem the site's own component kit already solves. The page-scoped `<style>` block that remains
(D15/D16's own rule still applies: one block, in `<head>`, comment must never spell the stylesheet
filename or contain the literal string `<main`) now holds only: the `.dp-*` preview markup (unchanged
from D16, still the honesty rule verbatim - masked values, grey bars, no invented names or amounts) and
one true gap-fill, a mobile `grid-template-columns: 1fr` fallback for `.split`, which the shared
stylesheet does not define at any breakpoint (checked: `css/style.css` has no `@media` rule for `.split`
at all - every existing page using `.split` happens to only need the desktop grid, this is the first
lander to hit that gap).

**The hero carries the page's one CTA. Section 8 (the standalone closing-CTA section) is deleted.**
The footer band that sits directly under `</main>` on every page (`.footer-cta`, "Vertel het en Mowi
regelt het" + its own "Start gratis") already **is** a closing CTA - the old spec's section 8 put a
second, near-identical one immediately above it, one scroll away. D4's CTA-count arithmetic changes
accordingly: **1** `btn-primary` in the hero (inside `<main>`, inside `.lp-cta-block` with the
`lp-cta-micro` "Geen betaalgegevens nodig." line beneath it, same markup `e-mail-agent.html` uses) + 2
in the header chrome (desktop/mobile) + 1 in the footer band = **4 total**, same total D4 always
required, redistributed. `verify.mjs`'s `cta` check already asserts "1 in main, N total (chrome-counted
live from test.html) + 1" - unchanged mechanically, this just moves where in `<main>` that 1 sits.

**Previews: three per page, not one, each the `.dp-card` mock from D16 in a different frame.** Sal's
ask ("a few more images like these 1 or if its even relevant") is answered per-page by what the
platform's config genuinely supports showing, not a fixed count:
- **Hero preview** (`.dp-window-hero`, full container width): the single clearest thing the koppeling
  produces. Exact Online -> open invoices; a CRM platform -> a recognised inbound contact.
- **Side preview** (`.dp-window-side`, beside the "Werkt met deze agents" link stack in a `.split`): a
  second, different product moment, shown only where the platform genuinely supports two distinct
  moments (Exact Online: invoices in the hero, a recognised call here). Skip it, don't force a second
  window, on a platform where there is only one real thing to show.
- **Tile preview** (`.dp-window-tile`, under the connect steps): the koppeling's own tile as it will
  appear on the client's Koppelingen screen post-connect - platform logo, name, "Verbonden" chip, one
  line of what it can see. Every platform can show this one; build it every time.
Never fabricate a fourth kind of preview to hit a round number. Three is what this page happened to
support: hero + side + tile is the ceiling, not a quota.

**Logo colour:** the Exact Online mark renders in its brand red in the hero on this page (same as it
already does, uncontested, on the live `koppelingen.html` hub page - not a new exception). The site's
v2 monochrome rule (CLAUDE.md) governs Mowi's own UI chrome; a third-party trademark mark showing its
own brand color is a different thing and was never in scope of that rule. Flagged to Sal for an explicit
call rather than assumed either way - S-009 in NEEDS_SAL.md.

**Retrofit vs. fresh build.** T01 (pipedrive), T03 (woocommerce), T04 (shopify) already shipped under
the D15/D16 shape and are re-opened as `T01R`/`T03R`/`T04R` retrofit tasks - same content grounding,
same FAQ facts, restructured into this template. T05-T11 have not been built yet and go straight to
this template with no separate retrofit step. T20 (SEO cross-pass) and T99 (supervised wiring) are
unchanged in nature.

**Model note.** From this point the loop runs on Sonnet, not Opus (Sal, 2026-09-02: "adjust the other
landing pages using a cheaper model"). `run.sh` now pins `--model sonnet` explicitly rather than
inheriting whatever this interactive session's `/model` happens to be set to at invocation time - three
different models were the session default at three different points while this branch was being worked
(Opus, Fable, Sonnet), and a loop that silently inherits ambient state instead of pinning it explicitly
is exactly the class of bug D10 already found once (the plugin's hook silently assumed `bash` meant Git
Bash). Override with `MODEL=opus bash ralph/run.sh 2` if a task needs it. Nothing about this task is
judgment-heavy: the template, the grounding rules, and the verify gate are now explicit enough that
following them precisely - which is what remains - does not need Opus-level reasoning. Rebuilding the
template itself, or any future task that requires resolving an ambiguity the spec does not already
answer, still should not run on Sonnet unattended.

### D18 - A bare "no" is not content, even with real search volume behind it (2026-09-02)

D17's Exact Online template included a sixth section answering "pipedrive exact online" (10/mo) with
"Nee, Mowi zet niets over tussen Pipedrive en Exact Online." Sal, on review: not relevant enough to keep
as-is, and pointed at the real fix — build the sync as an actual workflow later, so the honest answer
becomes yes and the search volume is worth capturing for real. Cut from the live page immediately (the
whole `<section>`, not softened).

Generalised into SPEC.md section 4, item 6: a cross-platform sub-question only earns a place on the page
when the true answer gives the reader something — a capability, a distinction, a next step. A section
whose entire content is "no, Mowi doesn't do that" fails Rule 6 of the AI Search Blog Method in spirit
(answer the questions competitors dodge) while technically satisfying its letter (an honest answer to a
real keyword) — the method assumes an honest "no" still teaches something; this one didn't, it was pure
negative space. The keyword and the gap go to `NEEDS_SAL.md` as `wanted-but-out-of-scope` (S-010) instead
of onto the page — a missing feature is Sal's call to build, not the loop's to write copy around.

The actual feature idea (a Pipedrive <-> Exact Online sync workflow, distinct from the existing
CRM-synchronisatie workflow which only recognizes customers) is a product decision, not a site-batch
task, and is logged in the vault (`Ideas for agents.md`) rather than only here — this branch's files stop
existing the moment it merges or gets abandoned, and a real product idea backed by real keyword data
should survive that.
