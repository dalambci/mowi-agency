/* ==========================================================================
   /trainingen hero animation — page-scoped script, loaded ONLY by
   trainingen.html. Deliberately independent of js/main.js's showcase logic
   (own prefersReducedMotion check, own pause-when-offscreen, own cursor/
   easing engine) — see css/hero-anim-trainingen.css's header comment for why
   sharing files across page-specific animations is exactly what broke five
   pages the last time it happened.

   Concept: one canvas, a named cursor, two alternating scenes (Power BI /
   AI-automation), each ending in a closing badge. Default HTML state (the
   .hero-anim--trainingen__fallback markup) is the reduced-motion/no-JS end
   state; this script's only job is to hide that and drive the single
   animated stage instead, when motion is allowed. ========================================================================== */

(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.querySelector(".hero-anim--trainingen");
  if (!root || prefersReducedMotion) return; // stay on the static fallback

  const stage = root.querySelector(".hero-anim--trainingen__stage");
  const canvas = root.querySelector(".hero-anim--trainingen__canvas");
  const tagEl = root.querySelector(".hero-anim--trainingen__tag");
  const badgeEl = root.querySelector(".hero-anim--trainingen__badge");
  const badgeCheck = badgeEl ? badgeEl.querySelector(".hero-anim--trainingen__badge-check") : null;
  const badgeLabel = badgeEl ? badgeEl.querySelector(".hero-anim--trainingen__badge-label") : null;
  const cursorEl = root.querySelector(".hero-anim--trainingen__cursor");
  const pillEl = root.querySelector(".hero-anim--trainingen__pill");
  const chipEl = root.querySelector(".hero-anim--trainingen__drag-chip");
  const clickRing = root.querySelector(".hero-anim--trainingen__click-ring");

  const scene1 = root.querySelector('[data-scene="1"]');
  const scene2 = root.querySelector('[data-scene="2"]');
  if (!stage || !canvas || !cursorEl || !scene1 || !scene2) return;

  // Scene 1 elements
  const dropZone = scene1.querySelector(".hero-anim--trainingen__chart-drop");
  const bars = [...scene1.querySelectorAll(".hero-anim--trainingen__bar")];
  const barsContainer = scene1.querySelector(".hero-anim--trainingen__chart-bars");
  const chartLabel = scene1.querySelector(".hero-anim--trainingen__chart-label");
  const filterPill = scene1.querySelector(".hero-anim--trainingen__filter-pill");
  const kpi = scene1.querySelector(".hero-anim--trainingen__kpi");
  const kpiValue = scene1.querySelector(".hero-anim--trainingen__kpi-value");

  // Scene 2 elements
  const nodes = [...scene2.querySelectorAll(".hero-anim--trainingen__node")];
  const flowLinesSvg = scene2.querySelector(".hero-anim--trainingen__flow-lines");
  const toggleRow = scene2.querySelector(".hero-anim--trainingen__toggle-row");
  const toggle = scene2.querySelector(".hero-anim--trainingen__toggle");
  const statusPill = scene2.querySelector(".hero-anim--trainingen__status-pill");
  const counter = scene2.querySelector(".hero-anim--trainingen__counter");

  const BAR_HEIGHTS = [45, 78, 60, 92]; // percent — realistic-generic, one deliberately tallest for the later highlight

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Cursor position is tracked in canvas-relative pixels so every move is
  // computed against the canvas's real current size (responsive, no
  // hardcoded breakpoint-specific coordinates).
  let cursorX = 0;
  let cursorY = 0;

  function setCursorPosition(x, y) {
    cursorX = x;
    cursorY = y;
    cursorEl.style.transform = `translate(${x}px, ${y}px)`;
  }

  function canvasRelativeCenter(el) {
    const canvasRect = canvas.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - canvasRect.left + r.width / 2,
      y: r.top - canvasRect.top + r.height / 2,
    };
  }

  // Lands the cursor just above an element's top edge instead of dead
  // center — used for "placing" an element (the KPI tile) that fades in
  // right where the cursor arrives: landing at its center put the pill
  // (which renders below the tip) right on top of the tile's own text,
  // a real overlap caught in an earlier screenshot pass.
  function canvasRelativeAbove(el, margin) {
    const canvasRect = canvas.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return {
      x: r.left - canvasRect.left + r.width / 2,
      y: r.top - canvasRect.top - margin,
    };
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  // Quadratic-bezier interpolation between the cursor's current position and
  // a target, with a perpendicular control-point offset — reads as a
  // slight human curve rather than a straight mechanical line. Resolves
  // once the move completes; never jumps (always animates from wherever
  // the cursor currently is).
  function moveCursorTo(targetX, targetY, duration, curveAmount) {
    return new Promise((resolve) => {
      // Flip the name pill to the arrow's left whenever the destination
      // sits in the canvas's right half, so it never runs past the edge
      // (real bug, caught in the first screenshot pass: "Anna ·
      // Officemanager" overflowed the canvas when the cursor moved to the
      // top-right KPI tile).
      const canvasWidth = canvas.getBoundingClientRect().width;
      cursorEl.classList.toggle("is-flipped", targetX > canvasWidth * 0.55);

      const fromX = cursorX;
      const fromY = cursorY;
      const midX = (fromX + targetX) / 2;
      const midY = (fromY + targetY) / 2;
      // Perpendicular offset to the travel direction, so the curve bows
      // sideways rather than just up/down regardless of travel angle.
      const dx = targetX - fromX;
      const dy = targetY - fromY;
      const len = Math.hypot(dx, dy) || 1;
      const curve = curveAmount === undefined ? 18 : curveAmount;
      const controlX = midX + (-dy / len) * curve;
      const controlY = midY + (dx / len) * curve;

      const start = performance.now();
      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        const e = easeInOutCubic(t);
        const x = (1 - e) * (1 - e) * fromX + 2 * (1 - e) * e * controlX + e * e * targetX;
        const y = (1 - e) * (1 - e) * fromY + 2 * (1 - e) * e * controlY + e * e * targetY;
        setCursorPosition(x, y);
        if (t < 1 && running) {
          requestAnimationFrame(frame);
        } else {
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  function clickPulse() {
    cursorEl.classList.add("is-clicking");
    if (clickRing) {
      clickRing.classList.remove("is-pinging");
      void clickRing.offsetWidth; // restart the keyframe animation
      clickRing.classList.add("is-pinging");
    }
    setTimeout(() => cursorEl.classList.remove("is-clicking"), 200);
  }

  function setBadge(text) {
    if (!badgeLabel) return;
    badgeLabel.textContent = text;
  }

  function showBadge() {
    if (badgeEl) badgeEl.classList.add("is-visible");
  }

  function hideBadge() {
    if (badgeEl) badgeEl.classList.remove("is-visible");
  }

  function resetScene1() {
    if (dropZone) dropZone.classList.add("is-visible");
    if (barsContainer) barsContainer.classList.remove("is-visible");
    bars.forEach((b) => {
      b.style.height = "0%";
      b.classList.remove("is-highlighted");
    });
    if (chartLabel) chartLabel.classList.remove("is-visible");
    if (filterPill) filterPill.classList.remove("is-visible", "is-active");
    if (kpi) kpi.classList.remove("is-visible");
    if (kpiValue) kpiValue.textContent = "€0";
    if (chipEl) chipEl.classList.remove("is-visible");
  }

  function resetScene2() {
    nodes.forEach((n) => n.classList.remove("is-visible"));
    if (flowLinesSvg) flowLinesSvg.innerHTML = "";
    if (toggleRow) toggleRow.classList.remove("is-visible");
    if (toggle) toggle.classList.remove("is-on");
    if (statusPill) statusPill.textContent = "";
    if (counter) {
      counter.classList.remove("is-visible");
      counter.textContent = "";
    }
  }

  function countUp(el, from, to, steps, formatFn) {
    return new Promise((resolve) => {
      let step = 0;
      const stepMs = 90;
      function tick() {
        step += 1;
        const value = Math.round(from + ((to - from) * step) / steps);
        el.textContent = formatFn(value);
        if (step < steps && running) {
          setTimeout(tick, stepMs);
        } else {
          el.textContent = formatFn(to);
          resolve();
        }
      }
      tick();
    });
  }

  const SVG_NS = "http://www.w3.org/2000/svg";
  function drawFlowLine(fromEl, toEl) {
    const a = canvasRelativeCenter(fromEl.querySelector(".hero-anim--trainingen__node-dot"));
    const b = canvasRelativeCenter(toEl.querySelector(".hero-anim--trainingen__node-dot"));
    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", a.x);
    line.setAttribute("y1", a.y);
    line.setAttribute("x2", b.x);
    line.setAttribute("y2", b.y);
    line.setAttribute("pathLength", "1");
    flowLinesSvg.appendChild(line);
    return line;
  }

  let running = false;

  // --- Scene 1: Power BI -----------------------------------------------
  async function playScene1() {
    resetScene1();
    // Tag text is set by transitionScenes/loop before this runs, while the
    // tag is still hidden — see that function's own comment.

    // Cursor starts at a neutral corner, holding the "chart block" chip.
    const canvasRect = canvas.getBoundingClientRect();
    setCursorPosition(canvasRect.width * 0.1, canvasRect.height * 0.14);
    cursorEl.style.transition = "none";
    cursorEl.classList.remove("is-visible");
    pillEl.textContent = "Anna · Officemanager";
    if (chipEl) chipEl.classList.add("is-visible");
    void cursorEl.offsetWidth;
    cursorEl.style.transition = "";
    cursorEl.classList.add("is-visible");

    await wait(400);
    if (!running) return;

    const dropTarget = canvasRelativeCenter(dropZone);
    await moveCursorTo(dropTarget.x, dropTarget.y, 700, 22);
    if (!running) return;

    // Drop: the chip becomes the real chart.
    if (chipEl) chipEl.classList.remove("is-visible");
    dropZone.classList.remove("is-visible");
    barsContainer.classList.add("is-visible");
    bars.forEach((b, i) => {
      setTimeout(() => {
        if (running) b.style.height = BAR_HEIGHTS[i] + "%";
      }, i * 110);
    });
    setTimeout(() => running && chartLabel.classList.add("is-visible"), 150);

    await wait(950);
    if (!running) return;

    const kpiTarget = canvasRelativeAbove(kpi, 50);
    await moveCursorTo(kpiTarget.x, kpiTarget.y, 600, -16);
    if (!running) return;

    kpi.classList.add("is-visible");
    await countUp(kpiValue, 0, 128400, 8, (v) => "€" + v.toLocaleString("nl-NL"));
    if (!running) return;

    await wait(250);
    if (!running) return;

    const pillTarget = canvasRelativeAbove(filterPill, 46);
    filterPill.classList.add("is-visible");
    await moveCursorTo(pillTarget.x, pillTarget.y, 550, 14);
    if (!running) return;

    clickPulse();
    await wait(150);
    if (!running) return;
    filterPill.classList.add("is-active");
    bars[3].classList.add("is-highlighted");

    await wait(200);
    if (!running) return;
    setBadge("Dashboard staat");
    showBadge();

    cursorEl.classList.remove("is-visible");
    await wait(1350);
  }

  // --- Scene 2: Automatiseren met AI -------------------------------------
  async function playScene2() {
    resetScene2();
    // Tag text is set by transitionScenes before this runs, while the tag
    // is still hidden — see that function's own comment.

    const canvasRect = canvas.getBoundingClientRect();
    nodes.forEach((n, i) => {
      setTimeout(() => running && n.classList.add("is-visible"), i * 150);
    });
    pillEl.textContent = "Tom · Planner";

    await wait(900);
    if (!running) return;

    const node1Center = canvasRelativeCenter(nodes[0].querySelector(".hero-anim--trainingen__node-dot"));
    setCursorPosition(node1Center.x, node1Center.y - 26);
    cursorEl.style.transition = "none";
    cursorEl.classList.remove("is-visible");
    void cursorEl.offsetWidth;
    cursorEl.style.transition = "";
    cursorEl.classList.add("is-visible");

    await wait(200);
    if (!running) return;

    const node2Center = canvasRelativeCenter(nodes[1].querySelector(".hero-anim--trainingen__node-dot"));
    await moveCursorTo(node2Center.x, node2Center.y - 26, 500, 16);
    if (!running) return;
    const line1 = drawFlowLine(nodes[0], nodes[1]);
    requestAnimationFrame(() => running && line1.classList.add("is-drawn"));

    await wait(650);
    if (!running) return;

    const node3Center = canvasRelativeCenter(nodes[2].querySelector(".hero-anim--trainingen__node-dot"));
    await moveCursorTo(node3Center.x, node3Center.y - 26, 500, 16);
    if (!running) return;
    const line2 = drawFlowLine(nodes[1], nodes[2]);
    requestAnimationFrame(() => running && line2.classList.add("is-drawn"));

    await wait(650);
    if (!running) return;

    const toggleTarget = canvasRelativeAbove(toggle, 46);
    toggleRow.classList.add("is-visible");
    await moveCursorTo(toggleTarget.x, toggleTarget.y, 500, -14);
    if (!running) return;

    clickPulse();
    await wait(150);
    if (!running) return;
    toggle.classList.add("is-on");
    statusPill.textContent = "Actief ✓";

    await wait(300);
    if (!running) return;

    counter.classList.add("is-visible");
    await countUp(counter, 0, 3, 3, (v) => v + " taken verwerkt");
    if (!running) return;

    await wait(150);
    if (!running) return;
    setBadge("Workflow actief");
    showBadge();

    cursorEl.classList.remove("is-visible");
    await wait(750);
  }

  async function transitionScenes(leavingEl, enteringEl, nextTagText) {
    hideBadge();
    leavingEl.classList.remove("is-active");
    leavingEl.classList.add("is-leaving");
    tagEl.classList.add("is-hidden");
    await wait(400);
    if (!running) return;
    leavingEl.classList.remove("is-leaving");
    enteringEl.classList.add("is-active");
    // Text swaps while still invisible (is-hidden not yet removed), so the
    // fade-back-in never shows the outgoing scene's tag for a frame — a
    // real bug caught in an earlier screenshot pass (scene 2's nodes had
    // already appeared while the tag still read "Na Power BI · Basis").
    tagEl.textContent = nextTagText;
    tagEl.classList.remove("is-hidden");
    await wait(50);
  }

  async function loop() {
    // First entrance has no "leaving" predecessor.
    scene1.classList.add("is-active");
    tagEl.textContent = "Na Power BI · Basis";
    while (running) {
      await playScene1();
      if (!running) break;
      await transitionScenes(scene1, scene2, "Na Automatiseren met AI · Gevorderd");
      if (!running) break;
      await playScene2();
      if (!running) break;
      await transitionScenes(scene2, scene1, "Na Power BI · Basis");
    }
  }

  function start() {
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
    observer.observe(stage);
  }

  function init() {
    root.classList.add("js-animated");
    observeVisibility();
  }

  // Font metrics affect real element rects (KPI/label widths, node label
  // heights) that every cursor target and connector line is computed from
  // — wait for the real font before the very first measurement, same
  // defense as the showcase system's own document.fonts.ready gating.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    init();
  }
})();
