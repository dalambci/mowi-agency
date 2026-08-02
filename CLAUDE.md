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
- The icon (`mowi-icon.png`) is also used as the favicon (`<link rel="icon">`) on every page.
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
