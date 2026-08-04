/* Broken-image safety net — split out of main.js on purpose (2026-08-04).
   Any <img> that fails to load at runtime gets hidden so a missing asset
   never leaves a visible broken-image icon. "error" doesn't bubble on
   <img>, so this has to listen on the capture phase.

   Why this lives in its own file loaded from <head>, not inside main.js:
   main.js loads at the bottom of <body> so the rest of it can safely assume
   the DOM it queries (header, nav, accordion, ...) already exists. But an
   <img> already present in the initial HTML (e.g. .trust-photo's photo
   placeholder) starts its request the moment the parser reaches that tag —
   for a fast same-origin 404, the error event can fire and complete before
   a bottom-of-body script even starts executing, so the listener loses the
   race and the browser's native broken-image icon shows through. Loading
   this tiny, DOM-independent listener from <head> instead guarantees it's
   registered before the parser ever reaches a single <img> in <body>.

   .blog-figure (a full-width block, not a grid item) collapses entirely —
   safe, since nothing else needs to reflow around it.

   .card/.case-card/.blog-card sit in a FIXED-column-count grid
   (grid-template-columns: repeat(3/4, ...) — see .grid-3/.grid-4 in
   style.css), so hiding a whole card would leave an empty trailing cell
   rather than truly redistributing the row — CSS grid doesn't collapse
   fixed tracks just because one item disappears. None of these currently
   hold an image as their only content, so this just hides the broken <img>
   itself and leaves the rest of that card's content (heading/text) in
   place — no half-empty grid cell, nothing to reflow.

   .browser-frame (ai-automatisering.html screenshot slots, 2026-08-04) gets
   the same whole-container treatment as .blog-figure — a missing screenshot
   hides its browser-chrome bar too, instead of leaving an empty frame shell.

   .logo-tile is deliberately skipped altogether: the logo marquee's
   infinite-scroll animation depends on every tile staying the same fixed
   width (see .logo-tile comment in style.css) — hiding one would desync
   its duplicated tile sets and break the loop, so a missing logo there
   should be fixed at the source instead of hidden at runtime. */
document.addEventListener(
  "error",
  (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.closest(".logo-tile")) return;

    const figure = img.closest(".blog-figure") || img.closest(".browser-frame");
    (figure || img).style.display = "none";
  },
  true
);
