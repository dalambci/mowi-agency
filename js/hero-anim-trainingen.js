/* ==========================================================================
   /trainingen hero animation — page-scoped script, loaded ONLY by
   trainingen.html.

   v2 — complete replacement of the earlier cursor/canvas build; no cursor
   engine, no drag/connector logic, no count-up helpers survive here. Four
   static beats already exist in the HTML (one per training, matching the
   page's own course descriptions) — this script's only job is to cycle
   which one is active and reveal its two skill rows in sequence, when
   motion is allowed. Deliberately independent of js/main.js's showcase
   logic (own prefersReducedMotion check, own pause-when-offscreen) — see
   css/hero-anim-trainingen.css's header comment for why sharing files
   across page-specific animations is exactly what broke five pages the
   last time it happened.

   Default HTML state (every beat's markup, beat 1 already active/ticked)
   is the reduced-motion/no-JS end state; this script only ever resets and
   replays that same markup once motion is confirmed allowed. ========================================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.querySelector(".hero-anim--trainingen");
  if (!root || prefersReducedMotion) return; // stay on the static, fully-ticked first beat

  const card = root.querySelector(".hero-anim--trainingen__card");
  const beats = [...root.querySelectorAll(".hero-anim--trainingen__beat")];
  const dots = [...root.querySelectorAll(".hero-anim--trainingen__dot")];
  if (!card || beats.length !== 4 || dots.length !== 4) return;

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function resetBeat(beat) {
    beat.querySelectorAll(".hero-anim--trainingen__skill").forEach((row) => {
      row.classList.remove("is-visible");
    });
  }

  function showBeat(index) {
    beats.forEach((b, i) => b.classList.toggle("is-active", i === index));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  let running = false;

  async function playBeat(index) {
    const beat = beats[index];
    resetBeat(beat);
    showBeat(index);

    // Header settles in with the beat's own crossfade (~500ms); a short
    // buffer after that before the first skill row starts revealing.
    await wait(600);
    if (!running) return;

    const rows = [...beat.querySelectorAll(".hero-anim--trainingen__skill")];
    rows[0].classList.add("is-visible");
    await wait(500);
    if (!running) return;

    rows[1].classList.add("is-visible");
    await wait(2400); // hold on the finished beat before the next one starts
  }

  async function loop() {
    let index = 0;
    while (running) {
      await playBeat(index);
      if (!running) break;
      index = (index + 1) % beats.length;
    }
  }

  function start() {
    if (running) return;
    running = true;
    loop();
  }

  function stop() {
    running = false;
  }

  // Pause when off-screen — self-contained IntersectionObserver, not a
  // shared helper (see file header comment for why this stays independent
  // of js/main.js's own pauseWhenOffscreen).
  function observeVisibility() {
    if (!("IntersectionObserver" in window)) {
      start();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!running) start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(card);
  }

  // Every beat's min-height reservations (see the CSS) are tuned against
  // real, settled font metrics — wait for the real font before the very
  // first paint of the animated cycle, same defense as the showcase
  // system's own document.fonts.ready gating.
  function init() {
    observeVisibility();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
