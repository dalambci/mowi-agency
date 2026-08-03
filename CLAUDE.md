# Project rules (permanent — apply in every session)

This is a brand-new marketing website for an AI automation business. These rules are
durable and apply to all future work in this repo, not just the current task.

## Project memory (Obsidian)
Long-term project knowledge lives in `c:\Users\SalP1\Desktop\Mowi brain\Mowi\`.
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
- `screenshot.js` — Playwright script that takes full-page screenshots of the homepage at
  1440px and 390px (`node screenshot.js [outputDir] [url]`). Requires the local server
  running first. Scrolls through the page in steps before capturing — the site's
  scroll-reveal animations are IntersectionObserver-driven, so a screenshot tool that doesn't
  actually scroll the real viewport will capture below-the-fold content as still invisible.
  Output goes to `screenshots/` by default (gitignore-worthy, not a deliverable).
- Playwright is also useful for genuine mobile-width testing — browser-extension-based
  automation in this environment could not reliably resize its own viewport, so Playwright is
  the only way found so far to actually verify layout at e.g. 390px rather than guess from
  full-desktop screenshots.

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
- Production (`mowi.agency`, Cloudways app `ktzphwhvnh` on server `134.209.193.67`) has its own
  git checkout at `~/applications/ktzphwhvnh/public_html`, with `origin` pointed at this same
  GitHub repo (`https://github.com/dalambci/mowi-agency.git`). Deploying is: push to GitHub,
  then SSH in and `git pull origin master` in that directory (plain fast-forward — the server
  checkout should never have local commits of its own).
- SSH access uses a dedicated key at `~/.ssh/mowi_cloudways` (already present in this dev
  environment, not passphrase-protected) — connect with
  `ssh -i ~/.ssh/mowi_cloudways master_jhjtpcszem@134.209.193.67`, no password needed. Never
  authenticate with a password here even if one is offered/pasted in chat — entering a password
  into an auth prompt on the user's behalf is a hard no regardless of the source; use the key.
- `git push origin master` from this repo may be blocked by Claude Code's own permission
  classifier (separate from any GitHub-side issue) — if so, ask the user to approve it or run it
  themselves; retrying after approval works fine.
- Multi-tenant reminder (same as above): that server has a dozen+ other app folders. Only ever
  touch `ktzphwhvnh` — confirm `ls ~/applications/ktzphwhvnh/public_html` looks like this repo
  (index.html, CLAUDE.md, css/, js/, reference/) before pulling if there's ever any doubt.

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
  string (e.g. `css/style.css?v=20260802`), matching a `Cache-Control: public, max-age=2592000`
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
- **Exception:** the header nav's "Products" mega-menu (see `.nav-megamenu` in `css/style.css`)
  uses English labels deliberately — category labels ("Platform", "Automations") and most item
  names ("BI dashboard", "CRM sync", "Email triage", "Invoice processing", "Lead enrichment",
  "Report generator"). Keep these in English; don't translate them to Dutch. This is scoped to
  that menu only — everything else on the site stays Dutch per the rule above. One item in that
  same menu, "AI-automatisering" (linking to `ai-automatisering.html`), is deliberately Dutch —
  matches the page's own name/slug rather than following the English-labels exception.

## Documentation section (setup guides for clients)
- Structure, page anatomy, navigation anatomy, and writing rules are defined in
  `reference/docs-style-guide.md` — study/inspiration only, same status as
  `reference/style-vuewer.md`, not part of the shipped site. Follow it for every docs page.
- Language: Dutch, formal **"u"** form, same as the rest of the site.
- Agent and product names stay in English, per the existing Products mega-menu exception above
  (e.g. "CRM sync", "Email triage", "Invoice processing", "Lead enrichment", "Report generator").
- UI labels (button/menu names the client sees on their actual screen) are quoted **exactly**,
  in whatever language that screen shows them in — do not translate a UI label that's genuinely
  English on-screen into Dutch, or vice versa. Verify the real on-screen wording before writing
  a step; never guess or approximate it.
- The client portal is always called **"het dashboard"** — never "de omgeving," "het portaal,"
  or "uw account." One term, used consistently across every docs page.
- Information architecture (categories + initial page list) is proposed in
  `reference/docs-style-guide.md` §4. Treat that as the working IA once approved; update this
  file's Folder structure section below if/when the docs section adds new folders.

### Docs are visually a dashboard extension, not a marketing page
- Docs pages are styled to match the **client dashboard** (a separate Laravel app at
  `c:\Users\SalP1\Desktop\Mowi Dashboard` — not part of this repo), not this site's own
  marketing design. Calm neutrals, no accent hue, no display-sized headings, no marquees, no
  scroll-reveal animation.
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
- All internal links — root marketing pages (`/cases`, `/contact`, `/ai-automatisering`,
  `/power-bi-dashboards`, `/trainingen`) and docs links (sidebar, breadcrumb, prev/next,
  in-article cross-links, e.g. `/docs/agent-crm-sync`) — point to extensionless URLs. The files
  on disk still end in `.html`; only the URL is clean.
- This only works via **Internal Rewrite** rules configured directly in the Cloudways dashboard
  (app `mowi.agency` / 6590002 → **Web Rules → Rewrite Rules**, not anything in this repo or in
  nginx config files we have access to — see the SSH/root-permission note under "Deploying to
  production" above). The docs rule — `^/docs/([a-z0-9-]+)$` → `/docs/$1.html`, Action
  **Internal rewrite** — was verified 2026-08-03 against all 19 articles (right status code *and*
  right page content) plus collateral checks, all correct.
- **A second rule for the root-level marketing pages is required and, as of this writing, has
  NOT yet been added to Cloudways** — only the code side (links + local `serve.js`) is done.
  Add: `^/(cases|contact|ai-automatisering|power-bi-dashboards|trainingen)$` →
  `/$1.html`, Action **Internal rewrite** (kept as an explicit slug list rather than a generic
  `[a-z0-9-]+` catch-all, so it can never accidentally intercept `/docs`, `/css/...`, `/js/...`,
  `/assets/...` or any future non-page path). Until this rule exists, the root pages will 404 on
  production when visited without `.html` — `index.html` is unaffected since `/` already serves
  it directly.
- The account's Web Rules quota showed **24/25 remaining** after adding the docs rule — adding
  this one brings it to 23/25; check before adding more.
- `serve.js` (local dev server) mirrors both rules generically (falls back to appending `.html`
  to any unresolved extensionless path, not just under `/docs/`) so local testing matches
  production once the second rule is added. If the live rules ever change, update `serve.js` to
  match or local testing will silently diverge from reality.
- If `docs/` is ever moved off this Cloudways app (different host, different app, subdomain
  split, etc.), this rule does not travel with the repo — recreate it on the new host first, or
  every docs link will 404.
- Every docs page follows the same shell: `.docs-header` (slim, wordmark + "Terug naar website"
  + "Inloggen" linking to `https://dashboard.mowi.agency/login`) → `.docs-sidebar` (mount point
  only, populated by JS) → `.docs-content-wrap` (`.docs-column` + `.docs-toc`). Reusable
  components live in `css/docs.css`: `.docs-steps` (numbered steps with circles), `.docs-prereqs`
  (prerequisites checklist box), `.docs-callout` with `-note` / `-warning` / `-result` modifiers
  (the `-result` variant is for "U ziet nu ..." expected-result confirmations), `.docs-media`
  (grey rounded image placeholder + caption, for screenshots to be added later), and
  `.docs-token-row` / `.docs-copy-btn` (copyable key/URL blocks with a working clipboard button).
- All 19 approved articles + `docs/index.html` (overview, dashboard-style category cards) exist
  and have **real written content** (as of 2026-08-03) — not stubs. Every article follows the
  same anatomy: two-sentence "what this does," one-line goal, prerequisites box, numbered steps
  with "U ziet nu ..." results, image placeholders, troubleshooting, next steps. The Email
  triage agent page (`docs/agent-email-triage.html`) was written first and approved by the user
  as the template every other article copies — if in doubt about tone/structure/depth for a new
  or edited article, match that one.
- The marketing footer has a dedicated **"Support"** column (`.footer-support`, its own grid
  column in `.footer-inner` — 4 columns total: brand/nav/support/contact) that links to
  `docs/index.html` as "Documentatie" — keep that link when editing any footer. It used to be a
  flat item inside "Navigatie"; that changed 2026-08-03, don't move it back.

### Precision rules that produced this content — apply to every future edit
- **Never invent a click-path.** Steps inside our own dashboard are grounded by reading the
  actual Mowi Dashboard Laravel codebase (`c:\Users\SalP1\Desktop\Mowi Dashboard` —
  routes/web.php, the relevant `resources/views/**/*.blade.php`), not guessed from what a
  dashboard "probably" looks like. Steps inside external tools (Gmail, Outlook, Salesforce,
  Exact Online, AFAS, Power BI) are grounded by fetching that tool's own official documentation
  (WebFetch/WebSearch), not recalled from memory.
- **Two HTML comment markers flag unresolved precision gaps** — `<!-- DRAFT: ... -->` for steps
  in our own platform where the screen/process doesn't exist yet or isn't confirmed (e.g. there
  is currently no self-service "Koppelingen" UI in the dashboard at all — every agent/koppeling
  page's connection step is honestly DRAFT-marked for this reason, and that's a real product gap,
  not a doc-writing gap); `<!-- VERIFY: ... -->` for external-tool details found via secondary
  sources (blog posts, community articles) rather than confirmed directly on the vendor's own
  page (Salesforce's and Exact Online's help portals are JS-rendered SPAs that don't reliably
  return real content to WebFetch — when a fetch returns only a loading/CSS-error shell, that's
  the tool failing to render, not the page being empty; don't treat it as "nothing exists there").
  Find every open one with: `grep -rn "DRAFT\|VERIFY" docs/*.html` (27 remain as of 2026-08-03:
  23 DRAFT, 4 VERIFY — see chat history for the full grouped list, or re-run the grep and read
  each comment, they're self-explanatory).
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

## Content
- Content is adapted from `reference/content-data-vista.md` (our own prior business
  website — safe to reuse/adapt in full: text, numbers, stats, client names, case studies).
- The angle is **AI-first**: AI-automatisering is the main/lead service. Power BI dashboards
  and trainingen are supporting/secondary services, not the headline.

## Visual style
- Visual style follows `reference/style-vuewer.md` — **inspired by**, never copied.
- Never copy Vuewer's actual text, images, project screenshots, client logos, or brand assets.
  Only reuse their design *patterns* (colors, type scale, spacing, radius, shadows,
  animations) reinterpreted with our own content.
- Base page background stays a near-neutral light grey (`#fcfbfa`, `--color-bg`). Prefer **white** as the
  secondary/contrast surface (alternating sections, cards), not a darker sand/tint shade.
  Alternating sections (`.section-tint`) render as a white panel with a hairline border and
  soft shadow, not a darker-cream background — contrast comes from that border/elevation, not
  from a second, muddier sand tone.

## Placeholders — use literally, never invent real values
Wherever personal/business details belong, insert these placeholders verbatim in the code:
- `[FULL_NAME]`
- `[PHONE]`
- `[EMAIL]`
- `[STREET_ADDRESS]`
- `[KVK_NUMBER]`
- `[CALENDLY_URL]`

`[BRAND_NAME]` is resolved: the brand is **Mowi** (real name and logo now in use — see Branding below).

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
- **No client logos and no invented logos.** Wherever a *client* logo strip/marquee appears,
  use neutral grey placeholder tiles (simple rounded blocks containing the word "logo"). Real
  client logos come later. This does not apply to Mowi's own logo, which is real and final.

## Quality bar
- Every page must work well on mobile (responsive layout, touch-friendly targets).
- Keep code simple, readable, and commented so future sessions can easily edit it — comments
  should explain *why*, not restate what the code obviously does.

## Folder structure
- `index.html` in the project root.
- All other marketing pages as `.html` files in the root (no subfolders per page).
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
  docs page via `../js/...`).
- `assets/` — images/icons/etc.
- `reference/` — research docs (content source, style sources) — not part of the shipped site.
