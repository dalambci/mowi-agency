# Project rules (permanent — apply in every session)

This is a marketing website for an AI automation business. These rules are durable and
apply to all future work in this repo, not just the current task.

## Total rebuild v2 — 2026-08-18 (branch `rebuild-v2`, built but NOT merged/deployed)
A full 10-stage rebuild was executed on branch `rebuild-v2` off `master`, at the founder's
explicit request to throw away the entire prior implementation ("don't keep anything we
already have") and rebuild it from scratch, using **elevenlabs.io** and **shapes.co** as
explicit visual/structural references. This is a second, deeper pass on top of the
"Total rebrand" described further below — that rebrand had already pivoted the site's
*positioning* to demo-gated/conversational-workflow-automation and had already cited
shapes.co as visual inspiration in its own CSS header comment, but its own token layer
admitted it was an unfinished mid-migration patch job (a back-compat alias block explicitly
marked "DELETE once every page has been migrated" — that migration was never finished). v2
redid the same direction properly, once, in full, with three hard constraints the founder
added mid-build that override anything below describing the pre-v2 (orange-accent) system:

1. **Monochrome only — no color anywhere.** No accent hue, no color-coded tags. Black ink
   on warm-bone background (`--bg:#faf6ef`, unchanged from before — a warmth/paper quality,
   not a hue), or bone-on-black in inverted sections. Emphasis is carried by weight, size,
   the serif-italic word, and black fills — never by color.
2. **The orb motif is a pixelated/halftone sphere**, built the same way `mowi-icon.png`'s
   own texture already works (see Branding below): a luminance-to-alpha dot/grain ramp, not
   a flat silhouette and not a color gradient. Pure CSS (layered `radial-gradient`/masking),
   monochrome.
3. **No invented motion.** Only animation actually observed live on the two reference sites
   is in scope — concretely, shapes.co's own hero chat-input auto-playing an example
   question into a "Thinking…" state with no click involved. That one pattern survives as
   the `.chat-input` component's auto-play mode. Everything else the v1 rebrand had
   (scroll-reveal-on-intersection fades, magnetic-hover button pointer-tracking, an orb
   pulse/rotate idle animation) was cut — content just sits in normal document flow, hover
   states change color/border only, tab/accordion/dropdown switches are instant or a simple
   opacity cross-fade.

**What "don't keep anything" turned out to mean in practice:** positioning, copy, page
structure, and the entire design system were rebuilt from zero. Four things were carried
over with content untouched (only their outer shell/CSS integration rebuilt), per the
founder's explicit scope: the Mowi logo/favicon assets, the docs section's articles, the
blog generator + its posts, and the 6 legal pages' legal text. See "Design system",
"Navigation", "Content & positioning", and "Folder structure" below for the current reality
— every section has been rewritten in place to describe v2, with the pre-v2 wording kept
underneath and marked superseded per this file's own "never delete history" rule.

**Stage-by-stage summary** (10 stages, one commit each on `rebuild-v2`, screenshot-QA'd at
1440px/390px before each commit): S0 foundation (tokens/primitives/components in
`css/style.css`+`js/main.js`, `test.html` rebuilt as the v2 styleguide) → S1 homepage → S2
`workflows.html` (absorbs the retired Receptenboek, see "Content & positioning") +
`koppelingen.html` → S3 `zo-werkt-het.html`+`vertrouwen.html`+`ai-transparantie.html` → S4
`over.html`+`demo.html` → S5 legal/business-info shells (text verbatim, chrome only) → S6
docs shell token harmonization (content untouched) → S7 blog chrome regenerated via
`build-blog.js` (post prose untouched) → S8 redirect stubs + cleanup (Receptenboek retired
as stubs, `blog-preview/` and the orphaned `hero-anim-trainingen.*` files deleted) → S9
sitewide consistency sweep + this file's rewrite.

**Merged to `master` and deployed to production 2026-08-18** (fast-forward merge, no conflicts;
pushed to GitHub; pulled live on `ktzphwhvnh`/`134.209.193.67` — confirmed via
`git log --oneline -1` on the server matching this repo's `master` tip). Deployed **with the
`[FULL_NAME]`/`[CALENDLY_URL]` placeholders still literal** — a deliberate founder call, not an
oversight; both need real values supplied and swapped in as a fast-follow. **Varnish was NOT
purged as part of this deploy** (no SSH-level purge access, dashboard-only per "Deploying to
production" below) — `/` (and possibly other directory-index paths) will keep serving the
pre-deploy page to real visitors until someone purges it in the Cloudways dashboard
(`ktzphwhvnh` → Application Management → Varnish → Purge). Explicit-slug pages
(`/workflows`, `/vertrouwen`, etc.) already serve the new build immediately, confirmed live via
`curl -sI`, matching this file's own documented staleness pattern.

## Total rebrand — 2026-08-17 (superseded by v2 above — kept for history, do not follow for design/nav/positioning specifics; git-reconciliation and deploy-mechanics facts below are still real history)
A full 8-stage rebrand was executed on branch `rebrand` (commits `f85f6c3`..`591f862` plus a
final Stage 8 cache-bust/blog-rebuild/QA/docs pass), moving the site from a self-serve
pricing/signup model to a **demo-gated, conversational workflow-automation platform**
positioning — that positioning itself is still current (v2 didn't change *what Mowi sells*,
only how the site expresses it; see "Content & positioning" below). Anywhere below this
section describes visual design, navigation labels, or the Receptenboek-as-pages structure,
treat it as pre-v2 and prefer the sections above/marked-current instead.

**Git reconciliation (2026-08-17, same day):** a second machine had independently pushed 31
commits to `origin/master` continuing the *old* self-serve direction (new self-serve blog
posts, a broader "every possible platform" logo set, self-serve CTAs) — done before that
machine knew about that day's masterplan pivot. Since the pivot supersedes that direction,
`master` was reset to `rebrand`'s tip and force-pushed: `origin/master` became `rebrand`'s
8-stage history (tip `40119b9`). Checked first whether anything from those 31 commits was
worth pulling forward — it wasn't: `rebrand`'s own `koppelingen.html` referenced only its own
12 deliberately-curated logos (none of the 31 commits' ~23 extra ones), and the 3 new blog
posts from those commits contained self-serve CTAs/pricing ("Start gratis — 14 dagen",
`my.mowi.agency/aanmelden` signup, per-agent self-serve pricing tables) that directly
contradicted the demo-gated pivot. Nothing was lost though — the pre-reconciliation `master`
is preserved in full at branch/tag `archive/self-serve-rewrite-20260817` (pushed to GitHub)
if any of it is ever wanted for reference.

**Superseded 2026-08-18: `master` now equals the v2 rebuild (tip `9202974`), merged and
deployed — see the "Total rebuild v2" section at the top of this file for the current state
(including the still-pending Varnish purge).** This v1 rebrand's own content/design/nav
specifics remain superseded by v2 as already noted; only this paragraph's git-mechanics
history stays accurate as a record of what happened on 2026-08-17.

## Project memory (Obsidian)
Long-term project knowledge lives in `c:\Users\SalP1\Desktop\Mowi brain\`.
At the start of every session: read "Mowi - Home.md" plus the notes relevant to today's task.
When we decide or change something important: update the relevant note AND add a dated line
to "Mowi - Decisions log.md" before the session ends. Never delete history — mark superseded
decisions as superseded. The full procedure is packaged as the `mowi-second-brain` skill
(`.claude/skills/mowi-second-brain/SKILL.md`) — invoke it rather than relying on this summary
alone. A `Stop` hook in `.claude/settings.json` prints a reminder after every response as a
backstop in case something important didn't get written down.

## Tech stack
- **Static site only:** plain HTML, CSS and vanilla JavaScript.
- No frameworks (no React/Vue/etc.), no build step, no bundler, no database, no PHP/backend
  required. Pages must open directly as files or be served by any plain static host.
- `package.json` / `node_modules` / `playwright` **do not** contradict the rule above — they
  exist purely for local dev tooling (the screenshot/QA script below), not for building or
  running the site itself. Nothing in the shipped site depends on npm or Node.

## Dev tooling (not part of the shipped site)
- `serve.js` / `start-local-server.bat` — local static server for manual testing at
  `http://localhost:8765`.
- `screenshot.js` — Playwright script that takes full-page screenshots of a page at 1440px
  and 390px (`node screenshot.js [outputDir] [url]`). Requires the local server running
  first. Scrolls through the page in steps before capturing. **Note (v2):** this scrolling
  behavior was originally load-bearing because v1's design had `IntersectionObserver`-driven
  scroll-reveal animations that wouldn't fire without a real viewport scroll. v2 deliberately
  has no scroll-reveal at all (see "Design system" — motion is limited to what's actually
  observed on the reference sites), so a plain `fullPage` screenshot would technically
  suffice now — the step-scrolling was left in place anyway since it's harmless and costs
  little, not because it's still required.
  Output goes to `screenshots/` by default (gitignore-worthy, not a deliverable).
- Playwright is also useful for genuine mobile-width testing — browser-extension-based
  automation in this environment could not reliably resize its own viewport, so Playwright is
  the only way found so far to actually verify layout at e.g. 390px rather than guess from
  full-desktop screenshots.

## Templates marketplace (`/templates`, generated — 2026-09-05, round 2 on 2026-09-06)
- `templates.html` and every `templates/<slug>.html` are **generated by `build-templates.js`**
  from `content/templates/templates.json`, the Mowi Dashboard's export (`php artisan
  mowi:export-templates <path>` in that repo). Never hand-edit the output; change the generator or
  re-export, run `node build-templates.js`, and commit the regenerated files with it. A second run
  is byte-identical (checked). The page's own assets are `css/templates.css` + `js/templates.js`,
  versioned together by `TPL_ASSET_VERSION` in the generator (**`20260906-2`**); `style.css`/
  `main.js`/`workflow-canvas.*` are untouched by this page, so a templates change never needs the
  sitewide bump. The vault note `Dashboard/templates-marketplace-plan.md` is the build record.
- **The filters were silently broken for a day (2026-09-05→06), and the lesson is a rule:** the
  JS set the `hidden` attribute on exactly the right cards, but `.tpl-card{display:flex}` beat the
  browser's own `[hidden]{display:none}`, so nothing moved on screen. Any element a script hides
  with `el.hidden = …` needs an explicit `[hidden]{display:none}` rule next to its display rule
  (`templates.css` has one for every toggled element), and **filtering is verified on rendered
  visibility (`offsetParent !== null`, Playwright `toBeVisible()`), never on the attribute** — the
  round-1 check read the attribute and passed. `qa-templates.js` (dev tooling, next to
  `screenshot.js`; `node qa-templates.js [baseUrl]`, needs `node serve.js` for the default
  localhost URL) runs that battery in Chromium 1440/390 and WebKit iPhone 13 and exits 1 on any
  miss; run it locally before committing and against `https://mowi.agency` after a deploy.
- Round 2 shape (mirrors the dashboard's Blade hook for hook, so both pages filter identically):
  compact left header (`.tpl-head`: `.page-hero-heading` + one line, search on the right), one
  toolbar (`.tpl-seg` segmented type control + `.tpl-dd` dropdowns Branche / Koppeling-with-logos /
  Trigger with faceted counts, zero-result options `aria-disabled`), removable `.tpl-pill`s +
  "Wis filters", three `.tpl-section`s per kind with counts, and a card picture of integration
  logo tiles + ONE glyph (`.tpl-picture`; agents show the ghost mascot). Glyph fragments and the
  mascot come from the export's top-level `glyphs`/`mascots` — the generator keeps no art of its
  own and throws on a missing glyph or logo file. Logos: `assets/logos/integrations/<key>.svg`
  (the 14 implemented platforms under their dashboard registry key, copied from the dashboard's
  `public/images/integrations/`; `<img>` only, six carry internal ids). The older `assets/logos/*`
  files (marquee, koppelingen.html) are a separate set and stay as they are.
- Never write a star-slash sequence inside a CSS comment (e.g. a class glob like `.tpl-x-*/`): it
  closes the comment early and the parser eats the next rule — that is how `.tpl-head` vanished
  during round 2 and the header rendered as a plain block until measured in the browser.
- Detail pages load `js/workflow-canvas.js`, whose canvas always opens at 1:1 centred (`center()`
  in that file); the `data-wf-fit` attribute the generator writes is ignored by it.
- **Agent detail pages are landing pages, generated by `renderAgentDetailPage()` (2026-09-06,
  Sal: "completely re-do the design of the on-agent-template page").** Every `templates/voice-
  agent-*.html` / `inbox-agent-*.html` gets the agent landing pages' idiom (`.split` hero with the
  tagline as H1, `.lp-card` grid of the flow's own nodes, `.lp-steps`, an "Ook interessant" row);
  workflow and dashboard slugs still use `renderDetailPage()`. **The three onboarding steps and
  the trust note are read out of `call-agent.html` / `e-mail-agent.html` at build time**
  (`readAgentSteps()` slices the `.lp-steps` block that follows the last `.lp-section-heading`
  before it and expects exactly three `<h3>`/`<p>` pairs), so that copy has one source — the
  trade is that restructuring that section on a landing page makes `node build-templates.js`
  throw until the reader is updated. `qa-templates.js` section 10 pins the kapper page.

## HTTPS enforcement lives in Cloudways, not this repo
- The production host was serving plain `http://mowi.agency` with a 200 OK instead of
  redirecting to HTTPS. Fixed via Cloudways' own dashboard toggle: app **mowi.agency**
  (Cloudways app ID 6590002, folder `ktzphwhvnh` — this Cloudways account hosts several
  unrelated client sites, so double-check the app ID/domain before touching anything there) →
  **Application Settings → HTTPS Redirection**. That's the correct fix — nginx serves this
  site's static files directly (confirmed via the `Server: nginx` response header) without
  ever handing off to Apache, so an `.htaccess` file (tried first) is silently never consulted
  and does nothing; don't reach for one again for this.

## Deploying to production
- **As of 2026-08-18, `master`/`origin/master` and production are both on the v2 rebuild**
  (tip `9202974`) — merged, pushed, and pulled live on the server, confirmed via `git log` on
  both ends. **Varnish has not been purged** — see the "Total rebuild v2" section at the top of
  this file. Don't assume a *future* change is visible to real visitors just because it's on
  `master` — always re-verify with the checks below (a `git pull` alone was never sufficient
  even before this).
- Production (`mowi.agency`, Cloudways app `ktzphwhvnh` on server `134.209.193.67`) has its own
  git checkout at `~/applications/ktzphwhvnh/public_html`, with `origin` pointed at this same
  GitHub repo (`https://github.com/dalambci/mowi-agency.git`). Deploying is: merge the branch
  to `master`, push to GitHub, then SSH in and `git pull origin master` in that directory
  (plain fast-forward — the server checkout should never have local commits of its own).
- SSH access uses a dedicated key at `~/.ssh/mowi_cloudways` (already present in this dev
  environment, not passphrase-protected) — connect with
  `ssh -i ~/.ssh/mowi_cloudways master_jhjtpcszem@134.209.193.67`, no password needed.
  **The `-i` is not optional without config** (diagnosed 2026-08-15 from a "SSH keeps rejecting
  me" report): plain `ssh master_jhjtpcszem@134.209.193.67` offers only the default
  `~/.ssh/id_ed25519` (the GitHub key) and dies with `Permission denied (publickey,password)` —
  the server is fine, the right key is simply never tried, because ssh only auto-offers
  default-named keys. `~/.ssh/config` now carries a `Host mowi` block (plus one matching the raw
  IP) pinning this key with `IdentitiesOnly yes`, so bare `ssh mowi` works in both Git Bash and
  Windows OpenSSH. That file is outside this repo — if it's ever lost, re-add it or go back to
  passing `-i` explicitly. Never
  authenticate with a password here even if one is offered/pasted in chat — entering a password
  into an auth prompt on the user's behalf is a hard no regardless of the source; use the key.
- `git push origin master` from this repo may be blocked by Claude Code's own permission
  classifier (separate from any GitHub-side issue) — if so, ask the user to approve it or run it
  themselves; retrying after approval works fine.
- Multi-tenant reminder (same as above): that server has a dozen+ other app folders. Only ever
  touch `ktzphwhvnh` — confirm `ls ~/applications/ktzphwhvnh/public_html` looks like this repo
  (index.html, CLAUDE.md, css/, js/, reference/) before pulling if there's ever any doubt.
- **Which pages actually go stale (observed across three deploys on 2026-08-11):** it is the
  **directory-index paths**, and **`/` every single time** — `/blog/` was stale on one deploy and
  current on the next, so treat it as "sometimes" and `/` as "always". Every explicit-slug page
  (`/pricing`, `/cases`, `/agents/email-triage`, …) picked up the new build immediately on all
  three. So a spot-check of one inner page will happily show a deploy as "landed" while the
  homepage is still serving the old one; **always verify `/` specifically.** Fast check:
  `curl -sI https://mowi.agency/` and compare `Last-Modified` against the deploy time — `X-Cache:
  HIT` with an `Age` in the hundreds/thousands and a stale `Last-Modified` is the tell. Comparing
  `Content-Length` against the new file's real size catches it too. A `?nocache=$(date +%s)` fetch
  of the same URL returning the NEW content proves it's the cache and not a failed deploy.
- **Every deploy's last step is purging Varnish, not just `git pull`.** Confirmed 2026-08-11: this
  app sits behind Cloudways' Varnish full-page cache (response headers show `X-Cache: HIT` /
  `Age: <seconds since cached>` on a plain `curl -sI https://mowi.agency/`), and a `git pull` does
  **not** invalidate it — real visitors kept getting served pre-deploy pages for up to ~an hour
  after a push looked complete. There is no SSH-level purge access (`varnishadm` needs a sudo
  password that isn't available here); it must be done in the Cloudways dashboard: open the
  `ktzphwhvnh` application → **Application Management → Varnish** → **Purge**. Verify it worked
  with the same `curl -sI` check — `Age` should reset to a small number (or the header disappear
  entirely on the very next request).

### If this section is ever missing or wrong
This was reconstructed once already (2026-08-03) after the details above weren't written down
anywhere and had to be rediscovered mid-session. If that happens again — key rotated, IP
changed, this file not read, whatever — redo it the same way rather than asking the user to
retype credentials from scratch or falling back to a password:
1. `ls ~/.ssh/` for a key named after this project (convention seen here: `mowi_cloudways`,
   i.e. `<project>_cloudways`) — try it with `-o BatchMode=yes` before assuming it doesn't work.
2. `awk '{print $1}' ~/.ssh/known_hosts` for IPs this machine already trusts — a candidate host,
   not proof by itself (this account's other client keys/IPs live in the same files).
3. Once connected, `ls ~/applications/` and match the folder name against the app ID already in
   this file (`ktzphwhvnh`), then confirm with the file-listing check above.
4. Check whether that app folder has its own `.git` (`cd` into it, `git remote -v`) before
   assuming rsync/scp — if it does, it's the same pull-based flow described above, not a raw
   file copy.
- If a password gets offered anywhere in this process (chat, a notes file, anything), still
  don't use it — keep looking for the key. Only ask the user to enter it themselves if a key
  genuinely doesn't exist and can't be added.

## Cache-busting — bump this on every CSS/JS change
- `css/style.css` and `js/main.js` are referenced from every page with a `?v=YYYYMMDD` query
  string (e.g. `css/style.css?v=20260818`), matching a `Cache-Control: public, max-age=2592000`
  (30-day) header set at the server. Without the version string, a browser that already cached
  the file simply keeps serving that stale copy for up to 30 days after a deploy — it doesn't
  even revalidate with the server, so redeploying alone does not fix it for a visitor who's
  already cached the old one.
- Root-caused from a real incident: the site looked completely broken in a browser that had
  visited before the Products mega-menu shipped, because it was silently serving pre-mega-menu
  CSS/JS. **Every session that edits `css/style.css` or `js/main.js` must bump the `?v=`
  value on all `<link>`/`<script>` tags referencing them, across every HTML page**, so browsers
  are forced to fetch the new file immediately rather than waiting out the cache. Use the
  current date (`YYYYMMDD`); if multiple deploys land same-day, append `-2`, `-3`, etc.
  **Latest coordinated bump: `20260829-2`** (2026-08-29, the WebKit card-strip fix below;
  `-1` earlier the same day was the homepage icons, `20260828-12` the homepage imagery the day
  before). Before that sweep, `pricing.html` had drifted to `-11` while
  the other 21 pages sat on `-10` — a page-local bump from an earlier session. When bumping,
  `grep -ho 'style.css?v=[0-9-]*' *.html blog/*.html | sort | uniq -c` should show exactly
  one distinct value; if it shows two, take the higher one +1 so nothing goes backwards.
  (Older record: `20260818`, v2 rebuild Stage 9 — every real page loading either
  file was swept and verified on this exact string, including `test.html` which had drifted one
  version behind after Stage 0.) Applies to every root marketing page, the 6 legal pages,
  `test.html`, and `blog/*` (whose version is auto-derived by `build-blog.js` from
  `index.html`'s own `?v=` — see its `CSS_VERSION` regex — don't hardcode it separately there).
  Does **not** apply to the 15 redirect stubs (root stubs, `agents/*`, and — new in v2 —
  `receptenboek.html` + `receptenboek/*`, none of which load either file) or to `docs/*` (own
  separate `docs.css`/`docs.js` versioning, untouched by this rule — currently `docs.css?v=20260817`).
- **Separate from the above:** production also has a page-level HTTP cache in front of nginx
  (confirmed 2026-08-03 — `curl -sI https://mowi.agency/` showed `X-Cache: HIT` and `Age: 252`;
  likely Varnish, which Cloudways commonly bundles). This caches whole HTML responses, not just
  the static CSS/JS the `?v=` trick covers, so a page can keep serving pre-deploy HTML for a
  while even though the file on disk (and `git log` on the server) is already correct. If a
  deploy doesn't seem to have landed, verify the actual file first (`ssh` in and read/grep it,
  or `curl` with a cache-busting query string like `?nocache=$(date +%s)`) before assuming
  something went wrong — it's very likely just this cache, not a failed deploy. No known way to
  force-purge it from this repo/session; ask the user to clear it via the Cloudways dashboard if
  an instant update is actually needed.

## Language & tone
- All visible site text is in **Dutch**, formal **"u"** form (never "je/jij").
- **Superseded 2026-08-19 — the header-nav-stays-English exception below no longer applies.**
  During the shapes-skeleton rebuild the founder asked for the whole chrome (header + footer,
  including the Product dropdown) remapped to Dutch — done, live, and confirmed working. Don't
  translate the nav back to English on the strength of the paragraph below; it's kept only as a
  record of the old v1/v2-era rule.
- ~~**Exception — the whole header nav, not just the dropdown.** The header nav has always used
  English labels deliberately (unchanged through both rebrands). Keep these in English; don't
  translate them to Dutch. Everything else on the site stays Dutch per the rule above.~~

### Copywriting voice (2026-08-19)
Applies to all body copy the founder writes or asks for going forward (not just this page) —
headings, sublines, quotes, FAQ answers, anything a visitor reads as prose. Five rules:
1. **No em dashes.** Split into two sentences instead, or use a comma if a short connective
   genuinely fits.
2. **Short sentences.** One idea per sentence; if a sentence has more than one comma-joined
   clause, it's usually two sentences.
3. **Don't overuse punctuation.** No comma chains, no stacked qualifiers, no semicolons where
   a period works.
4. **Conversational, plain language** — not stiff or corporate, still formal **u**-form per the
   rule above. Read it out loud; if it sounds like a brochure, rewrite it.
5. **Headings are punchlines, not sentences.** Cut filler words (articles, "die"/"dat" relative
   clauses) until only the essential words remain, and drop internal punctuation (commas,
   trailing periods included) unless it's a deliberate two-beat line like the hero's. Both live
   on the homepage: "Elke workflow, in minuten opgezet." → "Workflows in minuten". "Werkt met de
   systemen die u al gebruikt" → "Werkt met wat u al gebruikt".

Before/after, from the homepage build:
- Before: "Beschrijf in gewone taal wat u geregeld wilt hebben — Mowi configureert het uit
  geteste bouwstenen, nooit uit losse code."
  After: "Vertel in gewone taal wat u geregeld wilt hebben. Mowi bouwt het uit geteste
  bouwstenen, nooit uit losse code."
- Before: "Pas na uw bevestiging gaat de workflow echt live — u bepaalt het moment."
  After: "Pas na uw akkoord gaat de workflow live. U bepaalt het moment."
- Before: "Dat is niet voorzichtigheid — dat is hoe automatisering hoort te gaan, en het is
  waarom ik zelf aanspreekbaar blijf..."
  After: "Dat is geen voorzichtigheid. Zo hoort automatisering te gaan. Daarom blijf ik zelf
  aanspreekbaar..."

Also per the founder's explicit call, 2026-08-19: no small-caps "kicker" eyebrow labels above
headings (e.g. a standalone "Vertrouwen" sitting above "Automatisering die u durft aan te
zetten.") — they read as generic AI-generated-template filler. Let headings and body copy carry
the section's meaning on their own instead. Same reasoning killed the hero's plain "Bekijk hoe
het werkt →" secondary link — one clear CTA beats a hedged pair.

### Navigation — current, v2 (2026-08-18)
The header is now **logo-left / nav-center / actions-right** (a deliberate structural change
from v1's CTA-left/logo-right layout — neither reference site used that inversion, and the
full teardown was the moment to fix it): Mowi wordmark → centered `<nav>` with **"Product"**
dropdown (single column: **Workflows** / **Koppelingen** / **Vertrouwen**, each with a
one-line Dutch descriptor) → **"How it works"** (`/zo-werkt-het`) → **"Docs"** (promoted out
of the old "Resources" dropdown to a flat top-level link — both reference sites treat docs as
first-class nav, not buried; `/docs/`) → **"About"** (`/over`) → **"Blog"** (flat link,
`/blog/` — with Docs promoted out, a one-item "Resources" dropdown was pointless, so it was
removed entirely) → right-aligned `.header-actions`: **"Login"** (external,
`https://my.mowi.agency/login`, `target="_blank"`) + **"Start gratis"** pill CTA (superseded
2026-08-22, later same day — was ~~"Plan een demo"~~; see the pricing bullet below for the
sitewide CTA flip and why). There is no
separate dashboard-login icon button (folded into "Login"). **"Receptenboek" is gone from the
nav entirely** — see "Content & positioning" below for where that content went. The footer
still uses Dutch labels, 4 columns (brand / Platform / Bronnen / Bedrijf & Contact) — header
and footer are deliberately allowed to differ on language per the exception above.

**Superseded 2026-08-17→18 — kept for history, do not follow:** v1's nav was CTA-left/
logo-right, with a flat "Receptenboek" link and a "Resources" dropdown (Documentation + Blog)
between "About" and "Login". Before that, the pre-rebrand nav had a "Products" mega-menu with
two columns ("Platform": Agentic AI / Power BI / Trainingen, and "Agents": Email agent / Call
agent), a top-level "Pricing" link, and a "Contact sales" / "Demo" CTA pointing at `/contact`
or `/tarieven`/`/pricing`. All of those pages (`agentic-ai.html`, `power-bi-dashboards.html`,
`trainingen.html`, `pricing.html`, `tarieven.html`, `cases.html`, `agents/email-triage.html`,
`agents/phone-agent.html`, `contact.html`) are, and remain, **client-side redirect stubs**
(see Folder structure below), not real content — don't add new links to them, and don't
resurrect any of the old label names above for the current nav.

### iPad Pro / 1023–1280px: the closed Product menu was the page's horizontal overflow (2026-09-05)
Sal: the header looked "too wide" on an iPad Pro, "that particular device alone". Root cause,
measured with Playwright (Chromium 1024/1194/1280, WebKit iPad Pro 11 landscape): `.nav-menu` was
`min-width: 76rem` (1216px), centred under `.site-header` and hidden with `visibility:hidden` +
`opacity:0`, which still takes layout space. Below ~1280px it stuck out past the header (96px past
the right edge at 1024, 11px at 1194) and gave `document.scrollWidth` that much overflow, so the
page could be panned sideways on exactly the iPad Pro viewports (12.9" portrait = 1024, 11"
landscape = 1194); phones were fine because the ≤63.9rem mobile header replaces the menu, and
laptops ≥1280 were fine because the menu fit. With the menu `display:none` the overflow measured
0, which pinned it. Fix in `css/style.css`: `.nav-menu { width: min(76rem, 100%); min-width: 0 }`
(100% = the header's width, its containing block), so the closed panel can never exceed the
header and the open panel between 1023 and 1280px is as wide as the header bar. Don't put an
`overflow: clip` on `.site-header` instead: the open panel hangs below the header and would be
cut. Lesson for the file's checklist: **a hidden-with-visibility absolutely positioned panel
still counts toward page overflow; when the page scrolls sideways on one device size, hide
candidates with `display:none` in DevTools and re-measure `scrollWidth`.**

**Second finding the same evening, iPad Air (820×1180, i.e. the hamburger sheet):** Sal, "it's
iphone width for menu items at ipad display". The sheet's `.nav-menu` is a column-direction
flex that inherited the desktop rule's `align-items:flex-start`, so each Product category
shrank to its own content width (~300px) and the right half of the 796px sheet stayed empty.
Two rules in `css/style.css`: (1) inside the ≤63.9rem block, `.nav-menu{align-items:stretch}`
+ `.nav-menu-col{width:100%}`, so on any phone or tablet the items span the sheet like the
top-level links; (2) a **tablet band `(min-width:48rem) and (max-width:63.9rem)`** (iPad Air
820, iPad Pro 11 834, iPad 810 in portrait) lays the three categories side by side with the
vertical divider back, one item per row per ~240px column — the sheet keeps the hamburger, the
Product list just stops being one 1000px-tall column. Below 48rem (iPad Mini 744, phones) the
stacked single list stays, now full width. Between 64rem and 79.9rem the DESKTOP mega-menu
stacks its items one per row instead (`.nav-menu-item-grid{grid-template-columns:minmax(0,1fr)}`),
because the panel there is only as wide as the header bar (964px at 1024) and two per row
wrapped six titles. Measured on all of these with Playwright WebKit; `style.css`/`main.js`
at `?v=20260905-2`.

### Navigation — current, re-verified 2026-08-26 (the section above predates several rounds
### of nav changes this doc never caught up on — this replaces it; do not follow the 2026-08-18
- **Header "Inloggen" link opens in the SAME tab (2026-08-28) — never `target="_blank"`.** It was the only link on the site opening a new tab, and on an iPhone in Chrome a new tab animates in while the page is already painting, so the dashboard login page visibly "jumped" every time it was opened from the site — and never any other way. Two days were spent looking for that inside the dashboard. Same-tab like the "Start gratis" CTA. There are TWO copies of the link per page — the desktop header (`class="header-login"`) and the mobile menu (`nav-mobile-actions`, the one actually tapped on a phone; the first fix missed it) — in every page and in `build-blog.js`, so change all 42 places together.
### description above for the Product menu's contents)
Verified by reading `test.html`'s live markup directly rather than assumed. `<nav class="
main-nav">` top-level, in order: **"Zo werkt het"** (`/zo-werkt-het`) → **"Product"**
(`.nav-dropdown-trigger` → `#product-menu`) → **"Templates"** (`/templates`) → **"Prijzen"**
(`/pricing`); then `.header-actions`: **"Inloggen"** (external, `my.mowi.agency/login`) +
**"Start gratis"** pill CTA (`my.mowi.agency/aanmelden`). "Docs"/"About"/"Blog" are **no
longer top-level nav items** (footer-only now) — exactly when/why that changed wasn't
re-derived, only that it's the current live state.

**"Product" is now a 3-category mega-menu grid**, not the single-column Workflows/Koppelingen/
Vertrouwen dropdown described above — Koppelingen and Vertrouwen are no longer in it either.
Each category is one `.nav-menu-item-grid` (CSS Grid, `repeat(2, minmax(0,1fr))`) with a
`.nav-menu-heading`, an `.nav-menu-item-full` "Alle X" row spanning both columns, and its
items stacked 2-per-row beneath:
- **Agents** — Alle agents (`/workflows`) · E-mail agent · Call agent.
- **Workflows** — Alle workflows (`/workflows`) · Orderstatus · Offerte-opvolging ·
  Agenda-samenvatting · CRM-synchronisatie.
- **Dashboards** (added 2026-08-26, see [[Website/dashboards-nav-category]] in the Obsidian
  vault) — Alle dashboards (`/workflows#dashboards`) · Webshop overzicht · Directie overzicht ·
  Klanten en retouren · Webshops vergelijken · Agenda · Verkooppijplijn · Openstaande
  facturen · Winstgevendheid.

`.nav-menu` is 76rem wide (widened from an original 42rem across two follow-up rounds so every
title stays on one line at 2-per-row). This exact `#product-menu` markup is duplicated
identically across all 16 root HTML pages (no templating) — a change to one category must be
applied to all 16, and `test.html` is the reliable copy-paste source.

## Documentation section (setup guides for clients)
- Structure, page anatomy, navigation anatomy, and writing rules are defined in
  `reference/docs-style-guide.md` — study/inspiration only, same status as
  `reference/style-vuewer.md`, not part of the shipped site. Follow it for every docs page.
- Language: Dutch, formal **"u"** form, same as the rest of the site.
- Agent and product names stay in English, per the header-nav English exception above
  (e.g. "CRM sync", "E-mail agent", "Invoice processing", "Lead enrichment", "Report generator").
- UI labels (button/menu names the client sees on their actual screen) are quoted **exactly**,
  in whatever language that screen shows them in — do not translate a UI label that's genuinely
  English on-screen into Dutch, or vice versa. Verify the real on-screen wording before writing
  a step; never guess or approximate it.
- The client portal is always called **"het dashboard"** — never "de omgeving," "het portaal,"
  or "uw account." One term, used consistently across every docs page.
- Information architecture (categories + initial page list) is proposed in
  `reference/docs-style-guide.md` §4. Treat that as the working IA once approved; update this
  file's Folder structure section below if/when the docs section adds new folders.
- **v2 rebuild note:** the docs section's IA, article content, and JS mechanisms (`docs.js`,
  `docs-nav.js`, sidebar/breadcrumb/TOC generation) were explicitly out of scope for the v2
  teardown and are byte-for-byte unchanged. Only `css/docs.css`'s own numeric tokens were
  lightly harmonized — its spacing scale (`--docs-space-1..7`) now mirrors the marketing
  site's 4px-based `--space-*` progression where a value already landed on that scale; radius
  and color stayed pinned to the real dashboard's own CSS (`reference/dashboard-css/`), which
  remains the actual source of truth for this section, not the marketing palette. `docs.css`
  bumped to `?v=20260817` across all 17 docs pages. "Docs" is now promoted to a top-level
  marketing-nav item (see Navigation above) instead of living inside a "Resources" dropdown.

### Docs are visually a dashboard extension, not a marketing page
- Docs pages are styled to match the **client dashboard** (a separate Laravel app at
  `c:\Users\SalP1\Desktop\Mowi Dashboard` — not part of this repo), not this site's own
  marketing design. Calm neutrals, no accent hue, no display-sized headings, no marquees, no
  scroll-reveal animation. This was already true before the v2 rebuild and remains true
  now that the marketing site itself is also monochrome — the two sections still look
  distinct (Inter vs. Plus Jakarta Sans/Instrument Serif, dashboard-grey vs. warm-bone, 8px
  vs. pill-family radius), they just no longer clash on "has color vs. doesn't."
- Style source of truth: `reference/dashboard-css/` (a copy of the dashboard's own
  `resources/css/dashboard.css`, plus a README summarizing the extracted tokens) — study/
  inspiration only, same status as `reference/style-vuewer.md`. If the dashboard's CSS ever
  changes, re-copy it there and re-derive `css/docs.css`'s tokens from it.
- All docs pages load **only** `css/docs.css` (self-contained: reset, layout, components) —
  never `css/style.css` or `js/main.js`. This is deliberate, so marketing styling/animation can
  never leak into the docs section. Font is Inter via `fonts.bunny.net` (matches the dashboard
  exactly), not the marketing site's Plus Jakarta Sans.
- Sidebar navigation is generated entirely from `js/docs-nav.js` (`DOCS_NAV` / `DOCS_HOME`
  globals, hrefs are extensionless — `agent-crm-sync`, not `agent-crm-sync.html` or
  `docs/agent-crm-sync.html`; see "Extensionless docs URLs" below for why that works) by
  `js/docs.js`, which also builds the breadcrumb, previous/next links, and the "Op deze pagina"
  TOC (scroll-spy, only rendered when the article has real `h2`s — stub pages correctly show no
  TOC). **To add a new docs article: add one `{ title, href }` line (extensionless) to the right
  category in `js/docs-nav.js`, create the matching `docs/<slug>.html` file** (copy an existing
  article's `<head>`/header/sidebar-mount/breadcrumb-mount/TOC-mount boilerplate — the three
  `../` asset references and the `data-docs-href` matching the new filename, also extensionless,
  are the only parts that differ), **and add the same `<slug>` to the Cloudways rewrite rule**
  (see below) — the sidebar, breadcrumb, and prev/next everywhere else update automatically.

### Extensionless URLs (site-wide) depend on Cloudways Web Rules, not just link edits
- All internal links — root marketing pages and docs links (sidebar, breadcrumb, prev/next,
  in-article cross-links, e.g. `/docs/agent-crm-sync`) — point to extensionless URLs. The files
  on disk still end in `.html`; only the URL is clean.
- This only works via **Internal Rewrite** rules configured directly in the Cloudways dashboard
  (app `mowi.agency` / 6590002 → **Web Rules → Rewrite Rules**, not anything in this repo or in
  nginx config files we have access to — see the SSH/root-permission note under "Deploying to
  production" above). The docs rule — `^/docs/([a-z0-9-]+)$` → `/docs/$1.html`, Action
  **Internal rewrite** — was verified 2026-08-03 against every article (right status code *and*
  right page content) plus collateral checks, all correct.
- Root-level marketing pages resolve extensionlessly too, confirmed **not** via an explicit slug
  list (corrected 2026-08-05 with hard evidence): after `/ai-automatisering` was renamed to
  `/agentic-ai`, the new clean URL worked in production **immediately**, with no Cloudways
  change made — and a `curl` to `/test` (never on any documented slug list, dev-only, not meant
  to have a clean URL at all) also resolved to `test.html`, while a genuinely nonexistent slug
  correctly 404'd. That rules out an explicit per-slug allowlist; the real mechanism generically
  tries `<path>.html` for any unmatched path and 404s if it doesn't exist on disk. Whether that's
  a Cloudways Web Rule written more broadly than previously assumed, or plain nginx `try_files`
  configured at the server-block level (this repo's SSH user has no root/nginx-config access to
  check directly) is unconfirmed either way. **Practical upshot: a newly-added or renamed
  root-level `.html` page does not need any Cloudways dashboard step to get a working clean
  URL** — it already works, verify with a `curl` if in doubt rather than assuming a manual step
  is owed. This is also how `/workflows#email-agent`-style hash anchors on real pages resolve
  fine — the hash is client-side only, irrelevant to server-side routing.
- The account's Web Rules quota showed **24/25 remaining** after adding the docs rule
  (2026-08-03) — re-check the actual quota number in the dashboard rather than trusting a
  remembered figure, since the root-level mechanism above may not be consuming a rule slot at
  all (a generic nginx fallback would explain the same behavior without using one).
- `serve.js` (local dev server) mirrors both rules generically (falls back to appending `.html`
  to any unresolved extensionless path, not just under `/docs/`) so local testing matches
  production once the second rule is added. If the live rules ever change, update `serve.js` to
  match or local testing will silently diverge from reality.
- If `docs/` is ever moved off this Cloudways app (different host, different app, subdomain
  split, etc.), this rule does not travel with the repo — recreate it on the new host first, or
  every docs link will 404.
- Every docs page follows the same shell: `.docs-header` (slim, wordmark + "Terug naar website"
  + "Inloggen" linking to `https://my.mowi.agency/login`) → `.docs-sidebar` (mount point
  only, populated by JS) → `.docs-content-wrap` (`.docs-column` + `.docs-toc`). Reusable
  components live in `css/docs.css`: `.docs-steps` (numbered steps with circles), `.docs-prereqs`
  (prerequisites checklist box), `.docs-callout` with `-note` / `-warning` / `-result` modifiers
  (the `-result` variant is for "U ziet nu ..." expected-result confirmations), `.docs-media`
  (grey rounded image placeholder + caption, for screenshots to be added later), and
  `.docs-token-row` / `.docs-copy-btn` (copyable key/URL blocks with a working clipboard button).
- `docs/index.html` (overview, dashboard-style category cards) plus **16 articles** exist with
  real written content, confirmed by direct inventory (not the older, inaccurate "19 articles"
  figure this file used to carry — recount with `ls docs/*.html` if this number is ever in
  doubt, ownership of the exact count drifts as pages are added). Every article follows the
  same anatomy: two-sentence "what this does," one-line goal, prerequisites box, numbered steps
  with "U ziet nu ..." results, image placeholders, troubleshooting, next steps. The Email
  triage agent page (`docs/agent-email-triage.html`) was written first and approved by the user
  as the template every other article copies — if in doubt about tone/structure/depth for a new
  or edited article, match that one.
- The marketing footer has a dedicated column (`.footer-support`-style column in
  `.footer-inner` — 4 columns total: brand/Platform/Bronnen/Bedrijf & Contact) whose "Bronnen"
  heading holds Blog + Documentatie together, linking to `docs/index.html` as "Documentatie" —
  keep that link when editing any footer, and keep it a real dedicated column, don't flatten it
  back into the platform/nav column.

### Precision rules that produced this content — apply to every future edit
- **Never invent a click-path.** Steps inside our own dashboard are grounded by reading the
  actual Mowi Dashboard Laravel codebase (`c:\Users\SalP1\Desktop\Mowi Dashboard` —
  routes/web.php, the relevant `resources/views/**/*.blade.php`), not guessed from what a
  dashboard "probably" looks like. Steps inside external tools (Gmail, Outlook, Salesforce,
  Exact Online, AFAS, Power BI) are grounded by fetching that tool's own official documentation
  (WebFetch/WebSearch), not recalled from memory.
- **Two HTML comment markers flag unresolved precision gaps** — `<!-- DRAFT: ... -->` for steps
  in our own platform where the screen/process doesn't exist yet or isn't confirmed;
  `<!-- VERIFY: ... -->` for external-tool details found via secondary sources (blog posts,
  community articles) rather than confirmed directly on the vendor's own page (some vendor help
  portals are JS-rendered SPAs that don't reliably return real content to WebFetch — when a fetch
  returns only a loading/CSS-error shell, that's the tool failing to render, not the page being
  empty; don't treat it as "nothing exists there"). Find every open one with:
  `grep -rn "DRAFT\|VERIFY" docs/*.html` — count and list change as pages are added/edited, so
  re-run the grep rather than trusting a cached count here.
  As of 2026-08-13 the dashboard (`Mowi Dashboard` repo) has a real, working self-serve
  Koppelingen step (`resources/views/profile/partials/update-shop-connection-form.blade.php`)
  for WooCommerce, Shopify, Pipedrive and Google Agenda, with real click paths, not DRAFT
  markers — see `docs/koppeling-woocommerce.html` etc. The other agent/koppeling pages (CRM
  sync, Invoice processing, Lead enrichment, Report generator, and any future platform) may
  still need DRAFT markers until their own dashboard screens exist — check the actual dashboard
  repo before assuming either way.
- **Never guess security/network specifics.** `docs/it-beveiliging.html` and
  `docs/it-netwerkvereisten.html` deliberately omit encryption/retention/certification claims and
  all IP/domain/port values — a wrong firewall value is worse than none. Only add these once a
  human confirms them; don't infer from how other Mowi infrastructure is configured.
- **Two confirmed facts already resolved into real page content** (not placeholders): the
  dashboard runs on the same server as this website but as a separate application under its own
  subdomain (stated on `docs/it-beveiliging.html`); there is no standard verwerkersovereenkomst
  (DPA) today, it's arranged per client on request (same page).
- **Known cross-repo mismatch, not yet fixed anywhere:** the dashboard's own `config/support.php`
  (`SUPPORT_DOCS_URL`, referenced from `resources/views/support/index.blade.php`'s "Open
  documentation" button) defaults to `https://docs.mowi.agency` — a subdomain that doesn't exist.
  This docs section actually lives at `mowi.agency/docs/` on this repo. Someone needs to either
  point that env var at the real URL or stand up `docs.mowi.agency` to resolve here; not
  something to silently fix from this repo.
- **Salesforce-specific, time-sensitive:** as of Salesforce's Spring '26 release, Salesforce
  itself recommends "External Client Apps" as the successor to "Connected Apps" for new
  integrations (confirmed on a directly-loaded Salesforce Help page); several independent
  secondary sources additionally claim new Connected App creation is blocked by default in most
  orgs since that release, which could not be confirmed on a Salesforce-owned page directly —
  `docs/koppeling-salesforce.html` is written to lead with External Client App and defer to the
  admin, with the unconfirmed part left VERIFY. Re-check this if Salesforce ships further changes
  before this page is considered final.

## Content & positioning
- Content is adapted from `reference/content-data-vista.md` (our own prior business
  website — safe to reuse/adapt in full: text, numbers, stats, client names, case studies) —
  historical source; both rebrands have since rewritten most of what actually ships.
- **Homepage hero copy (2026-08-29, Sal's direct call):** `<h1>` is **"Deploy Agents.<br />
  Workflows. Dashboards."** — Sal's own wording (typed "Workfows", corrected as an obvious typo;
  the closing period added for the three-beat rhythm). **"Deploy" is English on purpose** — a
  founder exception to the Dutch-only rule for this one heading, same category as the English
  product nouns (Agents/Workflows/Dashboards) already used in the nav; don't "fix" it to Dutch
  without asking. The `.hero-sub` was rewritten in the direct-response voice the agent pages
  already use ("Geen X. Geen Y. Geen Z." → mechanism → risk-reversal close): "Geen inbox die
  overloopt. Geen gemiste oproep. Geen order die u zelf opzoekt. Zeg in gewone taal wat er moet
  gebeuren. Mowi bouwt het, test het en zet het live na uw akkoord. Vandaag gratis te
  proberen." No numbers, no "geen creditcard"-style claims (signup/trial terms are not verified
  from this repo). The previous copy ("Automatisering die naar u luistert" / "Mowi is het
  platform waar u in gewone taal zegt…") is superseded, kept only in git history.
- **Homepage lost its "Gemaakt voor het Nederlandse MKB" section (2026-08-29, Sal's call):**
  the closing three-reasons block (Eerlijk over de prijs / Klein beginnen kan / Altijd iemand
  aanspreekbaar, with the `.icon-tile` glyphs added earlier that day) was removed outright from
  `index.html`; the security strip now follows the "Eén platform" tabs directly. The
  `.reasons-grid` CSS in `style.css` is now unused on the site — left in place (harmless, and
  the section is one `git revert` away); delete it if it's still unused after the next design
  pass. Don't reintroduce the section without asking.
- **Agent pages lost their "Er is maar één probleem." section (2026-08-29, Sal's call):** the
  four-card pain grid that sat between "Wat de agent doet" and "Zo werkt het" on both
  `e-mail-agent.html` and `call-agent.html` was removed outright. Don't reintroduce it; the
  copy is in git history if ever wanted.
- **Agent-page headings lost their trailing periods (2026-08-29, later still, Sal):** both
  `<h1>`s are now "Nooit meer een mail die blijft liggen" / "Nooit meer een gemiste oproep" (no
  dot), and the "Zo werkt het" `<h2>`s became one sentence without a dot: "Wij zetten uw agent
  op en u mailt zoals u al deed" / "Wij zetten uw agent op en uw telefoon doet de rest". The
  homepage's "Deploy Agents. Workflows. Dashboards." and `zo-werkt-het`'s "Eerst zien. Dan pas
  live." keep their periods — multi-beat lines where the dot is the beat.
- **`zo-werkt-het` hero (2026-08-29, Sal: "direct marketing response copy"):** `<h1>` "Eerst
  zien.<br />Dan pas live." (was "Vertellen, testen, en dan pas live"); sub in the agent pages'
  DR device: "Vertel in gewone taal wat er moet gebeuren. Mowi draait het eerst als proef op uw
  eigen gegevens, zonder dat er iets verstuurd wordt. U leest terug wat er zou zijn gebeurd. Pas
  na uw akkoord gaat het live." Maps 1:1 onto the page's three splits (vertellen / testrun /
  zien). Old sub had an em dash; gone.
- **Voice agent hero sub (2026-08-29, later):** Sal asked for "something direct response
  still but different than" the "Geen nieuwe centrale. Geen extra personeel. Geen voicemail
  die niemand terugluistert." triad (he labelled it the Inbox agent's, but quoted the Voice
  agent's — the Voice one was changed; flagged to him). Now a different DR device — outcome,
  objection-handling, mechanism, control: "Elke oproep wordt aangenomen. Ook op de ladder, in
  gesprek of na sluitingstijd. De agent plant de afspraak in of legt een terugbelverzoek vast. U
  belt terug wanneer het u uitkomt." Every claim maps to the page's own cards/flows (elke
  oproep aangenomen; afspraak inplannen; terugbelverzoek). Heading "Nooit meer een gemiste
  oproep." unchanged.
- **Inbox agent hero (2026-08-29, Sal: "more of a direct response approach"):** `<h1>` is now
  **"Nooit meer een mail die blijft liggen."** (was "Uw inbox is 's ochtends al gesorteerd.") —
  a pain-elimination headline taken from the page's own story section ("De offerte die blijft
  liggen … Hij belt de concurrent."), deliberately parallel to the Voice agent's "Nooit meer een
  gemiste oproep." so the two agent pages rhyme. The sub's third beat changed with it (was
  "Geen offerteaanvraag die drie dagen blijft liggen" — same phrase as the new heading; now
  "Geen avond meer op de bank met uw inbox", the page's other pain). Keep the two agent heroes
  parallel if either is rewritten again. **Sub rewritten again later the same day** (Sal: "just
  like you did for voice agent, direct marketing flavoured") in the same device as the Voice
  sub: "Elke e-mail wordt gesorteerd en het antwoord staat klaar. Ook de aanvraag die
  vrijdagavond binnenkomt. De agent vraagt zelf wat er nog mist. U leest het na en verstuurt."
  Every claim maps to the page's cards (sorteert, conceptantwoord klaar, vraagt zelf door, u
  controleert en verstuurt). The two agent subs now share one structure: outcome → the
  objection → mechanism → you stay in control.
- **Current positioning, unchanged by v2:** Mowi is a **conversational workflow-automation
  platform** for the Dutch MKB/SMB — "u zegt het, en het werkt." The product story is:
  describe what you want done in plain language, Mowi configures it from tested building
  blocks (never freeform code), nothing goes live without your approval, and there's always
  a named person accountable (not an anonymous support queue). v2 didn't change any of this —
  only how it's expressed visually and structurally.
- **Receptenboek retired as standalone pages (v2, 2026-08-18) — its content lives on now,
  reshaped.** v1 showed concrete workflow examples via a `/receptenboek` hub page linking to 5
  separate recipe detail pages. v2 folds all of that content directly into `workflows.html`
  as full recipe panels inside a pill-tab category switcher (E-mail · Telefonie · Orders ·
  Offertes · Agenda · CRM & data — 5 original recipes plus 3 lighter new ones: invoice
  processing, lead enrichment, report generation), each panel addressable by a stable hash id
  (`#email-agent`, `#call-agent`, `#order-status`, `#offerte-opvolging`,
  `#agenda-samenvatting`, `#crm-sync`) that both the homepage's capability-card strip and
  external links use. The old `/receptenboek` URLs are now redirect stubs pointing at the
  matching `/workflows#<anchor>` (see Folder structure). No indexed page count was preserved
  1:1 (6 URLs collapsed into 1), a deliberate trade-off judged acceptable for a young,
  demo-gated site — every deep link still resolves to real, matching content via the anchor.
  The "recept"/Receptenboek vocabulary is retired sitewide too — everything is a **workflow**
  now, one term, less jargon.
- **Superseded 2026-08-17 (v1 rebrand) — kept for history:** the site used to be pitched
  AI-first with "AI-automatisering is the main/lead service; Power BI dashboards and
  trainingen are supporting/secondary services." Power BI dashboards, trainingen, and the
  original "Cases" page were dropped entirely as part of that rebrand — don't reintroduce
  them as services or nav items; their old pages remain redirect stubs (see Folder structure).
- **Pricing / business model — tiers current as of 2026-08-22 (later same day, see next
  bullet).** `/pricing` H1 is **"Betaal per gebruik"**. Four tiers: **Start gratis** (€0, 30
  credits), **Basis** (€19/mnd, 300 credits), **Pro** (€79/mnd, 1.500 credits), **Custom** (op
  maat, na een demo). Start gratis/Basis/Pro sit in one `.tier-grid`, differentiated by credit
  balance only — no agent- or workflow-name gating on any of them, per the unified-access
  amendment below. **Custom lives in its own band (`#pricing-custom`), not the grid** — moved
  out 2026-08-22 so the demo-gated tier structurally never sits beside the credit-priced cards,
  making the masterplan's packaging rule physically true rather than visually implied. Every
  self-serve CTA (Start gratis, Basis, Aan de slag ×2) links to
  `https://my.mowi.agency/aanmelden`; Custom links to `/demo`.
  **Superseded 2026-08-22 (later still the same day) — kept for history:** ~~"Plan een demo" is
  still the primary CTA in the header/footer chrome sitewide; the pricing page is where the
  self-serve path now lives.~~ See the CTA-flip bullet below.
  **Deliberately one new tier, not the two originally asked for** — a volume-discounted
  mid-tier makes a customer's usage cost Mowi *less* revenue than the same usage on Basis plus
  top-ups would, which cuts against the "profit scales with usage" goal; a second published
  breakpoint would also be a second contractually-binding number (AV art. 4.2) set with zero
  real usage data, since credits are still dormant in production. **Support-tier
  differentiation (dedicated contact, faster response) was considered and explicitly
  rejected** — Mowi is a confirmed eenmanszaak, the masterplan is BINDING that Motion A support
  stays docs-first with an async backstop and capacity valves are "price and waitlist, never
  concierge-for-free," and the SLA annex (vault `Legal/contracts/08-Dienstbeschrijving-SLA.md`)
  is untiered and overrides marketing copy on conflict — "Vaste contactpersoon" stays exclusive
  to Custom. Full reasoning and the margin math behind it: masterplan §5 and the Decisions log,
  2026-08-22.
- **Sitewide primary CTA — current, 2026-08-22 (later still the same day).** "Start gratis" (→
  `https://my.mowi.agency/aanmelden`) replaced "Plan een demo" as the primary CTA everywhere:
  header `.header-actions`, mobile nav, and the footer CTA block, across all 16 root pages plus
  the blog chrome template in `build-blog.js`. This reverses the "demo stays primary sitewide"
  call from earlier the same day (see the superseded note above) — a deliberate second decision,
  not a bug. **"Plan een demo" now survives in exactly one place: the Custom band on
  `/pricing`.** The footer's "Contact sales" text link (→ `/demo`) was kept everywhere as a
  second, lower-emphasis demo entry point — don't remove it if editing any footer.
  **Widens an existing exposure, doesn't create a new one:** every "Start gratis" click
  sitewide, not just `/pricing`'s, now lands on the old retired per-agent trial signup until
  `CREDITS_ENABLED` flips (see the exposure note above). **`/demo` is still a blank page**
  (chrome only, empty `<main>` — same status as `over.html`, `templates.html`, `workflows.html`)
  — after this change it's reachable from only two links on the entire site, which makes
  building it a more urgent open item than it was that morning. Building `/demo` was
  deliberately treated as separate follow-up work, not a blocker for this change.
  Custom's copy was also rewritten the same session: qualifier line "Voor wie het volledig uit
  handen wil geven" (Sal's own wording), feature list gained "Advies over wat u het beste kunt
  automatiseren" and "Wij richten het in, u hoeft zelf niets te doen", dropped "Alles uit Pro."
  Sal's original framing was "custom advies + implementatie, volledige ontzorging" — shipped
  "wij richten het in" instead of "volledige ontzorging" specifically, because that exact phrase
  has zero prior occurrences anywhere in the vault and reads as a service-level promise that
  the untiered `Legal/contracts/08-Dienstbeschrijving-SLA.md` (states it overrides marketing
  copy on conflict) doesn't back. Sal also floated "€200 minimum" for Custom in conversation;
  **not published** — it contradicts the vault's own RECOMMENDED €99–149/mnd Motion B launch
  figure and was never logged as a confirmation, so Motion B pricing stays unconfirmed and off
  the page either way, per the packaging rule. Full reasoning: masterplan §5's "Amendment
  2026-08-22 (later still)" and the Decisions log, 2026-08-22 (second pricing entry that day).
  **Superseded 2026-08-22 (earlier the same day) — kept for history:** ~~three tiers (Proef,
  Agents, Platform), H1 "Eenvoudige prijzen". Proef and Agents both link to
  `https://my.mowi.agency/aanmelden`; Platform links to `/demo` and deliberately carries no
  price next to it (the masterplan's own packaging rule — platform pricing never sits beside
  agent pricing).~~ Renamed Proef→"Start gratis" and Platform→"Custom" later the same day,
  before the Basis/Pro restructuring above superseded the tier count itself.
  **Deliberate, founder-approved exposure, not an oversight:** this was published *ahead* of
  the backend — `config('credits.enabled')` is still `false` in production as of this build,
  so a signup today still runs the old retired per-agent trial (`RegistrationController` /
  `TrialStart`), not the credit system the page describes. The two self-serve CTAs are a
  one-line change to point elsewhere once `CREDITS_ENABLED` flips. The trial figure ("30
  gratis credits", no day count) is a proposal, not a vault-confirmed number — the credit
  model itself never defined a trial allocation. The other figures (€19/mnd, 300 credits,
  1 e-mail = 1 credit, 1 belminuut ≈ 10 credits) were confirmed by Sal the same day; see the
  masterplan-amendment bullet below and the Decisions log, 2026-08-22.
  **Real, still-open contradiction this creates:** `algemene-voorwaarden.html` (arts. 3.4, 4.2,
  4.4, 4.5, 4.8, 5.1) still describes the *old* self-serve €40/€80-per-agent model with a
  14-day free trial, and art. 4.2 makes `mowi.agency/pricing` the contractually *leading* price
  list — so the live page and the live terms currently disagree about what the prices even
  are. A draft AV amendment was prepared the same session for founder/legal sign-off; until
  that lands and is approved, **do not silently rewrite the AV's legal text**, and don't treat
  the AV's numbers as current elsewhere on the site. `/demo` still points at the literal
  `[CALENDLY_URL]` placeholder (see Placeholders below). The 3 existing blog posts also still
  contain old self-serve pricing/CTA copy (`€1.000` setup + `€50`/maand in one post) — a known,
  deliberately-not-rewritten editorial gap (blog *prose* is out of scope for chrome-only
  regeneration via `build-blog.js`). Flag rather than silently edit post bodies.
  **Superseded 2026-08-22 — kept for history, do not follow:** ~~the site is demo-gated with no
  published self-serve prices; there is no `/pricing` content page, no `€40`/`€80` self-serve
  monthly rates displayed anywhere live, no signup CTA, and no `my.mowi.agency/aanmelden` link
  on any real page.~~ `zo-werkt-het.html`'s own "why there's no price list" explainer was
  planned under that era and was never actually written before this page superseded the need
  for it — its placeholder TODO comment was removed the same session, not filled in.
- **Masterplan amendment 2026-08-19 (vault — adopted by the founder): two-motion model.
  Figures confirmed 2026-08-22.** The business model is no longer demo-gated-only: the
  hardened agents (E-mail/Call) sell **self-serve** as an acquisition wedge, cheap and
  **usage-priced via a credit system** (no per-agent fee — the €40/€80 per-agent prices stay
  dead either way), while the platform/configurator stays demo-gated premium with no published
  price. **Confirmed figures (2026-08-22, no longer "RECOMMENDED"):** €19/mnd including 300
  credits; 1 verwerkte e-mail = 1 credit; 1 belminuut ≈ 10 credits. Trial allocation ("30
  gratis credits") is still a proposal, not vault-confirmed — see the pricing bullet above.
  **Superseded 2026-08-22 — kept for history:** ~~the site itself does not change yet: no
  self-serve CTA, signup link, or pricing goes live until the credit billing exists.~~ Sal's
  explicit call was to publish `/pricing` now, ahead of `CREDITS_ENABLED` — see the pricing
  bullet above for the exposure this creates and why it was accepted anyway. Full rationale:
  the vault's `Mowi - Masterplan — MKB-OS.md` §5 + Decisions log, 2026-08-19 and 2026-08-22.

## Design system
- **Current, v2 (2026-08-18) — monochrome.** `css/style.css` implements a **black-and-white
  system on the same warm-bone canvas as before** (`--bg:#faf6ef`, unchanged — a warmth/paper
  quality, not a hue; `--ink:#1c1712` near-black; `--bg-inverted:#1c1712` for dark bands) —
  **there is no accent color anywhere.** No `--accent` token exists in the stylesheet at all.
  Emphasis is carried by weight, size, the `.h-emph` serif-italic word (unchanged mechanism —
  Instrument Serif italic mixed into otherwise-sans Plus Jakarta Sans headings), and solid
  black/bone fills — never by hue. Buttons: solid-black-fill/bone-text (primary) or
  bone-fill/black-border (secondary), fully pill-shaped (unchanged from v1), no third color
  variant ever. Category tags (e.g. on the workflows/capability cards) are plain black-bordered
  pills with text, not color-coded.
  The **orb** motif survives conceptually but is rebuilt as a **pixelated/halftone sphere** —
  a dot-matrix pattern (CSS `radial-gradient`s on a repeating grid, masked to a circle, with
  density/opacity modulated to fake sphere shading) in the same luminance-to-alpha spirit as
  the real `mowi-icon.png` logo texture (see Branding below), pure black-on-bone or
  bone-on-black, never a gradient color blob. Size modifiers `.orb-sm`/`.orb-md`/`.orb-lg`,
  plus a `.orb-thinking` variant (a different static dot-density state, not a continuous
  animation) used inside the chat-input's conversation demo.
  **Motion is deliberately minimal and reference-grounded** — see the "Total rebuild v2"
  section at the top of this file for the exact rule and its one exception (the chat-input
  auto-play demo). No scroll-reveal, no magnetic-hover, no idle orb animation exist in v2's
  `js/main.js` at all — this is a hard constraint, not a stylistic default, don't reintroduce
  any of them without the founder explicitly loosening the rule.
  New components introduced in v2, all monochrome: `.chat-input` (the flagship "describe what
  you want" pill component, `initChatInput(el, opts)` in `js/main.js` — reads `data-mode`
  [`idle`|`auto-play`], `data-prompts`/`data-results` pipe-separated off the element; respects
  `prefers-reduced-motion`), `.hero-frame` (rounded-28 container holding a chat-input + small
  status chips), `.pill-tabs` (`initPillTabs(container)` — `role="tablist"` wiring,
  hash-activatable, used on `workflows.html`'s category switcher), `.card-strip`
  (`initCardStrip(track)` — scroll-snap horizontal card row with drag support, used for the
  homepage's capability-card teaser), `.logo-wall` (bordered grid, greyscale-until-hover
  logo cells), `.trust-strip`, `.pull-quote` (serif-italic opening mark + greyscale portrait).
  See `test.html` for a live rendered reference of every primitive — it was rebuilt in v2 as
  the canonical styleguide and is also the copy-paste source for the exact header/footer
  markup every other page must match.
- **Homepage imagery (2026-08-28) — the one deliberate exception to "no colour anywhere".**
  Two placeholder tiles on `index.html` became real images at the founder's request:
  - **Hero:** `assets/hero-dashboard.webp` (2178×1388, ~66 KB), a real screenshot of the
    dashboard's chat home, in a hairline-bordered `--radius-header` frame (`.hero-visual`, now
    an `<img>` — the old `min-height` rules were removed because they'd stretch a real image).
    Re-export from a fresh screenshot when the dashboard home changes.
  - **"Workflows in minuten" slider:** nine `assets/workflows/*.webp` (900×600, 3:2, ~50–70 KB
    each), one per card. Each is a small **monochrome** UI card (stat, sparkline, stepper,
    legend, chat, rows, bars) composited over ONE shared field/cloud photo with a film-grain
    overlay and ~12% darkening; the same photo is cropped/mirrored differently per card so it
    doesn't read as nine copies. ~~The photo carries the colour; the UI on it stays black-on-white
    per the rule above.~~ **Superseded 2026-08-29 (Sal: "the colours pop, not consistent with
    the brand"): the photo is now a warm duotone in the site's own tokens** — shadows → `--ink`,
    midtones → `--ink-3`, highlights → `--bg` (PIL `ImageOps.colorize` on the grayscale), grain
    and darkening unchanged, the white UI cards untouched. Chosen over plain grayscale (colder
    against the bone paper) and muted colour (still "the one coloured thing"). Baked into the
    WebPs — no runtime `filter`, so nothing extra for iOS to composite. The "one deliberate
    exception to no-colour" in this bullet's heading therefore now covers only the hero
    screenshot (the dashboard's own greys); the slider is monochrome again. They are **rendered, not hand-drawn** — from an HTML/SVG composition in
    the site's own fonts (Plus Jakarta Sans / Inter Tight), screenshotted at 4× with Playwright.
    That source isn't in the repo (it lived in a session scratchpad); to change a label or
    number, rebuild the composition rather than editing the WebP. Numbers on the cards are
    illustrative activity counts ("31 facturen"), deliberately not performance claims.
  - **Slider trimmed to the nine cards that have an image (2026-09-05, Sal: "remove the
    workflow cards sliders with no image").** Three cards had been added later with a
    "Voorbeeld volgt" `.placeholder-tile` instead of a WebP (Automatisch boeken → `/workflows
    #automatisch-boeken`, Bankmatching → `#bankmatching`, Vraagposten → `#vraagposten`); they
    are removed from `index.html`. The `/workflows` panels they pointed at still exist and are
    unchanged; only the homepage teaser lost them. If one of them gets a real card image later,
    add the card back with an `<img>` like the other nine, never with a placeholder.
  - `.workflow-card-visual` is now an `<img>` rule (`width:100%; height:auto; aspect-ratio:
    3/2; object-fit:cover`). The `height:auto` is load-bearing: without it the `<img>`'s
    `height="600"` attribute wins and every card renders 600px tall (caught in QA).
  - **WebKit regression from that swap, fixed the next day (2026-08-29) after Sal saw it on his
    iPhone ("not infinite and way too fast" on the card slider, logo marquee fine):** the
    `.card-strip` is `width: max-content`, and **WebKit sizes a flex container's max-content
    from each item's content, ignoring a definite `flex-basis`** (Chromium honours it). A
    900px-intrinsic `<img>` per card ballooned the track to **17,296px in WebKit vs 4,660px in
    Chromium** — 12.6k of dead space and past Safari's ~16k animated-layer limit. Fix:
    `.workflow-card` gets a definite `width: clamp(240px, 26vw, 300px)` (+ `flex: 0 0 auto`)
    instead of only a flex-basis; measured 4,660px in both engines afterwards. **Lesson: any
    `width: max-content` flex track on this site needs definite item widths, and mobile QA
    must include Playwright's `webkit` with an iPhone device profile — Chromium-only
    screenshots at 390px never showed this** (the logo marquee's `<img>`s have no intrinsic
    size until loaded and are sized by CSS, which is why it was unaffected). Reproduce/verify
    with `pw.webkit` + `pw.devices["iPhone 13"]`, reading `#workflow-card-strip`'s
    `offsetWidth`.
  - **Workflow canvas touch on iPhone (2026-09-04/05) — the second time Chromium emulation hid
    a WebKit bug, and the rule that came out of it.** Sal: "1 in 7 swipes inside the graph scrolls
    the page instead". Three fixes built on reasoning + Chromium touch emulation (observer
    threshold, `focus({preventScroll})`, arming across the branche switcher) each looked right,
    one even reproduced 8/8→0/8 in Chromium, and none was it. The real cause only appeared once
    the live page reported from his phone: `.wf-node-body` has `overflow:hidden` (three-line
    clamp), the Pointer Events spec resolves `touch-action` only up to the *nearest scroll
    container*, and WebKit treats that box as one — so a swipe starting on node text never reached
    the viewport's `touch-action:none`. Chromium only counts ancestors that actually scroll, hence
    0 leaks in every emulation run. Fixed twice over: `.wf-viewport *{touch-action:inherit}`, and
    — the actual guarantee, after a residual leak — a **non-passive `touchstart`/`touchmove`
    listener on the canvas root that calls `preventDefault()` while armed** (buttons/hint exempt),
    the one mechanism WebKit treats as authoritative. Confirmed on Sal's phone 2026-09-05.
    **Rules:** (1) a mobile touch bug on this site is measured on the real device *before*
    anything is changed — `js/workflow-canvas.js` carries a `?wfdebug=1` overlay (per touch:
    armed, computed `touch-action` of viewport and target, hit element, `pointercancel`, scrollY
    delta) for exactly that; (2) never rely on `touch-action` alone to keep the page still under a
    custom gesture — cancel the touch in JS. The dashboard carries an identical copy of this
    file; keep the two in step by hand.
  - **"Eén platform voor alles wat terugkomt" tabs (2026-08-29):** the five "Voorbeeld volgt"
    tiles are now **static workflow pictures** using the same `.wf-canvas` component as
    `/templates` (nodes, curved edges, dot grid) via a `.wf-canvas-static` variant at the end of
    `css/workflow-canvas.css` — which `index.html` now loads too (**styles only; the canvas JS is
    deliberately not loaded on the homepage**, and the markup carries no `data-wf-*` hooks).
    Each frame is a fixed window onto the *middle* of its flow (tool step → decision → two
    labelled outcomes), Sal's call: "cut-off, only the most important parts" — the Start node's
    tail fades in at the top and the branch nodes fade out at the bottom (same mask idiom as
    `.card-strip-wrap`). Phones scale the stage to 62% via `--wf-s`; `--wf-win`/`--wf-off` are
    set inline per canvas. The five flows (Klantvragen, Bestellingen, Offertes, Agenda,
    Administratie) are **illustrative drafts**, 5 rows each on a 480×820 stage, nodes 100px tall
    (templates' are 88 — a static picture has no hover tooltip, so all three body lines must
    show); Offertes and Agenda have a loop-back edge. They were **generated by a script**
    (`gen_home_flows.py`, session scratch, not in the repo — the geometry is trivial to redo:
    rows at y=40/200/360/520/680, spine `left:140`, branches `left:20`/`left:260`). Sal intends
    to replace them with the real workflows later. Loading this file on a second page is also why
    its templates-only hero override is now scoped to `.tpl-hero` (a hook added to
    `templates.html`'s hero section). `workflow-canvas.css` has its own `?v=` (`20260829-1`,
    on `index.html` and `templates.html` — bump both together).
  - **Canvas edge rule changed 2026-09-05 (Sal: "the arrows look skuffed and one card kisses
    the grey Wat is het card above").** Every baked-in canvas on this site (5 on `index.html`,
    4 on `e-mail-agent.html`, 4 on `call-agent.html`, 20 on `templates.html`) was rewritten by a
    geometry script (session scratch, `wf_rewrite.py`, not in the repo — it parses the inline
    node/path/label coordinates, so it can be redone from the markup alone) to the SAME rule
    the dashboard's `App\Templates\Graph\GraphLayout` now uses: rows are `NODE_H + 96`
    apart (homepage/agent pages: 196 for 100px nodes; templates: 184 for 88px nodes — the
    y=40/200/360/520/680 figures quoted above are therefore superseded, rows are now
    40/236/432/628/824; a first pass the same afternoon used +136 and Sal asked for it
    "less high ... just shortening the arrows", hence 96), a sideways edge curves into a
    **48px vertical stub above its child** and then a straight line in, and its label pill sits
    **on that stub, 24px above the child**
    instead of at the edge's midpoint (which, for a bezier with both control points there, is
    exactly its inflection: the pill hid the bend and two disconnected hooks showed either side
    of it). Straight edges and the two hand-drawn loop-backs (Offertes, Agenda) keep their shape
    with y's remapped. Static windows (`--wf-off`/`--wf-win`) were remapped through the same
    row mapping so each picture still frames the same nodes. **The decision node's head is
    white now, like every other node's** (`.wf-node-decision .wf-node-head{background:
    var(--surface)}`, `workflow-canvas.css?v=20260905-1`): its full-bleed grey tint sat on the
    card border against the grey dotted canvas and read as the card "kissing" the background;
    padding it inward would have cost body-text height in the fixed 88px draggable nodes. The
    question-mark icon carries the decision cue. **Static pictures only, third pass the same
    evening (Sal: "the 2 arrow after the first card from above thats visible, reduce the height
    of that particular arrow down with 50% ... do not do this for the draggable ones"):** a row
    whose every edge into the next row is a straight, unlabelled drop gets a 48px gap instead of
    96, so the picture rows are NOT uniform any more (homepage: 40/188/336/532/728, i.e. two
    tight straight drops, then the full gap for the branch rows). The draggable `/templates`
    canvases keep the uniform 184 pitch, matching the dashboard. **Keep the two generators in
    step:** a dashboard unit test (`tests/Unit/GraphLayoutTest.php`) pins STUB 48 / rise 24 /
    row 184; if either side's rule changes, change both and re-run the rewriter here.
  - **Agent pages' "Voor elke branche anders ingesteld" tabs (2026-08-29):** the eight
    "Voorbeeld volgt" tiles on `e-mail-agent.html` and `call-agent.html` (Loodgieter / Kapper /
    Webshop / Horeca × 2) are the same static cut-off pictures — but **verbatim copies of the
    real `/templates` flows** (`call-agent.<branche>` / `email-agent.<branche>`, themselves
    dumped from the dashboard catalog), not drafts. Generated by a scratch script
    (`gen_agent_flows.py`, not in the repo) that extracts each `.wf-stage` from
    `templates.html`, bumps nodes 88→100px, wraps each body text in `<span class="wf-clamp">`
    and splices it into the panel; **regenerate from `templates.html` rather than hand-editing**
    (the homepage's `gen_home_flows.py` does the same wrap). Windows: call flows open on the
    decision node + its two branches (`--wf-off` = decision top − 130; webshop's decision is one
    row lower); e-mail flows are a 760px three-way fan-out after "Sorteren", so they open on
    that (`--wf-off:200`) and carry `.wf-canvas-static-wide` (78% on desktop, 45% on phones).
    Two CSS rules came with this, both in `workflow-canvas.css`'s static block: the `-wide`
    scale, and **`.wf-clamp`** — line-clamp clips at the padding edge, so clamping the padded
    body let a 4th line's ascenders peek under the ellipsis; the static markup clamps an inner
    span instead. Both agent pages now load `workflow-canvas.css` (`?v=20260829-2`, bumped on
    all four pages that load it). The e-mail flows' branch labels touch/truncate exactly as
    they do on `/templates` (132px label cap, labels 120px apart) — inherited, not fixed here.
    Known generator lesson: the first version emitted one extra `</div>` per canvas, which
    pushed panels 3–4 outside the `[data-pill-tabs]` container so their tabs could never un-hide
    them — always check "panels in container == tabs" after splicing.
    **Same-day follow-ups (Sal's review):** (a) windows open **60px above the key node** (the
    first cut showed ~100px of bare arrow — "that part doesn't show anything"): call flows
    `decision−60 … decision+340` (400px), e-mail `180 … 650` (470px, same as before, trimmed at
    the bottom instead). (b) The "Bekijk alle branches op de Templates-pagina →" link moved
    from a section-level `<p>` below the tab block into **each panel's copy column, directly
    under the button** (`.pill-panel-copy .link-arrow` rule in `style.css`: own line, own
    width) — four copies per page, one visible at a time. (c) The branche tab heads got
    `.icon-tile` glyphs: wrench / scissors / shopping bag / utensils (lucide-style paths,
    24-grid, stroke 1.75). (d) Voice agent hero sub rewritten (see Content & positioning).
    `style.css` `?v=` → `20260829-3` sitewide.
  - **`/templates` showcase, desktop two-column layout (2026-08-29, Sal):** from 64rem the
    capability panel (`.tpl-panels .pill-panel`) is a two-column grid — branche tiles left as a
    **3-per-row grid** (no scroll, no fades; `.tpl-branche-list` switches from the rail to
    `display:grid`), the example right with a **44rem portrait canvas** ("the workflow as a
    vertical widget is perfect because the flow itself is vertical"). Tiles are top-aligned
    there so titles sit on one line across a row (Sal: "make sure the titles align with the tile
    next to it"); `overflow-wrap:anywhere` as a safety net for long compounds plus a `&shy;` in
    "kennismakings&shy;gesprekken" in `templates.html` — deliberately **not** `hyphens:auto`,
    which hyphenated ordinary words at that width. **Below 64rem nothing changes**: the
    horizontal rail (2.5 tiles on phones, edge fades) with the canvas underneath stays as tuned
    2026-08-28 — Sal: "this doesn't count for mobile, just desktop". CSS-only; the switcher JS
    and fade classes need no change (an unscrollable grid computes to "at end"). Lives in
    `css/workflow-canvas.css` (`?v=20260829-3` on the four pages loading it). **Later the same
    day (Sal): the example summary moved from above the canvas to below it** — markup order in
    every `.tpl-example` is now canvas → `.tpl-example-summary` → CTA (all 20, moved by script;
    `.tpl-example-summary` carries a top margin now). `?v=20260829-4`.
  - **Inbox agent hero heading on phones (2026-08-29, Sal: "doesn't look comfortable on
    mobile"):** at 48px on a 390px phone it wrapped as *Nooit meer een / mail die blijft /
    liggen.* — verb pair split, "liggen." orphaned. Fixed with two opt-in helpers in
    `style.css`: `.h-balance` (`text-wrap: balance`, progressive — Safari 17.5+/Chrome/Firefox)
    on the `<h1>`, and `.h-nowrap` on a span around "blijft liggen." (works everywhere). Result:
    *Nooit meer / een mail die / blijft liggen.*; desktop stays one line. Scoped to this one
    heading per Sal ("for the inbox agent only") — not applied to `.hero h1` globally because
    the homepage heading uses deliberate `<br>`s. The Voice agent's heading would benefit from
    the same treatment; not done. `style.css` `?v=20260829-4` sitewide.
  - **`zo-werkt-het.html` split visuals (2026-08-29, Sal):** the three "Voorbeeld volgt" tiles
    in the process section are images now. (1) "U vertelt het in gewone taal" reuses the
    homepage hero screenshot `assets/hero-dashboard.webp`. (2) "Eerst een testrun op uw eigen
    gegevens" → `assets/zo-werkt-het/testrun.webp`, (3) "U ziet precies wat er gedaan is" →
    `assets/zo-werkt-het/activiteit.webp` — both **the same series as the homepage slider cards**
    (white UI card on the warm-duotone field photo with film grain), composed at 2× the slider's
    design scale (600×400 scene, 400px card) because the slot is ~620px wide, rendered at 3× and
    saved as 1200×800 WebP. Testrun card: "48 e-mails doorgelopen / Goed gesorteerd 44 / Concept
    klaargezet 31 / Ter controle 4 / Niets is verstuurd. Live na uw akkoord. [Zet live]".
    Activity card: four timestamped log rows, the last tagged "Aandacht" in ink. Illustrative
    counts, not claims. Source composition was session scratch (`cards2.html`), like the slider's.
    New rule `img.split-visual` in `style.css` (kills the placeholder `min-height`, adds the
    hairline frame). `style.css` `?v=20260829-5` sitewide.
  - **Homepage icons (2026-08-29):** the eight `.placeholder-icon` slots in the "Eén platform"
    tab heads (5) and the "Gemaakt voor het Nederlandse MKB" reasons (3) are real glyphs now,
    per Sal "use the same icon style as the Inbox and Voice agent pages" — i.e. `.lp-card-icon`'s
    tinted circle + hairline + ink-2 stroke. Implemented as a new generic **`.icon-tile`**
    component in `css/style.css` (same look; `.lp-card-icon` itself is untouched and predates
    it — use `.icon-tile` for any new slot), sized to the slot by context rules next to the old
    placeholder ones (2.25rem in tab heads, 2.75rem elsewhere). Glyphs are inline SVG on the
    24-grid, stroke 1.75, round caps/joins, `fill="none"` except a single dot — the same drawing
    rules as the agent-page cards and the workflow-canvas node icons. Chat bubble / parcel /
    document / calendar / receipt for the tabs; price tag / two steps / person for the reasons.
    The two ISO badge placeholders further down are deliberately still placeholders.
- **Superseded 2026-08-17→18 (v1 rebrand) — prior-era reference only, do not follow:** v1 had
  a **warm-light palette with a Mowi-orange accent** (`--accent:#e8590c`, used sparingly for
  primary CTAs/highlights) and a gradient-color orb. If you find visual-style guidance
  elsewhere in this file, in code comments, or in git history that references an orange
  accent, colored category tags, magnetic-hover buttons, or scroll-reveal-on-intersection as
  if current, treat it as pre-v2 and prefer the section above.
- **Superseded 2026-08-17 (older still) — prior-era reference only:** before the v1 rebrand,
  visual style followed `reference/style-vuewer.md` (inspired-by, never copied — that
  provenance rule still applies to *any* future reference-site study, including v2's own use
  of elevenlabs.io/shapes.co: never copy a reference site's actual text, images, project
  screenshots, client logos, or brand assets, only design *patterns*, reinterpreted with our
  own content). That era's base page background was paired with **white** as the secondary/
  contrast surface, square/sharp corners, and a different, non-orange/non-orb/non-Instrument-
  Serif type and color system.

## Placeholders — use literally, never invent real values
Wherever personal/business details belong, insert these placeholders verbatim in the code:
- `[FULL_NAME]`
- `[PHONE]`
- `[EMAIL]`
- `[STREET_ADDRESS]`
- `[KVK_NUMBER]`
- `[CALENDLY_URL]`

`[BRAND_NAME]` is resolved: the brand is **Mowi** (real name and logo now in use — see Branding below).

**v2 note:** `[FULL_NAME]` is now used consistently across every page v2 rebuilt that
references the founder by name in new copy — the homepage pull-quote, `vertrouwen.html`'s
"vaste contactpersoon" section, `over.html`'s founder story, and `demo.html`'s "u spreekt
met" line — because the founder's real name still hasn't been explicitly cleared for public-
facing marketing copy in this session. Real values that were already live and unambiguous
before v2 (phone `+31853335800`, email `contact@mowi.agency`, the business's real KVK/BTW/
address on `bedrijfsgegevens.html`, legally required and unchanged) stay real; those aren't
placeholders, they're already-confirmed facts. Known pre-existing exception, not fixed by v2:
the 3 blog posts' bylines still show the real first name from their markdown frontmatter
(pre-existing content, out of scope for a chrome-only regeneration — see "Content &
positioning" above) — this predates and is independent of the `[FULL_NAME]` convention used
in v2's own new copy, not a new inconsistency introduced by this rebuild.

## Branding
- The brand name is **Mowi**. Use it literally in text (titles, copy, footer copyright, alt
  text) — do not reintroduce a `[BRAND_NAME]` placeholder.
- Real logo assets live in `assets/`:
  - `assets/mowi-icon.png` — a textured/halftone ring illustration, black on a transparent
    background.
  - `assets/mowi-wordmark.png` — the "mowi" text in the same halftone/grain style, cropped
    out of a combined icon+text source image (the source also had the ring baked in above
    the text; that's discarded here since `mowi-icon.png` already covers the icon role).
  - Both are **textured cutouts, not flat silhouettes** — the grain/halftone/dot pattern in
    the artwork is preserved as *varying opacity* (dense marks ~opaque, light gaps
    ~transparent), not flattened to a solid shape. They were derived from the client's
    original files (which had a mottled grey/white paper-textured background) by flattening
    onto white, then mapping luminance to alpha with a smooth ramp (light paper background
    → alpha 0, dark ink → alpha 255) rather than a hard binary threshold — a hard threshold
    would have destroyed the texture. If either logo is ever replaced with more of this
    textured art style, reapply that same ramp approach, not the old flat-silhouette
    threshold method. Previous flat-silhouette versions are kept as
    `mowi-icon-v1-backup.png` / `mowi-wordmark-v1-backup.png` for reference.
  - **v2's `.orb` component reuses this exact luminance-to-alpha texture philosophy** — see
    "Design system" above — so the site's real logo art and its recurring AI-motif now share
    one consistent visual language instead of the logo being textured and the orb being a
    smooth color gradient (v1's approach). If the orb's dot-matrix technique is ever revisited,
    keep it visually consistent with how the real logo's grain actually reads, not just
    internally consistent with itself.
  - These are noticeably larger files than flat-silhouette logos would be (textured alpha
    channels compress less well than flat shapes) — worth optimizing (e.g. pngquant) before
    a real production launch, not urgent for now.
- The standard lockup is icon + wordmark side by side, using the shared `.wordmark` /
  `.wordmark-icon` / `.wordmark-text` CSS classes (see `css/style.css`). The header uses the
  small size; the footer uses the `.wordmark-lg` modifier for a larger version.
- `assets/favicon.png` — a dedicated favicon derivative of `mowi-icon.png`, used via
  `<link rel="icon">` and `<link rel="apple-touch-icon">` on every page (not `mowi-icon.png`
  directly). `mowi-icon.png` is 1317×790 — a wide, non-square source, since it's meant to be
  read at logo size next to the wordmark, not as an icon on its own. Browsers squish a
  non-square image into the small square favicon slot (visibly distorted on desktop) and
  mobile/PWA icon handling is often stricter still and can just fail to show a non-square one
  at all — matches a real bug report ("not showing on mobile, compressed-looking on desktop").
  `favicon.png` is the ring padded onto a transparent square canvas (centered, no cropping),
  then downscaled to 512×512. If `mowi-icon.png` is ever regenerated, regenerate this the same
  way rather than pointing the favicon at the raw logo file again.
- `favicon.ico` (project root, not `assets/`) — a **second real incident**, distinct from the
  one above: even with a correctly-square `favicon.png` and proper `<link rel="icon">` /
  `<link rel="apple-touch-icon">` tags on every page, the icon still didn't show on some mobile
  browsers/in-app webviews while working fine on desktop. Root cause: those clients (iOS Safari
  home-screen icons, various Android in-app browsers) probe `/favicon.ico` at the conventional
  root path directly, ignoring the `<link>` tag entirely, and show nothing if it 404s — which it
  did, since no file existed there. Fixed by generating `favicon.ico` as a plain ICO container
  wrapping the same `favicon.png` bytes (no re-encoding, so there's still one real source image).
  If `favicon.png` is ever regenerated, regenerate `favicon.ico` from it the same way — don't let
  the two drift apart.
- **No client logos and no invented logos.** Wherever a *client* logo strip/marquee appears,
  use neutral grey placeholder tiles (simple rounded blocks containing the word "logo"). Real
  client logos come later. This does not apply to Mowi's own logo (real and final) or to the
  12 real integration/partner logos in `assets/logos/` (WooCommerce, Shopify, HubSpot,
  Salesforce, Exact, AFAS, SAP, Odoo, Dynamics 365, Twinfield, Excel, plus Pipedrive as a
  text-pill fallback since no logo file exists on disk for it) used on `koppelingen.html` and
  the homepage's integrations wall — those are genuine, factual integration claims, not
  customer-logo social proof, and stay in full color/grayscale-on-hover per the logo-wall
  component, not as grey placeholder tiles.

## Quality bar
- Every page must work well on mobile (responsive layout, touch-friendly targets).
- Keep code simple, readable, and commented so future sessions can easily edit it — comments
  should explain *why*, not restate what the code obviously does.

## Folder structure
- `index.html` in the project root.
- All other marketing pages as `.html` files in the root (no subfolders per page), **except**
  `receptenboek/` — which as of v2 is no longer real content, see below.
- **Current real content pages, v2 (2026-08-18):** `index.html` (homepage), `workflows.html`
  (flagship page — absorbs the retired Receptenboek content as pill-tabbed recipe panels, see
  "Content & positioning"), `koppelingen.html`, `vertrouwen.html`, `over.html` ("About"),
  `zo-werkt-het.html` ("How it works"), `demo.html` (the "Plan een demo" destination,
  Calendly-embedded via the `[CALENDLY_URL]` placeholder), `ai-transparantie.html`, plus the
  existing `blog/` (generated by `build-blog.js`, chrome regenerated for v2, post prose
  untouched) and 6 legal pages (`privacyverklaring.html`, `algemene-voorwaarden.html`,
  `cookies.html`, `ai-transparantie.html` counts as one of the 6 per this file's own
  historical convention, `bedrijfsgegevens.html`, `subverwerkers.html` — legal *text*
  verbatim, shells restyled for v2). `test.html` is the v2 design-system styleguide (rebuilt
  Stage 0) and the canonical source for header/footer markup — not a real marketing page, but
  load-bearing for future dev work, don't delete it.
- **Redirect stubs, not real content:** `pricing.html`, `tarieven.html`,
  `power-bi-dashboards.html`, `trainingen.html`, `cases.html`, `agentic-ai.html`,
  `agents/email-triage.html`, `agents/phone-agent.html`, `contact.html` (added in the v1
  rebrand's Stage 7) **plus, new in v2's Stage 8:** `receptenboek.html` and all 5 files under
  `receptenboek/` (`agenda-samenvatting.html`, `call-agent.html`, `email-agent.html`,
  `offerte-opvolging.html`, `order-status.html`) — each now a minimal client-side redirect
  pointing at `/workflows` or `/workflows#<recipe-anchor>`. Every stub (15 total) follows one
  exact pattern: `<meta name="robots" content="noindex, follow">` + `<meta http-equiv=
  "refresh">` + `rel="canonical"` + a fallback `<a>` + `window.location.replace()` (not
  `.href`, to avoid back-button redirect loops) — see the HTML comment in each stub for its
  specific target and reasoning. **No stub may redirect to another stub** — v2's Stage 8 fixed
  three v1 stubs (`cases.html`, `agents/email-triage.html`, `agents/phone-agent.html`) that
  used to chain through `/receptenboek*` URLs, retargeting them straight at `/workflows`/
  `/workflows#<anchor>` once those became stubs too. These do **not** load `css/style.css` or
  `js/main.js` — no header/footer chrome, so they're excluded from the sitewide cache-bust
  `?v=` bump. Don't add new content to them; if a stub's old URL needs to become a real page
  again, that's new work, not a revival of the stub file.
- `docs/` — the entire documentation section lives here: `docs/index.html` is the overview page,
  every article is `docs/<slug>.html` with **no `docs-` filename prefix** (the folder itself is
  the namespace — e.g. `docs/agent-crm-sync.html`, not `docs/docs-agent-crm-sync.html`). Pages in
  here reference shared assets one level up (`../css/docs.css`, `../js/docs.js`,
  `../assets/favicon.png`, etc.) and link to each other with plain sibling filenames
  (`href="agent-crm-sync.html"`, no `docs/` or `docs-` prefix needed from inside the folder
  itself). The marketing footer's "Documentatie" link points to `docs/index.html`.
- `css/` — stylesheets (`style.css` for the marketing site, `docs.css` for the docs section —
  the two are never mixed on the same page).
- `js/` — vanilla JS (`main.js` marketing behavior; `docs-nav.js` + `docs.js` for the docs
  section — both live in the shared `js/` folder, not inside `docs/`, and are loaded by every
  docs page via `../js/...`; `broken-image-guard.js`, a small `<img>`-error fallback still
  referenced by every real marketing/legal/blog page — confirmed still live and doing real
  work as of v2's Stage 8, don't remove it without re-checking that).
- `assets/` — images/icons/logos/etc. `assets/logos/` holds the 12 real integration logos
  (see Branding above).
- `reference/` — research docs (content source, style sources, the dashboard CSS snapshot) —
  not part of the shipped site.
- **Deleted in v2's Stage 8** (confirmed orphaned via repo-wide grep before removal, don't
  recreate without a real reason): `css/hero-anim-trainingen.css` and
  `js/hero-anim-trainingen.js` (belonged only to `trainingen.html`, which has been a redirect
  stub since the v1 rebrand and never loaded either file), and the untracked `blog-preview/`
  folder (stray preview/test build artifacts, duplicates of real `blog/` posts plus template
  scratch files — never part of the shipped site).
