# Design Source: vuewer.com (style inspiration ONLY)

Captured 2026-07-31 by fetching the live page (`https://vuewer.com/`) and its compiled CSS
bundle (`https://vuewer.com/build/assets/app-*.css`) directly, then grepping for exact values —
not a visual guess. Stack identified: Laravel + Livewire + Alpine.js + Tailwind CSS v4
(utility classes compiled with CSS custom properties / OKLCH colors).

**Hard rule (repeated from project brief): we copy the STYLE only.**
Never copy Vuewer's text, images, project screenshots, client logos, or brand assets.
Everything below describes *patterns and values* to reinterpret with our own content.

---

## Colors

- **Page background / theme color:** `#f4f4f0` — confirmed exact, found in the page's
  `<meta name="apple-mobile-web-app-status-bar-style" content="#f4f4f0">` and used as the
  overall canvas tone. Warm off-white, slightly yellow/beige-grey, not pure white.
- **Secondary section background (`--color-gray`):** `oklch(96.6% .0053 106.5)` — an
  extremely light, warm near-white gray, very close to the page background but used at
  reduced opacity for subtle section separation, e.g. `bg-gray/40`, `bg-gray/60`. Converts to
  roughly `#f5f4f1`–`#f6f5f2` depending on renderer. Use this as a "section tint" one shade
  off the base background, not a hard-white card color.
- **Primary text / ink:** `--color-black: #000` (pure black, used for headings and primary buttons)
- **Inverse text:** `--color-white: #fff`
- **Body/secondary text:** grey tones via Tailwind's default gray scale (e.g. `text-gray-400`,
  `text-gray-500`, `text-gray-900`) — no custom brand grey scale beyond `--color-gray` above.
- **Borders:** very subtle, near-invisible — e.g. `border-color: color-mix(in oklab, var(--color-gray-950) 8%, transparent)`
  and literal `#0a0a0a14` (black at ~8% opacity). Borders read as "barely there," not solid lines.
- **No loud accent/brand color found** — the palette is essentially monochrome (near-white
  background, black ink, black primary buttons) plus whatever imagery/screenshots provide
  color. This is a deliberate "let the content be the color" approach.

## Typography

- **Font delivery:** fully self-hosted custom webfont family, `font-family: "Font", ui-sans-serif, system-ui, sans-serif, ...`
  (the family is literally named `Font` in their build — a paid/licensed font, not identifiable
  by name from the obfuscated file names alone).
- **Weights available via `@font-face`:** 400 (Regular), 500 (Medium), 600 (Semibold),
  700 (Bold / Extrabold — both mapped to 700), 900 (Black / Heavy — both mapped to 900). Italics
  exist for every weight too.
- **Weights actually used most in markup:** `font-semibold` (19 uses) and `font-bold` (17 uses)
  dominate; `font-medium` (5) and `font-extrabold` (1) are rare. So: **headings are
  semibold/bold, not black/heavy** — restrained boldness, not maximal.
- **Heading sizes:** hero/H1-scale headings go up to `text-5xl md:text-6xl lg:text-[90px]` —
  i.e. a large, fluid type scale that gets genuinely huge (90px) on desktop. Sub-headings use
  `text-4xl sm:text-5xl` and `text-xl sm:text-2xl` for smaller intro/eyebrow text.
- **Letter-spacing (`tracking`) scale defined:**
  - `--tracking-tighter: -0.05em`
  - `--tracking-tight: -0.025em`
  - `--tracking-normal: 0em`
  - `--tracking-wide: 0.025em`
  - `--tracking-wider: 0.05em`
  - `--tracking-widest: 0.1em`
  Large display headings frequently pin to `!tracking-normal` (overriding any tighter default),
  and a plain `-1px` letter-spacing appears on at least one big display heading.
- **Distinctive pattern — headings end with a period.** Confirmed in the live markup, e.g.
  `<h3>Robust backend applications.</h3>`. Treat this as a copy convention: short, punchy,
  declarative section headings that end with a full stop, not a question mark or ellipsis.
- **Free Google Fonts alternative:** since the real family can't be identified, pick a modern
  geometric/grotesk sans with a similarly wide weight range (400–900) and a neutral, slightly
  rounded character. Good matches: **"Plus Jakarta Sans"** (closest overall — geometric,
  friendly, full 400–800 range) or **"Manrope"** (also 400–800, slightly more condensed). Either
  works well for a Dutch B2B AI/data site. Use one for both headings and body to mirror
  Vuewer's single-family approach (they use the same `Font` family everywhere, no separate
  heading/body typeface).

## Spacing rhythm

- Sections are stacked with large top margins, not padding-based gaps: `mt-24` (6rem / 96px)
  as the base, stepping up to `lg:mt-32` (8rem / 128px) on large screens. That's the section-to-
  section rhythm to replicate — generous, airy vertical space between major blocks.
- Within a section, tinted sub-blocks use fractional-opacity background tints (`bg-gray/40`,
  `bg-gray/60`) rather than new hard colors, keeping transitions between sections soft.

## Border radius

Tailwind v4 default radius scale, used as-is (no custom overrides found):
- `--radius-xs: 0.125rem` (2px)
- `--radius-sm: 0.25rem` (4px)
- `--radius-md: 0.375rem` (6px)
- `--radius-lg: 0.5rem` (8px)
- `--radius-xl: 0.75rem` (12px)
- `--radius-2xl: 1rem` (16px)
- `--radius-3xl: 1.5rem` (24px)
- `--radius-4xl: 2rem` (32px)
- `rounded-full` for pills/avatars/badges/toggles (`border-radius: 3.4e38px`, i.e. a true pill).

Cards and larger containers tend toward `rounded-2xl`/`rounded-3xl` (big, soft corners);
buttons and small badges use `rounded-full` (pill-shaped).

## Shadows

Standard Tailwind shadow scale, all very soft/low-opacity black (`#0000001a` ≈ 10% black),
no colored shadows:
- `shadow-sm`: `0 1px 3px 0 rgba(0,0,0,.10), 0 1px 2px -1px rgba(0,0,0,.10)`
- `shadow-md`: `0 4px 6px -1px rgba(0,0,0,.10), 0 2px 4px -2px rgba(0,0,0,.10)`
- `shadow-lg`: `0 10px 15px -3px rgba(0,0,0,.10), 0 4px 6px -4px rgba(0,0,0,.10)`
- `shadow-xl` / `shadow-2xl` for bigger overlay/lifted elements only.
Shadows are used sparingly — most flat cards use no shadow or a hairline border instead.

## Buttons

- **Primary button (`.btn-primary`):** black background, white text, `text-sm`, `font-medium`,
  `inline-flex` centered content, `white-space: nowrap`. Smooth transitions on color/background/
  border. Typically paired with `rounded-full` for a pill shape.
- **Secondary button (`.btn-secondary`):** white background, same text-sm/font-medium sizing,
  hairline border (`color-mix(in oklab, var(--color-gray-950) 8%, transparent)` ≈ 8% black),
  plus a soft `shadow-sm`. Reads as a quiet outline button next to the solid black primary.
- **Small pill badges/tags:** `rounded-full bg-gray-900 px-3 py-1 text-xs text-white`, with
  `hover:bg-black` — tiny, high-contrast pill labels.
- **Hover micro-interactions found:** `hover:scale-110` and `hover:scale-95` (subtle
  grow/shrink on hover/press), `hover:-translate-y-6` (a bigger lift on hover for feature
  cards/images).

## Animations & interactions

- **Continuous logo marquee — confirmed.** `@keyframes marquee { 0% { transform: translate(0) }
  to { transform: translate(-100%) } }`, applied as `.animate-marquee { animation: 30s linear
  infinite marquee }` (plus a `.animate-marquee-reverse` variant scrolling the other way). Two
  rows of client logos likely scroll in opposite directions at a slow, even 30-second loop —
  we will do this with neutral grey placeholder logo tiles instead of real logos.
- **Scroll-reveal — confirmed via Alpine's `x-intersect` directive** (fires when an element
  enters the viewport) combined with `x-transition` for fade/slide-in effects on elements as
  the user scrolls. No external animation library — implement this in vanilla JS with an
  `IntersectionObserver` toggling a "visible" class that triggers a CSS transition
  (opacity/translate), since our project must stay framework-free.
- **Accordion — confirmed.** Alpine component pattern `x-data="{ id: $id('accordion') }"` for
  FAQ-style expand/collapse. Implement in vanilla JS: a button toggling `aria-expanded` and a
  max-height/opacity transition on the panel.
- **Custom cursor-follower effect** exists on the live site (`x-data="hoverFollower()"`) — a
  bespoke hover interaction, likely a dot/blob that follows the cursor over certain elements.
  Optional/nice-to-have, not essential to replicate; skip unless there's spare time, since it
  adds JS complexity for modest payoff on a marketing site.
- General transition pattern: modest, quick easing (`duration-100` to `duration-700`) on color,
  background, transform — nothing flashy or slow. One notable easing curve used for a bigger
  reveal: `ease-[cubic-bezier(0.175,0.885,0.32,1.275)]` (a slight overshoot/bounce).

## Layout notes

- Full-width sections, content constrained to a centered max-width container.
- Monochrome-first design: color comes from photography/screenshots and black ink, not from a
  brand accent color. If our site wants a touch more personality than pure monochrome, that's
  a deliberate deviation from Vuewer, not an inconsistency to fix.
- Section headings are short, declarative, and end with a period ("Robust backend
  applications.") — apply the same convention to our Dutch headings where it reads naturally
  (e.g. "Slimmer werken met AI." rather than "Slimmer werken met AI!" or no punctuation).

## Summary for implementation

| Aspect | Value to use |
|---|---|
| Background | `#f4f4f0` (warm off-white) |
| Section tint | ~`#f5f4f1` at 40–60% opacity over background |
| Ink | `#000` headings, Tailwind gray-500/600/900 for body text |
| Font | Plus Jakarta Sans (or Manrope) from Google Fonts, weights 400/500/600/700/800 |
| Heading style | Bold/semibold, tight tracking on big display sizes, ends with a period |
| Section spacing | ~96px mobile → 128px desktop between major sections |
| Card radius | 16–24px (`rounded-2xl`/`rounded-3xl`) |
| Button radius | full pill |
| Primary button | black bg, white text, pill, `text-sm font-medium` |
| Secondary button | white bg, hairline border, soft shadow, pill |
| Shadows | soft, low-opacity black, used sparingly |
| Marquee | continuous, 30s linear loop, opposite-direction rows |
| Reveal | IntersectionObserver-driven fade/slide on scroll |
| Accordion | vanilla JS expand/collapse for FAQs |
