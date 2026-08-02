# Project rules (permanent — apply in every session)

This is a brand-new marketing website for an AI automation business. These rules are
durable and apply to all future work in this repo, not just the current task.

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

## Language & tone
- All visible site text is in **Dutch**, formal **"u"** form (never "je/jij").
- **Exception:** the header nav's "Products" mega-menu (see `.nav-megamenu` in `css/style.css`)
  uses English labels deliberately — category labels ("Platform", "Automations") and item names
  ("Workflow Automations", "BI Dashboard", "CRM sync", "Email triage", "Invoice processing",
  "Lead enrichment", "Report generator"). Keep these in English; don't translate them to Dutch.
  This is scoped to that menu only — everything else on the site stays Dutch per the rule above.

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
- All other pages as `.html` files in the root (no subfolders per page).
- `css/` — stylesheets
- `js/` — vanilla JS
- `assets/` — images/icons/etc.
- `reference/` — research docs (content source, style source) — not part of the shipped site.
