# Vuewer.com — widget mechanics reference

Study-only notes on the "Full-stack development" section of vuewer.com (API integrations
reel + interactive-demo grid), captured live via DevTools/Alpine `x-data` inspection on
2026-08-04. **Mechanics and layout only** — nothing here reproduces Vuewer's actual logos,
copy, code snippets, or visual assets. Everything Mowi ships (`css/style.css`,
`ai-automatisering.html`, `js/*.js`) is a from-scratch build using this only as a description
of *how the motion works*, not as source to copy from.

## 1. API-integrations "slot machine" reel

Layout: one card, `grid-cols-2` (2×2 = four independent reels), each reel a square
`overflow-y-scroll` container the same height as one item ("aspect-square"), holding a
vertical stack of square cells (`flex aspect-square items-center justify-center`), one
third-party logo centered in each cell. A thin top/bottom edge fade (`fade-y` — a
mask-image gradient, same technique this repo already uses on `.nav-megamenu-scroll`) hides
the hard clip where a cell is cut off mid-scroll. The native scrollbar is hidden
(`hide-scroll-bar`).

Above the four reels, a single full-width progress bar (`h-2`, rounded, `bg-gray` track +
solid `bg-black` fill) fills left→right.

State machine (Alpine.js, one component per reel):

- `spinning: false`, `stopTime: null`.
- On mount: jump-scroll to `scrollHeight` (start pre-scrolled toward the bottom of the item
  stack, so the first spin has room to run) and start a `setInterval(() => spin(), 5000)`.
- Separately, `x-intersect.once.threshold.35="spin()"` fires one extra spin the first time
  the widget scrolls into view — so it doesn't sit idle waiting for the first 5s tick.
- `spin(duration = 1500 + Math.random()*1500)` — guarded (`if (this.spinning) return`), so
  overlapping calls are no-ops. Sets `spinning = true` and `stopTime = Date.now() + duration`
  (i.e. **each spin runs a random 1.5–3s**, not a fixed length).
- A `requestAnimationFrame` loop (`animate`) runs while spinning: each frame it advances
  `scrollTop` by a constant speed × delta-time (continuous scroll, not discrete item-steps),
  and **wraps around** — if the new scroll position goes past 0 it re-adds `maxScroll` so the
  reel loops seamlessly (never hits a hard start/end).
- When `Date.now() >= stopTime`, it stops advancing and **snaps to the nearest item's exact
  center** (`Math.round(scrollTop / itemHeight) * itemHeight`) via `scrollTo({ top, behavior:
  'smooth' })` — so it always lands cleanly centered on one logo, never mid-cell, and the
  final settle uses the browser's native smooth-scroll easing rather than a hand-rolled curve.
- Net visible rhythm per reel: sits still on one logo for the remainder of the 5s interval,
  then spins continuously for 1.5–3s, then eases to a stop on a new (possibly repeated) logo.
  All four reels run independently/unsynchronized, so they never all land at the same instant
  — reads as a lively, uncoordinated shuffle rather than one mechanical tick.

**What we borrowed (mechanic, not asset):** continuous auto-scroll + wrap + timed snap-to-item
is the "slot machine" feel. A first pass reimplemented that rhythm as a single vertical text
reel cycling through partner names — **reverted 2026-08-05** per user feedback: the "Mowi
koppelt met" section is now a static row of all system names as small pill labels (reuses
the site's existing `.pill`/`.pill-row` component), not an animated reel. This section of the
doc is kept as a historical record of the mechanic that was studied and initially tried, not
a description of what currently ships.

## 2. Interactive-demo grid ("Interactive applications")

A 2×3 grid of small, self-contained live UI components, each demonstrating one interaction
pattern rather than mimicking a product screenshot:

- Two circular "gauge" dials (percentage ring, animates 0→value on load/scroll-in) — labeled
  "Performance optimization" etc.
- A plain on/off toggle switch.
- A 5-star rating control with a "Reset" pill button below it.
- A black "Send notification" button (toast demo).
- An "Account / Password" segmented tab control.
- A "Copy me" text field with a copy-to-clipboard icon button.
- An "Open popup" button.

Each cell is a real, working micro-interaction (not a screenshot/video) inside a plain
bordered grid cell matching the page's overall hairline-grid aesthetic — the point is "this is
a genuine interactive product, not marketing decoration."

**What we borrow (mechanic, not content):** small, self-contained, *actually functioning*
widgets in a bordered card, not a fake screenshot. Our live agent-feed widget (task 5) applies
this same idea to Mowi's own story — an activity feed that visibly updates on its own,
demonstrating the monitoring/"Needs attention" narrative — rather than any of Vuewer's own
demo content (no toggles/stars/popups copied).

## Shared visual language notes (for consistency, not copying)

- Hairline 1px borders everywhere, square corners, generous negative space — matches this
  site's own existing bordered-grid language (`.hero-frame`, `.nav-megamenu`), so no new
  visual vocabulary is needed to build these widgets.
- Motion is quiet: no bounce/overshoot on the reel itself (only vuewer's own button-hover
  elsewhere uses `--ease-bounce`-style overshoot, not this component) — the reel's stop is a
  plain smooth deceleration, matching this repo's own `--ease-out`.
