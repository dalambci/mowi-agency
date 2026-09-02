# SPEC v2 - mowi.agency site batch

Reconciled replacement for the vault's `RALPH_SITE_BATCH.md` (2026-08-20), whose factual premises are
stale. This file is the contract. Where this file and the vault note disagree, **this file wins**.

Re-read every iteration. The **mandatory six** are: **Guardrails** (section 3), **Lander page spec**
(section 4), **IT-partner sheet spec** (section 5), **Verification** (section 6), **Allowed-paths gate**
(section 7) and **Content sources** (section 9). Sections 7 and 9 are not optional detail: section 7 holds
the revert procedure and the commit rules that `LOOP_PROMPT.md` Step 5 only summarises in three lines, and
section 9 holds the entire truth order plus the Gap rule, without which a builder has no instruction on
where copy comes from.

Companions: `ralph/LOOP_PROMPT.md` (the loop mechanics), `ralph/TASKS.md` (the queue),
`ralph/PROGRESS.md` (the trail), `ralph/NEEDS_SAL.md` (the gap log), `ralph/REVIEW.md` (Sal's QA list),
`ralph/DECISIONS.md` (the binding decisions D1-D11 this file restates), `ralph/run.sh` (the loop runner and
its tool allowlist).

This spec's own prose deliberately contains **no em dashes**, so that nothing copy-pasted out of it can
smuggle one into a page. Use a comma, a colon, or a full stop. Every em dash in this file sits inside a
backtick-quoted rule string (the `" — Mowi"` title suffix, the `emdash` check's own pattern), where the
character is the rule.

---

## 1. Purpose and scope

Build 11 integration landing pages (`koppeling-<slug>.html`) and 11 matching print-friendly IT-partner
sheets (`downloads/it-partner-<slug>.html`), then one SEO cross-pass (T20) and one supervised wiring task
(T99). Every page is new, self-contained, and built from the existing design system without adding CSS or
JS. **Out of scope:** agent pages (D1: dropped, the 4 old ones were deleted 2026-08-11 as phantom products
and the real lineup lives on `/workflows`), any animation (all motion was removed in the 2026-08-18
rebuild-v2), pricing changes, PDF generation, deploys, nav mega-menu edits, and new `docs/` pages.

---

## 2. Reference re-pointing (v1 -> v2)

| # | v1 said | v2 truth |
|---|---|---|
| R1 | Structure reference: `/agents/email-triage` | **`test.html`** is the chrome canon (header lines 31-97, footer 112-184; its `<main>` is empty by design). Content-class vocabulary comes from `koppelingen.html` and `pricing.html`. |
| R2 | Tone reference: `/agentic-ai` | Now a redirect stub. Tone comes from `koppelingen.html` card copy, `workflows.html`, `pricing.html`, `security.html`, and the 4 live `docs/koppeling-*.html` pages. |
| R3 | Pricing reference: `/tarieven` | Now a redirect stub. Pricing truth is **`pricing.html`** only: Start gratis EUR 0 / 30 credits, Basis EUR 19/mnd / 300 credits, Pro EUR 79/mnd / 1.500 credits, and a demo-gated custom band with no price. Per-agent "vanaf" pricing is RETIRED. Landers should not restate prices at all; link to `/pricing` if price must be addressed. |
| R4 | Branch `main` | Branch is **`master`**. Working branch `ralph/site-batch` is already created and checked out. |
| R5 | Hero animation / scroll reveal | **No animation, ever.** Static hero only. No `@keyframes`, no transitions added, no `data-*` motion hooks, no new JS. |
| R6 | Trust block ("trust strip") | Removed sitewide 2026-08-06. Do not reintroduce it. Security reassurance, if needed at all, is one sentence linking to `/security`. |
| R7 | CTA counting: "one CTA per page" | Measured rule: **exactly 4 `btn-primary` in the file, exactly 1 inside `<main>`.** The other 3 are chrome (mobile nav, header actions, footer CTA). See D4 for the exact markup. |
| R8 | **EM DASHES: file-wide ban** | **WRONG and would fail every valid page.** Chrome alone puts ~7 em dashes in every file (HTML comments), and all page `<title>`s use the site convention `X — Mowi`. The real check: take the `<main>` slice, strip `<!-- ... -->` comments and `<script>` blocks, decode entities, then fail on the em dash character in what remains (attribute values included), in the meta description, or in any JSON-LD string. Decoding is what makes `&mdash;`, `&#8212;`, `&#08212;`, `&#x2014;` and `&#X02014;` one rule instead of five. The `<title>` separator is EXEMPT. Blog posts carry 10-25 real em dashes, and the 4 live `docs/koppeling-*.html` pages carry 6-12 each, because both predate the 2026-08-19 rule; neither is a precedent, and neither may be quoted verbatim into `<main>`. |
| R9 | **TITLE LENGTH: 50-60 chars** | Not grounded and too tight for Dutch. Real site titles run 14-35 chars (chrome pages) and 56-78 chars (blog posts, the SEO precedent, all ending `" — Mowi"`). Rule for new landers: **45-70 chars, must end with `" — Mowi"`.** Meta description **120-155** (blog precedent: 143/149/149). |
| R10 | Integration list incl. Salesforce / SnelStart / SAP / Dynamics 365 / Twinfield / Excel | Those 6 are **FORBIDDEN** as capability claims (deliberately removed 2026-08-21). D2 list is the 11 LIVE entries from `koppelingen.html#live`: Exact Online, Pipedrive, WooCommerce, Shopify, Lightspeed eCom, PrestaShop, Magento Open Source, HubSpot, Moneybird, Google Agenda, Calendly. Never promote a "Binnenkort" platform to a live claim. |
| R11 | Source note of 2026-08-04 as authority | Its deliverables were deleted 2026-08-11. It is a **fragment source only**, lowest priority (see section 9), usable for still-true details such as the Pipedrive personal API token path. Never cite it against live copy. |
| R12 | Cache-busting: hardcoded `?v=` strings | **Read `css/style.css?v=...` and `js/main.js?v=...` live from `index.html` at build time**, every iteration. They change under you. Never carry a value from memory or from a previous iteration. |
| R13 | Voice: "je/jij" acceptable in marketing copy | Dutch, formal **u**, always. No `je`, `jij`, `jouw`, `jullie` in visible prose. |
| R14 | Chrome: "reuse the shared partial" | There is **no partial**. Header and footer are duplicated per page. Copy them **verbatim from `test.html`** and delete nothing. Landers get **no `aria-current="page"` anywhere**, because they are not in the nav. |
| R15 | Sitemap: hand-edit `sitemap.xml` | `sitemap.xml` is **GENERATED** by `build-blog.js`. Never touch it. The 11 lander URLs go into the `staticPages` array in `buildSitemap()` (`build-blog.js`, near line 545), in T99 only. Sheets are noindex and never enter the sitemap. |
| R16 | Nav: add landers to the menu | **No.** The mega-menu is duplicated in every page's header; one entry means editing 20+ pre-existing files. Discovery is via `koppelingen.html` cards (T99) plus the sitemap. |

### Binding slug table

| Pakket (exact display name) | slug | lander | sheet |
|---|---|---|---|
| Exact Online | `exact-online` | `koppeling-exact-online.html` | `downloads/it-partner-exact-online.html` |
| Pipedrive | `pipedrive` | `koppeling-pipedrive.html` | `downloads/it-partner-pipedrive.html` |
| WooCommerce | `woocommerce` | `koppeling-woocommerce.html` | `downloads/it-partner-woocommerce.html` |
| Shopify | `shopify` | `koppeling-shopify.html` | `downloads/it-partner-shopify.html` |
| Lightspeed eCom | `lightspeed-ecom` | `koppeling-lightspeed-ecom.html` | `downloads/it-partner-lightspeed-ecom.html` |
| PrestaShop | `prestashop` | `koppeling-prestashop.html` | `downloads/it-partner-prestashop.html` |
| Magento Open Source | `magento` | `koppeling-magento.html` | `downloads/it-partner-magento.html` |
| HubSpot | `hubspot` | `koppeling-hubspot.html` | `downloads/it-partner-hubspot.html` |
| Moneybird | `moneybird` | `koppeling-moneybird.html` | `downloads/it-partner-moneybird.html` |
| Google Agenda | `google-agenda` | `koppeling-google-agenda.html` | `downloads/it-partner-google-agenda.html` |
| Calendly | `calendly` | `koppeling-calendly.html` | `downloads/it-partner-calendly.html` |

The display name is copied byte-for-byte from the `integration-card-name` span in `koppelingen.html`.
The lander lives at the repo **root**, not in a folder. Canonical URL is extensionless (D3).

---

## 3. Guardrails (the NEVER list)

- **Never edit a file that existed before this branch.** The test is mechanical: if `git log master -- <path>`
  returns anything, the file is off limits. This explicitly covers `css/*`, `js/*` (`docs-nav.js` above all),
  `build-blog.js`, `test.html`, `serve.js`, `sitemap.xml`, `CLAUDE.md`, `.claude/*`, `package.json`,
  `generate-it-sheets.js`, and every existing page, docs page, and redirect stub. Two carve-outs, both
  already spent: T99 (supervised, and only for the two files it names) and the one branch-setup `.gitignore`
  hunk that ignores `.claude/ralph-loop.local.md` and `ralph/logs/`. No green iteration ever edits
  `.gitignore`, **and no iteration ever reverts it either**: if `git status` shows ` M .gitignore`, that is
  sanctioned branch-setup state, not dirt. See section 7.
- Never `git add -A`. Never `git add .`. Commit by explicit path only.
- **The allowed-paths gate (section 7) is absolute.** A page that only passes verification because a
  forbidden file was edited is a failed attempt, not a pass.
- Never `git push`. Never `ssh`, `scp`, `rsync`, `curl` at a host, or anything pointed at Cloudways or the
  droplet. `.claude/settings.local.json` allowlists `Bash(ssh *)`; the loop must never use it.
- Never run `build-blog.js` or `generate-it-sheets.js` outside T99.
- Never add JS or a new asset **on a lander**, and never edit the shared stylesheet. A lander carries
  exactly **one** `<style>` block: the block below, copied verbatim into every lander, placed last in
  `<head>`. Do not extend it, do not write a second one, do not use a `style=` attribute. Rationale in
  D15/D16. Note the comment says "the shared stylesheet" and never spells the filename: the `cachebust`
  check counts every occurrence of that filename in the file, so naming it in a comment fails the page.

    <style>
      /* Page-scoped lander styles (D15/D16). Nothing here touches the shared stylesheet,
         so no other page moves and no sitewide cache-bust bump is needed.
  
         1. Section rhythm. The shared .section is 5rem 0, so two stacked sections
            put 10rem between blocks. Too airy for a short lander (Sal, 2026-09-02).
         2. The koppeling preview. A monochrome port of the dashboard Start page's
            own .dp-card mock (resources/views/components/discover-preview.blade.php)
            so the site shows the same picture the product does. Abstract on purpose:
            real labels only where they carry meaning, masked values and grey bars
            everywhere else. Inventing a customer name or an amount would put fake
            data on a page the client reads before any of it is true. Colour is
            swapped for the site's monochrome tokens: the chip is a black fill,
            never a green one. */
      main .section { padding: 3rem 0; }
      main .section#lander-hero { padding-top: 4rem; }
      @media (max-width: 48rem) { main .section { padding: 2.25rem 0; } }
  
      .lp-hero-logo { display: block; margin-bottom: 1.25rem; }
  
      .dp-window {
        height: 190px; max-width: 21rem; margin: 2.25rem auto 0;
        overflow: hidden; display: flex; justify-content: center;
        align-items: flex-start; padding-top: 20px;
        background: var(--muted); border: 1px solid var(--border);
        border-radius: var(--radius-card);
      }
      .dp-card {
        width: 82%; max-width: 250px; flex-shrink: 0; text-align: left;
        background: var(--surface); border: 1px solid var(--border);
        border-radius: var(--radius-card); padding: 12px;
      }
      .dp-head { font-size: 10.5px; color: var(--ink-3); line-height: 1.4; }
      .dp-title { font-size: 13px; font-weight: 700; color: var(--ink); line-height: 1.4; }
      .dp-amount { font-size: 11px; color: var(--ink-3); margin-bottom: 10px; }
      .dp-row {
        display: flex; align-items: center; gap: 8px; margin-top: 6px;
        border: 1px solid var(--border); border-radius: 6px; padding: 7px 8px;
      }
      .dp-avatar { width: 18px; height: 18px; border-radius: 5px; background: var(--muted); flex-shrink: 0; }
      .dp-bars { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
      .dp-bar { height: 5px; border-radius: var(--radius-pill); background: var(--band); }
      .dp-bar.short { width: 48%; }
      .dp-chip {
        font-size: 9.5px; font-weight: 600; white-space: nowrap; padding: 2px 6px;
        border-radius: var(--radius-pill); background: var(--ink); color: var(--bg);
      }
    </style>

  Anything the block does not cover is a `NEEDS_SAL.md` entry, not a bigger block. (Sheets are a
  separate, deliberate exception, see section 5.)
- **The platform logo, once per lander.** In the hero, directly above the `<h1>`:
  `<img src="assets/logos/<file>" alt="" class="integration-card-logo lp-hero-logo" />`. Take the exact
  filename from that platform card in `koppelingen.html` (they are not all `.svg`; Exact, HubSpot and
  AFAS are `.png`). `alt=""` because the `<h1>` beside it already names the platform. Every one of these
  files already ships live on `koppelingen.html`, so this adds no asset and no new trademark exposure.
- **One preview per lander**, the `.dp-window` markup, placed after the prose in "Wat de koppeling doet".
  Fill it with what that koppeling actually produces for the client, and mask every value that would
  otherwise be invented: `&bull;` runs for an address or an amount, grey bars for the rest, real words
  only in the head, the chip and the caption. A plausible-looking customer name, shop name or euro
  amount is fake data on a page the client reads before any of it is true. Give the wrapper
  `role="img"` and an `aria-label` describing what is shown.
- **A step is an action the client performs.** An alternative route to the same screen, or a
  confirmation that it worked, is not a step: fold it into the body of the step before it. Pipedrive
  went 5 steps to 4 this way, Exact Online 3 to 2 (Sal, 2026-09-02: "make it look very easy and quick
  to do, which it is"). Never drop an instruction to hit a lower number, and never merge two genuinely
  separate actions.
- **Fewest words that still carry the meaning.** Cut throat-clearing openers ("De koppeling staat nooit
  op zichzelf"), restatements of the platform name the reader just read in the `<h1>`, and any sentence
  that only sets up the next one. Keep every qualifier that changes what is true: "alleen lezend", the
  NL-only limitation, who owns a token. Shorter, never vaguer.
- Never an em dash **anywhere inside `<main>`, attribute values included** (`alt`, `aria-label`, `title`,
  an `href`), nor in the meta description, nor in any JSON-LD string. Every spelling is the same hit,
  because the check decodes entities before looking: `—`, `&mdash;`, `&#8212;`, `&#08212;`, `&#x2014;`,
  `&#X02014;`. Use a comma, a colon, or a full stop. The `<title>`'s `" — Mowi"` separator is the only
  exempt em dash on the page, and only there.
- Never `je` / `jij` / `jouw` / `jullie`. Dutch, formal **u**.
- Never invent a capability claim, a price, a credit figure, or a dashboard click-path.
- Never name Salesforce, SnelStart, SAP, Dynamics 365, Twinfield or Excel as something Mowi koppelt.
- Never link to `/agents/*` or to a deleted agent page. They are redirect stubs.
- Never add an accent color, a gradient, or a second typeface. Monochrome design system.
- Never output the run's promise string except as the single final line of a finished run.

---

## 4. Lander page spec

**Superseded by D17 (2026-09-02) — this section describes the CURRENT template.** The 7-section,
label-heading version this replaced is preserved only in git history (see `koppeling-exact-online.html`
before commit `5e3b2bc` if you need it); do not resurrect it. `koppeling-exact-online.html` as it stands
right now is the reference implementation — when this text and the live file ever disagree, read the
file, then fix this text.

`koppeling-<slug>.html` at repo root. Full standard page: `<head>` block copied from
`koppelingen.html`'s shape, chrome copied verbatim from `test.html`, content between them.

### Head

- `<title>` 45-70 chars, ending `" — Mowi"`. Built around the real search terms Sal supplies for this
  platform (see "Finding the question" below), not a fixed pattern — `exact_online`'s is "Exact Online
  koppeling met AI: wat kunt u automatiseren? — Mowi" (63 chars). Length measured on decoded text with
  whitespace collapsed to one space.
- `<meta name="description">` 120-155 chars, no em dash, formal u. Compresses the hero's direct answer;
  should read as useful even unclicked (AI Search Blog Method rule 2, applied to the meta description
  the way the method applies it to a post's own opening).
- `<link rel="canonical" href="https://mowi.agency/koppeling-<slug>" />` (extensionless, no `.html`).
- `css/style.css?v=...` and `js/main.js?v=...` values read live from `index.html` this iteration.
- Same font preconnects, favicon set, and Plausible script as `koppelingen.html`. Nothing else.
- The FAQPage JSON-LD block goes in `<head>`, after the Plausible script, so `<main>` stays script-free.

### Finding the question (do this before writing anything)

Every lander is built around one real search, not an assumed one:

1. Check `ralph/NEEDS_SAL.md` and `ralph/DECISIONS.md` for keyword numbers Sal has already supplied for
   this platform (D17 recorded three: "exact online ai" 30/mo, "koppelingen exact online" 50/mo,
   "pipedrive exact online" 10/mo). Use them as given — never invent a search-volume number.
2. If none exist for this platform, use the pattern proven on Exact Online: `<h1>` = "Wat kunt u met AI
   automatiseren in <Pakket>?", phrased as a person would say it out loud, and log in `NEEDS_SAL.md`
   (category `missing fact`) that real keyword numbers for this platform would sharpen the title —
   Sal can supply them later without a rebuild.
3. A cross-platform search Sal supplies (e.g. "pipedrive exact online") becomes its own `<h2>`
   sub-question on the relevant page(s), answered honestly per the Gap rule — see the `<main>` spec
   below. Never bend the honest answer to make a keyword's implied intent true.

### `<main>` — the question-first template

Section 1 (hero) is `<section class="hero container lp-hero hero-tight-bottom" id="lander-hero">` —
the site's own landing-page hero, the same class set `e-mail-agent.html` and `call-agent.html` use.
Every section after it is `<section class="section"><div class="container">...</div></section>` using
`.lp-section-heading` inside a `.section-head-row.section-head-row-center` (heading + one-line
`.section-sub`), matching how `e-mail-agent.html` structures its own body sections. No fixed section
count: build what the platform's real config and the sub-questions in scope actually support. Every
page still needs, in order:

1. **Hero.** Breadcrumb first, exact markup from the old spec unchanged:
   ```html
   <p class="blog-breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/koppelingen">Koppelingen</a> &rsaquo; Exact Online</p>
   ```
   Then the platform logo (`<img src="assets/logos/<file>" alt="" class="integration-card-logo lp-hero-logo" />`
   — exact filename from that platform's card on `koppelingen.html`; not all are `.svg`, Exact/HubSpot/AFAS
   are `.png`), then the `<h1>` (the question, `class="h-balance"`, wrap an `<span class="h-nowrap">`
   around the last 2-3 words the way "Exact Online?" is wrapped), then the direct-answer `.hero-sub`
   (50-70 words, every claim traceable per the Gap rule), then the **page's one primary CTA**:
   ```html
   <div class="hero-actions lp-cta-block">
     <a href="https://my.mowi.agency/aanmelden" class="btn-primary" data-event="Signup Click">Start gratis</a>
     <span class="lp-cta-micro">Geen betaalgegevens nodig.</span>
   </div>
   ```
   Then the **hero preview** (see Previews below) as the hero visual.
   **There is no separate closing-CTA section anywhere else on the page** — see CTA count below.
2. **What Mowi reads / what the koppeling does**, as a sub-question `<h2>` with icon cards
   (`.lp-card-grid` of `.lp-card`, each with an `.lp-card-icon` SVG — reuse the four already built on
   `koppeling-exact-online.html`, or a close visual match, never a bare `.lp-card` with no icon here).
   Grounded exactly as the old spec required: `integration-card-desc` from `koppelingen.html` plus the
   platform's `instructions[]` / gateway role in `config/shop_platforms.php`. Say read-only where
   read-only is true. No throughput, accuracy, or time-saved numbers.
3. **Which agents/workflows use this koppeling**, as a sub-question `<h2>`, laid out as a `.split`
   (`.lp-link-stack` of `<a class="lp-card">` cards on one side) with the **side preview** on the other
   where the platform supports a second distinct moment (see Previews). Link targets are the real pages
   now, not nav fragments: `/e-mail-agent`, `/call-agent`, and a `/workflows#<fragment>` only for a
   dashboard view that genuinely has one (e.g. `/workflows#dashboard-openstaande-facturen`). **Never link
   to `/agents/*`; those pages do not exist.**
4. **How you connect**, as a sub-question `<h2>` ("Hoe koppelt u <Pakket> aan Mowi?"), `.lp-steps` with
   **3 to 5 steps: one per entry in the platform's `instructions[]` where that array exists, in the same
   order, nothing dropped, nothing added** (unchanged from the old spec — this rule was never the
   problem). Ground every click-path read-only against `config/shop_platforms.php` (`instructions[]`,
   `auth`, `fields[]`), then the surrounding Blade views for context. Never invent a click-path; if
   unverifiable, write the generic fallback and log the gap. The **tile preview** (see Previews) goes
   directly under the steps, every time.
5. **What your IT-partner needs**, as a sub-question `<h2>` ("Wat heeft uw IT-partner of accountant
   nodig?"), rendered as an `.lp-trust-note` box (not a bare paragraph) containing the explanation plus
   `<a class="link-arrow lp-note-link" href="/downloads/it-partner-<slug>.html">Open het A4 voor uw
   IT-partner</a>`. Keep the `.html` — the sheet is a file, not an extensionless route. No CTA button.
6. **A cross-platform sub-question, only if the honest answer is itself worth reading.** Sal supplies
   the keyword (see "Finding the question" above), but a section built from it earns its place only when
   the true answer gives the reader something — a real capability, a real distinction, a real next step.
   **A section whose entire content is "no, Mowi doesn't do that" is not good content and must not be
   published**, even when real search volume backs the keyword (found live, 2026-09-02: "pipedrive exact
   online" 10/mo prompted exactly this, cut from `koppeling-exact-online.html` — see D18). Log the
   keyword and the gap it points at in `NEEDS_SAL.md` as `wanted-but-out-of-scope` instead: a feature
   that doesn't exist is a product decision for Sal, and the content only becomes worth publishing once
   the answer can be a real "yes" or a real "here's what to do instead." Skip the section entirely on any
   platform with no cross-platform keyword.
7. **FAQ**, 3 to 5 questions, unchanged from the old spec: visible `<h3>`/`<p>` pairs inside `<main>`
   (an `.lp-card-grid` of plain `.lp-card`s, no icon needed here) plus a `<script type="application/
   ld+json">` FAQPage block in `<head>` whose `name`/`acceptedAnswer.text` match the visible text
   exactly (same apostrophe, same everything, after entity-decode and whitespace-collapse). Every FAQ
   string is scanned for em dashes and forbidden vendor names exactly like visible copy. Good sources:
   the "Problemen oplossen" headings on the docs pages.

**No standalone closing-CTA section, no praktijkvoorbeeld/non-commodity section, no author box, no
Bronnen list, no comparison table unless a real one exists to show** — see D17 for why each is
deliberately absent from a lander even though some are Blog Method conventions.

### CTA count (D17 redistributes D4's total, does not change it)

**Exactly 1** `btn-primary` inside `<main>` — in the hero, nowhere else. File total is still **4**: that
1, plus 2 in the header chrome (desktop + mobile), plus 1 in the footer band that sits directly under
`</main>` on every page (which is why section 8 of the old spec — a second closing CTA — is gone: the
footer band already is one, one scroll below).

### Previews — the `.dp-card` mock, D16's honesty rule unchanged

Up to three per page, each the same monochrome port of the dashboard Start page's `.dp-card` mock
(`resources/views/components/discover-preview.blade.php`) in a different frame — never a fourth kind,
never forced to hit a round number:

- **`.dp-window.dp-window-hero`** (full container width, in the hero) — the single clearest thing this
  koppeling produces.
- **`.dp-window.dp-window-side`** (beside the agent/workflow link stack in section 3's `.split`) — a
  second, genuinely different product moment. Omit this window entirely on a platform where there is
  only one real thing to show; do not duplicate the hero preview into a second frame.
- **`.dp-window.dp-window-tile`** (under section 4's steps) — the koppeling's own post-connect tile:
  platform logo, name, a `Verbonden` chip, one line of what it can now see. Build this one every time.

Same honesty rule as always: real words only where they carry meaning (a head, a chip, a caption),
`&bull;` runs and grey `.dp-bar` bars for anything that would otherwise be an invented name or amount.
Copy the exact `.dp-*` CSS block from `koppeling-exact-online.html`'s `<style>` rather than re-deriving
it — the class names and values are the shared vocabulary these previews all speak.

### Page-scoped `<style>` — one block, and only these things belong in it

Same D15 rule: exactly one `<style>` block, last in `<head>`, never a `style=` attribute anywhere, never
edit the shared stylesheet. Its comment must never spell the stylesheet's filename (breaks the
`cachebust` check, which counts every occurrence) and must never contain the literal string `<main`
(breaks the `structure` check). It holds exactly two things now — not the old full section-rhythm
override, which is gone because the shared `.hero`/`.lp-*` classes already carry the right spacing:
1. The `.dp-*` preview rules (copy from `koppeling-exact-online.html` verbatim).
2. `@media (max-width: 48rem) { main .split { grid-template-columns: 1fr; gap: 2rem; } }` — the one real
   gap-fill, because the shared stylesheet defines no mobile fallback for `.split` at all. If a lander
   doesn't use `.split` (no side preview), this rule isn't needed either.
Anything beyond those two is a new-CSS violation. A lander that seems to need more is a `NEEDS_SAL.md`
entry, not a bigger block.

### Logo colour

Platform logos render in their own brand color (Exact Online's red, as already shipped uncontested on
`koppelingen.html`). This is a third-party trademark mark, not Mowi's own UI — the site's monochrome
rule (CLAUDE.md) was never about vendor logos. See S-009 for the one open item: Sal has not yet
explicitly confirmed this reading; if he says otherwise, greyscale every logo with the same CSS filter
the marquee already uses (`filter: grayscale(1); opacity: 0.7`) and log which pages need the fix.

### Copy — merge and cut, same rule as D16, still in force

A step is an action the client performs; an alternative route or a success confirmation folds into the
step before it. Fewest words that keep the meaning; cut openers and restatements, keep every qualifier
that changes what's true (alleen lezend, an NL-only limit, who owns a token).

---

## 5. IT-partner sheet spec

`downloads/it-partner-<slug>.html`. A standalone, print-friendly A4 HTML page, **deliberately outside the
design system**: no shared chrome, no `site-header`, no `footer-wrap`, no `btn-primary`, no `css/style.css`,
no `js/main.js`, no canonical link, no breadcrumb. It is a document to print or forward, not a web page in
the site's navigation.

Even so, a sheet is still a real HTML document and `verify.mjs` still checks it. The non-obvious
requirements, all of which a "it is just a print-out" mental model gets wrong:

- `<html lang="nl">`, exactly one `<main>` element, and exactly one `<h1>`. Wrap the sheet body in `<main>`.
- `<meta name="description">` present and **120-155 characters**, same as a lander. Describe the sheet.
- `<meta name="robots" content="noindex, nofollow" />` is mandatory, and there must be **no**
  `<link rel="canonical">` anywhere in the file.
- **Zero** `btn-primary` in the file.
- One page-scoped `<style>` block in the file. Start from the proven sheet CSS in `generate-it-sheets.js`
  (`@page { size: A4; margin: 22mm 20mm; }`, Plus Jakarta Sans with a real system fallback stack, monochrome).
  Read that file for the recipe; **never run it**.
- The only external resource allowed is the same Google Fonts stylesheet the site already uses. No
  `css/style.css`, no `js/main.js`, no Plausible.
- Title is plain and descriptive and must contain `Mowi`, e.g.
  `<Pakket>-koppeling voor Mowi: instructies voor uw IT-partner`. The 45-70 / `" — Mowi"` title rule does
  NOT apply to sheets; they are noindex.
- Em-dash, formal-u, forbidden-platform and no-invented-claims rules all still apply.
- Build the sheet **before** the lander in the same task: the lander's `sheet-link` check requires the sheet
  file to already exist on disk.

### Content

Written to the IT-partner or accountant, not to the client. In order: what is being asked and why (2-3
sentences), which access / API key / app connector must be created, exactly where in `<Pakket>`, what
permissions are needed (least privilege, say read-only where true), what to send back and how (a secure
channel, never plain-text email; the Pipedrive docs page's copyable request block is the model), and a
short "vragen?" line pointing at `contact@mowi.agency`.

**First check whether there is anything to ask for at all.** That content order fits a `static` platform,
where a real credential is created and handed over. On an `oauth` platform whose entry has
`fields => []` and a Mowi-owned `client_id_key` / `client_secret_key` (Exact Online is exactly this), the
truthful answer to "which key, where, what permissions" is **none**: the client clicks "Koppel met
`<Pakket>`" and logs in with their own account, and no credential ever leaves their organisation. Say that
plainly, keep the sheet short, and describe what the IT-partner or accountant is actually being asked for,
which is usually only to be the person who authorises with the right account and administration. **Do not
reach for the App Center / "deel de inloggegevens met Mowi" story from the 2026-08-04 PDFs**: tier 2 (the
dashboard config) now contradicts it, and tier 2 wins. Those PDFs also cite
`docs.mowi.agency/koppeling-exact-online`, a host and page that do not exist; never put that URL on a page.

### Grounding sources, in priority order

1. `C:/Users/SalP1/Desktop/Mowi Dashboard/config/shop_platforms.php` - the platform's `instructions[]`,
   `auth`, and `fields[]`. Authoritative for what credential the dashboard actually asks for.
2. `docs/koppeling-<slug>.html` where it exists (only `pipedrive`, `shopify`, `woocommerce`,
   `google-agenda`), specifically its "Voor uw IT-partner" copyable block.
3. The 4 orphaned PDFs in `downloads/` (2026-08-04) as **raw material only**, and only
   `it-partner-exact-online.pdf` and `it-partner-pipedrive.pdf`. `it-partner-afas.pdf` and
   `it-partner-snelstart.pdf` are out of scope: AFAS is "Binnenkort", SnelStart is forbidden by D2.
4. The 2026-08-04 vault note, still-true fragments only.
5. The vendor's own public documentation, when it settles a factual detail the above leave open. Cite it in
   the `PROGRESS.md` entry so Sal can check it.

### Fallback

Where the steps are not verifiable from the sources above, do not guess. Write the conservative line
verbatim and log a `NEEDS_SAL.md` entry:

> Mowi volgt dit direct met u op.

**No PDF generation in this batch.** The sheets ship as HTML. Never invoke Playwright, never run
`generate-it-sheets.js`, never write a `.pdf`.

---

## 6. Verification

The mechanical gate, run from the repo root:

```
node ralph/verify.mjs <built files>
node ralph/verify.mjs --dom <built files>
```

Both must exit 0. Maximum 3 fix rounds per task; still red after 3 means `[blocked]` in `TASKS.md` plus a
`NEEDS_SAL.md` entry. Build the **sheet before the lander**, or at least both before verifying: check 16
requires the lander's `it-partner-` href to resolve on disk.

`verify.mjs` picks the page kind from the filename: `koppeling-*.html` is a **lander (L)**,
`it-partner-*.html` is a **sheet (S)**, anything else is a generic **page (P)**. Name the file exactly as the
slug table says: a lander named anything but `koppeling-<slug>.html` silently downgrades to a generic page
and **skips** `breadcrumb`, `cta-attrs`, `sheet-link` and the whole FAQ half of `jsonld`. The summary line
prints a skip count so that downgrade is visible: a lander should show **0 skips**, a sheet 4, a page 3.

Two rules run underneath all 18 gates:

- **Comments do not count as content.** Every gate except `structure` reads the file with `<!-- ... -->`
  removed, so a commented-out `<h1>`, canonical, CTA, breadcrumb, ld+json block, description or sheet link
  never satisfies its check. `structure` deliberately reads raw source, because comment-stripping would hide
  the truncated block it exists to catch.
- **Class names are matched as whole tokens.** `btn-primary-lander`, `not-btn-primary` and
  `xx-btn-primary` are not `btn-primary`; they are classes that do not exist in `css/`. Stacked modifiers
  are fine and expected in either order (`btn-primary page-cta`).

The 18 gates, by their real check ids:

1. `structure` (L,S,P) - `div` / `section` / `main` / `a` open and close counts match, and exactly one `<main`. Catches a truncated or double-pasted block. The only gate that reads raw source, comments included.
2. `lang` (L,S,P) - `<html lang="nl">`.
3. `h1` (L,S,P) - exactly one `<h1>` in the file, counted case-insensitively (`<H1>` is the same element). **Sheets included**, so a sheet needs one too.
4. `title` (L,S,P) - 45-70 chars and ends with `" — Mowi"`, measured on the decoded text with whitespace collapsed. Sheets (S) only need `Mowi` somewhere in the title, no length rule.
5. `description` (L,S,P) - `<meta name="description">` present and **120-155 chars. Sheets included**, so a sheet needs a real description too. The tag is parsed attribute-aware, so a `>` inside the content (`... naar Instellingen > API ...`) is read correctly and not reported as a missing tag.
6. `canonical` (L,S,P) - exactly `https://mowi.agency/koppeling-<slug>`, derived from the filename. Sheets (S) must carry **no canonical at all** plus a `<meta name="robots">` containing `noindex`.
7. `breadcrumb` (L) - the **whole** canon shape inside `<main>`: `<p class="blog-breadcrumb">`, the `Home` crumb, `&rsaquo;`, a parent-crumb anchor, `&rsaquo;`, and non-empty bare text for the current page. Extra classes alongside `blog-breadcrumb` are allowed; a breadcrumb truncated after `Home &rsaquo;` is a FAIL.
8. `jsonld` (L,S,P) - every `ld+json` block parses. On a lander additionally: exactly one `FAQPage` node, 3-5 `mainEntity` entries, each `name` found verbatim in the visible **`<main>`** text and each with a non-empty `acceptedAnswer.text`.
9. `cta` (L,S,P) - exactly 1 `btn-primary` inside `<main>`, and in the file exactly (chrome CTAs + 1). The chrome contribution is counted from `test.html` rather than hardcoded; today it is **3**, so the file total is **4**. Sheets (S) must have **0**, in file and in main.
10. `cta-attrs` (L) - every `btn-primary` anchor in `<main>` carries `href="https://my.mowi.agency/aanmelden"` and `data-event="Signup Click"`.
11. `links` (L,S,P) - every internal `href` **and `src`** resolves on disk, in either quoting style, using the server's own rules (fragments and queries stripped, `/` and trailing-slash to `index.html`, extensionless to `.html`). Off-host URLs are skipped. `src` is in scope because landers carry vendor logos and a missing local image is otherwise invisible to both passes.
12. `chrome` (L,P) - the `<header class="site-header">` and `<footer class="footer-wrap">` blocks, byte-identical to `test.html` after whitespace collapse and after stripping `aria-current="page"`. Anchored on those classes and nesting-aware, so a page's own `<header>`/`<footer>` element inside `<main>` neither breaks the comparison nor gets compared. Not run on sheets.
13. `cachebust` (L,S,P) - **every** `style.css?v=` and `main.js?v=` occurrence in the page equals the one read live from `index.html` this run, not merely "the right string appears somewhere". A correct link followed by a stale second copy is a FAIL. A sheet references neither, so it passes trivially.
14. `emdash` (L,S,P) - no em dash in the `<main>` slice (after comments and `<script>` blocks are stripped, **attribute values included**), in the meta description, or in any JSON-LD string. Detection is on the decoded character, so `—`, `&mdash;`, `&#8212;`, `&#08212;`, `&#x2014;` and `&#X02014;` are all the same hit. The `<title>` is never scanned.
15. `vendors` (L,S,P) - none of Salesforce, SnelStart, SAP, Dynamics 365, Twinfield, Excel in `<main>`, the `<title>`, the meta description, or any JSON-LD string. Matched case-insensitively so `Snelstart` and `EXCEL` are caught, except `SAP`, which stays case-sensitive because lowercase `sap` is an ordinary Dutch word. `\b` boundaries, so `excelleren` is safe.
16. `sheet-link` (L) - at least one `href` containing `it-partner-` that resolves to a real file on disk.
17. `uform` (L,S,P) - no `je` / `jij` / `jouw` / `jullie` in visible `<main>` text, matched case-insensitively so a sentence-initial `Je`/`Jij`/`Jouw` is caught. **WARN, not FAIL**, so it never deadlocks the loop; treat every warning as a real defect to fix anyway.
18. `--dom` (L,S,P) - loads the file in headless Chromium and re-asserts `h1 === 1`, a `<main>` in the parsed DOM, in-browser `ld+json` parsing, and zero console errors. Off-host subresource loads blocked by `file://` (fonts, Plausible) are ignored; a failed load whose own URL is `file://` is a genuinely missing local asset and FAILs. Degrades to WARN if Playwright or its Chromium binary is unavailable.

**What `verify.mjs` cannot check.** Green is necessary, not sufficient. Unchecked: the `<h1>` pattern
`Automatiseren in <Pakket>.`, the 7-section set and its order, the `.page-hero-heading` / `.page-heading` /
`.page-body` class usage, the `<title>` pattern, which page the parent breadcrumb crumb points at, "no CSS
or JS added on a lander", a sheet wrongly linking `css/style.css`, whether FAQ answers stay inside what live
copy supports, and whether a link to `/agents/*` slipped in (both stubs still exist on disk, so such a link
resolves and passes `links`). Those are Sal's review, or your own discipline.

**Visual QA is Sal's job, not the loop's.** The loop never takes screenshots, never judges spacing, never
starts `serve.js`. It adds the page to `ralph/REVIEW.md` and moves on.

---

## 7. Allowed-paths gate

The v1 spec's `git diff --name-only main...HEAD` is wrong twice over: the base is `master`, not `main`, and
a branch-range diff accumulates every prior iteration's files, so it flags work that was already approved.

**Per-iteration gate.** Every iteration ends with a commit, so `git status --porcelain` shows this
iteration's work and nothing else. That is the gate:

```
git status --porcelain
```

Allowed set = **the current task's listed `allowed:` paths from `TASKS.md`** UNION **`ralph/**`** UNION the
one sanctioned pre-existing entry below. Nothing else, in any status code (`??`, ` M`, `A `, ` D` alike).

**The one sanctioned pre-existing entry: ` M .gitignore`.** It is branch-setup state, made once by hand
before the loop started, and it carries the ignore rules for `.claude/ralph-loop.local.md` and for
`ralph/logs/`, which is where `ralph/run.sh` writes every transcript. If the setup commit has not been made
yet, this line is present from iteration 1. **Never revert it, never re-edit it, never log it as an
incident.** Reverting it would delete a rule `run.sh` depends on, with no sanctioned path to restore it.

On a violation:

1. Revert it. Tracked: `git checkout -- <path>`. Untracked: `git clean -f -- <path>`, naming the exact path.
   **Never `git clean -fd`, and never `git clean -f` without a pathspec**: at the repo root that would
   delete the whole untracked `ralph/` directory, `verify.mjs` included. There is no `rm` in the loop's tool
   allowlist, and there does not need to be.
2. Log it in `ralph/NEEDS_SAL.md` under category `guardrail incident`, naming the path and what was written.
3. **Re-run `node ralph/verify.mjs`** on the task's files. If the page only passed because of the file just
   reverted, the attempt **failed** and counts toward the 3-attempt cap.

Commit by explicit path only:

```
git add koppeling-<slug>.html downloads/it-partner-<slug>.html ralph/
git commit -m "ralph: T0N <slug>"
```

Never `git add -A`, never `git add .`, never `git commit -a`.

**End-of-run audit.** After the last task:

```
git diff --name-only master...HEAD
```

Every listed path must be either a `koppeling-*.html` at root, a `downloads/it-partner-*.html`, or inside
`ralph/`. Nothing else, with the T99 exception of `koppelingen.html`, `build-blog.js` and the regenerated
`sitemap.xml`. Exactly **one** other file is sanctioned in this diff: `.gitignore`, and only the **6** added
lines of the branch-setup hunk, which ignore `.claude/ralph-loop.local.md` and `ralph/logs/` (two comment
lines, two paths, two blank separator lines). That edit is made once, by hand, before the loop starts, and
is never touched again. Any other `.gitignore` hunk is a violation.

---

## 8. T99 supervised wiring

Runs **once, with Sal present**, after every lander and sheet is built and reviewed. Never inside a green
iteration. Steps:

1. **`koppelingen.html` card links.** Wrap each of the 11 live `integration-card` blocks in
   `#live` so the card links to its lander (`href="/koppeling-<slug>"`, extensionless). This is the only
   structural edit to a pre-existing page in the whole batch. Keep the existing markup and classes intact;
   do not touch the `#binnenkort` section, and do not add a lander link to any planned platform.
2. **Sitemap.** Add the 11 `koppeling-<slug>` entries to the `staticPages` array in `buildSitemap()` in
   `build-blog.js` (near line 545), in the same bare-slug form as the existing entries. `downloads/` stays
   out: sheets are noindex.
3. **One regeneration run.** `node build-blog.js`, once. Then `git diff sitemap.xml` and read it before
   committing: it must show exactly the 11 new `<loc>` lines plus the expected `lastmod` date churn.
   Anything else means the run touched more than intended and gets reverted.
4. **Optional inbound links.** Only if Sal asks in the session: a line on `workflows.html`, or a "Volgende
   stappen" link on the 4 live `docs/koppeling-*.html` pages pointing at the matching lander. Optional means
   optional; skipping this is a valid outcome.
5. **No nav mega-menu entries.** The menu is duplicated in every page's header, so one entry means editing
   20+ pre-existing files, which is exactly what the guardrails forbid and exactly the kind of drift that
   makes 20 headers disagree. Discovery is the `koppelingen.html` cards plus the sitemap. This is a
   decision, not an oversight.
6. **Post-deploy, Sal's job.** Sal verifies the extensionless URLs resolve on Cloudways (the `try_files`
   fallback must serve `koppeling-<slug>.html` for `/koppeling-<slug>`) and purges Varnish. The loop never
   deploys and never checks a live URL.

---

## 9. Content sources

Truth order. A claim that cannot be traced to a higher tier than the one you are writing from is a gap.

1. **Live site copy** (highest authority):
   - `C:/Users/SalP1/Desktop/mowi.agency/koppelingen.html` (card names and descriptions, live vs planned)
   - `C:/Users/SalP1/Desktop/mowi.agency/workflows.html` - **nav fragment names only.** Its `<main>` is
     empty (three lines, one comment) and it carries none of the `#email-agent` / `#call-agent` /
     `#order-status` / `#offerte-opvolging` / `#agenda-samenvatting` / `#crm-sync` anchors. It is not a
     source of copy, and it cannot ground a capability claim.
   - `C:/Users/SalP1/Desktop/mowi.agency/pricing.html` (the only pricing truth)
   - `C:/Users/SalP1/Desktop/mowi.agency/security.html`
   - `C:/Users/SalP1/Desktop/mowi.agency/docs/koppeling-pipedrive.html`
   - `C:/Users/SalP1/Desktop/mowi.agency/docs/koppeling-shopify.html`
   - `C:/Users/SalP1/Desktop/mowi.agency/docs/koppeling-woocommerce.html`
   - `C:/Users/SalP1/Desktop/mowi.agency/docs/koppeling-google-agenda.html`

   **Warning about those four docs pages.** They predate the 2026-08-19 no-em-dash rule and carry 6, 12, 11
   and 9 em dashes respectively, most of them in exactly the sentences worth lifting ("herkent en verrijkt
   uw agent klantgegevens rechtstreeks vanuit uw CRM `—` bijvoorbeeld ...", "uw persoonlijke API-token `—`
   een lange, willekeurige code"). Never paste a sentence from one verbatim into `<main>`: rewrite the dash
   as a comma, a colon, or a full stop. Same as the blog posts (R8), they are a content source, not a
   punctuation precedent.
2. **The dashboard app, read-only** (authoritative for connect flows and credential fields, and the only
   admissible source for a click-path):
   - `C:/Users/SalP1/Desktop/Mowi Dashboard/config/shop_platforms.php`
   - `C:/Users/SalP1/Desktop/Mowi Dashboard/resources/views/account/koppelingen.blade.php` - a 30-line
     wrapper. The only usable copy in it is the page intro; the real connect UI is the partial below.
   - `C:/Users/SalP1/Desktop/Mowi Dashboard/resources/views/profile/partials/update-shop-connection-form.blade.php`
     - the actual connect form: field labels, button text, status wording.
   - `C:/Users/SalP1/Desktop/Mowi Dashboard/resources/views/agents/partials/setup-step-webshop.blade.php`
   - `C:/Users/SalP1/Desktop/Mowi Dashboard/routes/web.php`
   Read only. Never write to that repo, never run `artisan`, never start the app.
3. **Vault** `C:/Users/SalP1/Desktop/Mowi brain/` - the Decisions log and the Integrations hitlist, for the
   dashboard connect story and for what was decided and when.
4. **The 2026-08-04 vault note**, still-true fragments only (for example: the Pipedrive personal API token
   via Settings > Company settings > Personal preferences > API). Its deliverables were deleted 2026-08-11;
   it never outranks tiers 1-3.
5. **Raw material** in `downloads/` (`it-partner-exact-online.pdf`, `it-partner-pipedrive.pdf` only) and the
   sheet recipe inside `generate-it-sheets.js`. Read, never run.

**Gap rule.** Any claim you cannot ground in the tiers above becomes (a) an entry in `ralph/NEEDS_SAL.md`
naming the page, the section, and the exact question, and (b) conservative copy on the page: say less, stay
true, or use the `Mowi volgt dit direct met u op.` fallback. Writing an invented claim is a worse failure
than shipping a thin section. More `NEEDS_SAL.md` entries on the 7 integrations that have no docs page is
correct behaviour, not failure.
