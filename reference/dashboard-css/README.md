# Design Source: Mowi Dashboard (style tokens ONLY)

Captured 2026-08-02 by copying `resources/css/dashboard.css` directly from the live Laravel
project at `c:\Users\SalP1\Desktop\Mowi Dashboard` (the actual client dashboard app, a separate
codebase from this static marketing site). Font is Inter, loaded via `fonts.bunny.net` (see
`resources/views/layouts/app.blade.php`), weights 400/500/600/700 — not Tailwind's default
`Figtree` from `tailwind.config.js`, since `dashboard.css` hardcodes `font-family` on `body`
and wins.

**Hard rule (same spirit as `style-vuewer.md`): we reuse the dashboard's design *tokens* —
colors, radii, shadows, spacing, type — reinterpreted for documentation pages. We do not import
Laravel/Blade markup, JS behavior, or business logic; `css/docs.css` in this repo is a fresh,
static-site-only implementation that happens to share the same visual language.**

## Token summary (see `dashboard.css` for the authoritative values)

- `--bg` `#FCFBFA` — page/sidebar background.
- `--card` / `--topbar` `#FFFFFF` — surface color for cards and the top bar.
- `--border` `#ECE8E4` — hairline borders everywhere (cards, table rows, dividers).
- `--text` `#121110` — primary text, and doubles as the primary button color (this dashboard
  has **no colored accent hue** — buttons/active states are near-black on a muted tint, not a
  brand color).
- `--text-2` `#595653` — secondary/body-muted text.
- `--text-3` `#8A8782` — tertiary/caption text.
- `--muted-bg` `#F5F2F0` — tinted background for hovers, active nav items, secondary buttons.
- `--success-bg` / `--success-text` `#EBF7EA` / `#1E681D` — positive status chips.
- `--attention-bg` / `--attention-text` `#E7E3DE` / `#121110` — neutral-attention badges.
- Warn chip (inline, not a token): bg `#FBE7C6`, text `#7A4A00`.
- `--radius` `8px`, `--radius-avatar` `6px`, `--radius-pill` `999px`.
- `--shadow` `none` (flat cards, border does the separation), `--shadow-float`
  `0 8px 24px rgba(18,17,16,.10)` (dropdowns/menus only).
- Base font size `14.5px`, monospace stack for tokens/keys:
  `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.

This is a calmer, more neutral palette than the marketing site's (`reference/style-vuewer.md`,
terracotta accent `#b5622f`) — deliberately so. Docs pages should read as an extension of the
client dashboard, not the marketing site.
