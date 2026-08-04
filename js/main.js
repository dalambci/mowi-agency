/* Mowi — shared vanilla JS behaviour. No framework, no build step.
   Two of the interactions requested for this site (the marquee pause-on-
   hover and smooth-scroll to anchors like #afspraak) are pure CSS —
   `animation-play-state` and `scroll-behavior: smooth` — and don't need any
   JS. See css/style.css for those. */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Sticky header compaction on scroll --------------------------------------
// Matches vuewer.com's own pattern (their header does
// `x-init="window.addEventListener('scroll', () => scrolled = window.scrollY > 0)"`)
// — see css/style.css's .site-header.is-scrolled for the actual top-offset
// values this toggles between.
const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  const updateHeaderScrolled = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 0);
  };
  updateHeaderScrolled();
  window.addEventListener("scroll", updateHeaderScrolled, { passive: true });
}

// --- Mobile nav toggle -----------------------------------------------------
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("main-nav");

function closeMobileNav() {
  navToggle.setAttribute("aria-expanded", "false");
  mainNav.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  document.body.style.overflow = "";
}

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMobileNav();
    } else {
      navToggle.setAttribute("aria-expanded", "true");
      mainNav.classList.add("is-open");
      document.body.classList.add("nav-open");
      document.body.style.overflow = "hidden";
    }
  });

  // Close the mobile menu after tapping a link, so navigation feels instant.
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  // Tapping the dimmed backdrop (body.nav-open::after, see css/style.css)
  // closes the sheet — the backdrop itself is a pseudo-element, so this
  // listens on body and bails out for clicks that landed on the panel or
  // the toggle button itself.
  document.body.addEventListener("click", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (mainNav.contains(event.target) || navToggle.contains(event.target)) return;
    closeMobileNav();
  });
}

// --- Nav dropdown ("Products" mega-menu) ---------------------------------------
// Click-to-toggle here; hover-to-open at desktop/tablet widths is pure CSS
// (see .nav-dropdown:hover in style.css) and needs no JS. This stays wired
// alongside it because hover has no touch equivalent, and it's the only way
// keyboard users (Tab + Enter/Space) can open/close it. The open/closed
// animation itself is pure CSS (max-height accordion on mobile, opacity +
// translate on desktop — see .nav-megamenu in style.css) keyed off
// aria-expanded — this just flips the attribute.
document.querySelectorAll(".nav-dropdown-trigger").forEach((trigger) => {
  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!isOpen));
  });
});

// Clicking anywhere outside an open dropdown closes it.
document.addEventListener("click", (event) => {
  document.querySelectorAll('.nav-dropdown-trigger[aria-expanded="true"]').forEach((trigger) => {
    if (!trigger.closest(".nav-dropdown").contains(event.target)) {
      trigger.setAttribute("aria-expanded", "false");
    }
  });
});

// Esc closes an open dropdown and returns focus to its trigger — otherwise
// a keyboard user tabbed into the mega-menu's links would have no way to
// dismiss it short of tabbing all the way back out.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll('.nav-dropdown-trigger[aria-expanded="true"]').forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  });
});

// Mobile only, by request — "Platform" (3 items) is naturally shorter than
// "Automations" (5 items); capping Automations to Platform's own rendered
// height, and letting just that list scroll internally
// (.nav-megamenu-scroll in style.css), keeps the two columns visually
// matched instead of the panel growing lopsided. Desktop's panel just sizes
// to its own content, uncapped. Recomputed on load and resize since it
// depends on actual text-wrap at the current column width (360px vs.
// 390px, ...), not a value CSS alone can express — this works even while
// the menu is closed, since overflow-clipping an ancestor doesn't change a
// descendant's own layout size, only what's painted.
const mobileMegaMenuQuery = window.matchMedia("(max-width: 47.9375rem)");

// A custom-drawn track + thumb, not the browser's native scrollbar — iOS
// Safari always auto-hides its native scrollbar and there is no CSS
// override for that, so a *real* permanent indicator has to be an element
// we draw and position ourselves. Created once per Automations list (lazily,
// on first sync) and appended as a sibling of the <ul> inside
// .nav-megamenu-col, which is what it's positioned relative to — not the
// <ul> itself, since anything absolutely positioned inside an
// overflow:auto element scrolls away with its content instead of staying
// put as a fixed rail alongside it.
function ensureScrollIndicator(list) {
  const column = list.parentElement;
  let track = column.querySelector(".nav-megamenu-scrollbar");
  if (!track) {
    track = document.createElement("div");
    track.className = "nav-megamenu-scrollbar";
    track.innerHTML = '<div class="nav-megamenu-scrollbar-thumb"></div>';
    column.appendChild(track);
  }
  // list.offsetTop/clientHeight (not top:0/height:100% in CSS) since the
  // track needs to span just the <ul>, not the label above it too — both
  // live in the same .nav-megamenu-col.
  track.style.top = `${list.offsetTop}px`;
  track.style.height = `${list.clientHeight}px`;
  return track.querySelector(".nav-megamenu-scrollbar-thumb");
}

function syncMegaMenuColumnHeights() {
  document.querySelectorAll(".nav-megamenu").forEach((menu) => {
    const [platformList, automationsList] = menu.querySelectorAll(".nav-megamenu-col ul");
    if (!platformList || !automationsList) return;

    if (mobileMegaMenuQuery.matches) {
      automationsList.style.maxHeight = `${platformList.getBoundingClientRect().height}px`;
      automationsList.classList.add("nav-megamenu-scroll");

      const thumb = ensureScrollIndicator(automationsList);

      // Bottom-edge fade (mask-image, see .nav-megamenu-scroll in
      // style.css) and the thumb's own size/position both signal there's
      // more to scroll to; the fade is removed once actually scrolled to
      // the end so the last item doesn't stay half-faded after the user
      // has already seen it. Listener is bound once per element (guarded
      // via the dataset flag) since this whole function reruns on every
      // resize.
      const updateScrollState = () => {
        const { scrollTop, scrollHeight, clientHeight } = automationsList;
        automationsList.classList.toggle("is-at-bottom", scrollHeight - scrollTop - clientHeight < 2);

        const thumbHeight = Math.max(16, (clientHeight / scrollHeight) * clientHeight);
        const maxScrollTop = scrollHeight - clientHeight;
        const scrollRatio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.top = `${(clientHeight - thumbHeight) * scrollRatio}px`;
      };
      if (!automationsList.dataset.scrollFadeBound) {
        automationsList.addEventListener("scroll", updateScrollState, { passive: true });
        automationsList.dataset.scrollFadeBound = "true";
      }
      updateScrollState();
    } else {
      automationsList.style.maxHeight = "";
      automationsList.classList.remove("nav-megamenu-scroll", "is-at-bottom");
      const track = automationsList.parentElement.querySelector(".nav-megamenu-scrollbar");
      if (track) track.remove();
    }
  });
}

syncMegaMenuColumnHeights();
window.addEventListener("resize", syncMegaMenuColumnHeights);

// --- Scroll-reveal animations -----------------------------------------------
// Elements with [data-reveal] fade/rise in once they enter the viewport.
// The animation itself (timing, distance) lives in css/style.css — this just
// flips the class at the right moment. Content only becomes invisible once
// .reveal-armed is added here — if this script never runs, elements simply
// never leave their normal, visible default (see the .reveal-armed comment
// in css/style.css for why the hiding is opt-in, not opt-out).
const revealTargets = document.querySelectorAll("[data-reveal]");

if (revealTargets.length && "IntersectionObserver" in window) {
  revealTargets.forEach((el) => el.classList.add("reveal-armed"));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  // No IntersectionObserver support (or nothing to reveal): show everything.
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

// --- Hero entrance animation -------------------------------------------------
// Copied 1:1 from vuewer.com's own hero: fetched their live HTML + compiled
// JS bundle and read the exact Alpine/GSAP values (delays, easings,
// distances — see css/style.css for the full breakdown, next to the CSS
// classes this drives). Their headline uses GSAP for a per-character
// stagger; this project stays vanilla JS, so setupHeroTextAnimation below
// reimplements the same effect — split into words (so a word never
// line-wraps mid-character) then characters, each getting a --char-delay
// custom property (base delay + 0.03s per character, matching GSAP's
// stagger:0.03) that a plain CSS animation reads.
function setupHeroTextAnimation(el, delay = 0) {
  const words = el.textContent.split(/(\s+)/);
  el.textContent = "";
  let charIndex = 0;
  words.forEach((word) => {
    if (word.trim() === "") {
      el.appendChild(document.createTextNode(word));
      return;
    }
    const wordSpan = document.createElement("span");
    wordSpan.className = "text-reveal-word";
    wordSpan.style.display = "inline-block";
    wordSpan.style.whiteSpace = "nowrap";
    [...word].forEach((char) => {
      const charSpan = document.createElement("span");
      charSpan.className = "text-reveal-char";
      charSpan.textContent = char;
      charSpan.style.setProperty("--char-delay", `${(delay + charIndex * 0.03).toFixed(2)}s`);
      charIndex += 1;
      wordSpan.appendChild(charSpan);
    });
    el.appendChild(wordSpan);
  });
}

const heroContent = document.querySelector(".hero-frame-content");
const heroHeading = heroContent ? heroContent.querySelector(".hero-heading-reveal") : null;

if (heroContent) {
  if (heroHeading && !prefersReducedMotion) setupHeroTextAnimation(heroHeading);

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    heroContent.classList.add("is-revealed");
  } else {
    // Only arm the hidden state right before actually observing — this is
    // the homepage's headline/CTA, so it must never be hidden by CSS alone
    // (see .reveal-armed comment in css/style.css).
    heroContent.classList.add("reveal-armed");
    const heroObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    heroObserver.observe(heroContent);
  }
}

// --- Animated stat counters -------------------------------------------------
// Numbers marked with [data-count="N"] count up from 0 to N once the stats
// strip scrolls into view. All counters in the strip start together (one
// observer on the shared container) so they read as a single moment, not a
// trickle. Surrounding text ("jaar", "+", "/5", …) stays in the markup as
// plain text next to the span, untouched by this script.
const statsBar = document.querySelector(".stats-bar");
const countEls = statsBar ? statsBar.querySelectorAll("[data-count]") : [];

function animateCount(el) {
  const target = parseInt(el.getAttribute("data-count"), 10);
  const duration = 900;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(target * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

if (countEls.length) {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    countEls.forEach((el) => {
      el.textContent = el.getAttribute("data-count");
    });
  } else {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            countEls.forEach(animateCount);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    statsObserver.observe(statsBar);
  }
}

// --- Magnetic button hover ---------------------------------------------------
// Reproduced 1:1 from vuewer.com's own buttons — inspected live via DevTools,
// not just the reference doc's summary. Their nav "Start" pill AND their
// body CTAs ("Get Started" / "More Info") are both wrapped in an Alpine
// component (x-data="hoverFollower()") that nudges the whole button a few
// px toward the pointer — horizontal/vertical translate only, no rotation,
// confirmed by watching the real hover on vuewer.com directly (an earlier
// pass here mistakenly added a tilt based on a noisy inline-style reading;
// the button stays level). No shadow either — per request, buttons have no
// hover box-shadow.
//
// Direction always stays up-and-right: on entry the button pops straight
// to its full up-right nudge (not computed from wherever the pointer
// happened to land — an earlier pass here offset from the button's center
// instead, which made the direction depend on entry position and felt
// inconsistent button to button). It then keeps following the cursor as it
// moves inside the button, but that following is clamped to the same
// up-right quadrant (x never goes below 0, y never goes above 0) instead of
// the full ±range an unclamped magnetic pull would allow — so it still
// visibly tracks the pointer without ever drifting down-left and losing
// the consistent demeanor the initial pop established.
//
// The button doesn't jump straight there — it EASES toward it every
// animation frame (current += (target - current) * EASE), which is what
// actually produces vuewer's smooth, slightly-lagging "chase" feel;
// snapping the transform directly on entry (an earlier pass here) reads as
// far too sharp/aggressive by comparison, even though the CSS transition
// while easing is genuinely instant either way — the smoothing itself is
// the lerp loop, not a transition duration. On pointerleave the CSS
// `transition: transform 380ms cubic-bezier(.2,.8,.2,1)` takes over
// instead, matching vuewer's own spring-back exactly.
//
// The "left behind" box: on vuewer, every one of these buttons actually
// sits inside a second, static element exactly its own size (their
// grandparent — see .btn-slot/.header-cta-slot in style.css) that does NOT
// get this transform, so translating just the button visibly slides it out
// of that fixed slot. This only targets the moving button itself; the slot
// is pure CSS and needs no JS.
//
// .header-dashboard-btn (the login icon in the header) gets a plain,
// unbiased version instead — it still tracks the cursor in whatever
// direction it moves, just without the up-right pop/bias above, since a
// bare icon with no slot/fill behind it (see its own CSS comment in
// style.css) doesn't carry that consistent demeanor the same way the
// filled buttons do.
if (!prefersReducedMotion) {
  const SPRING_BACK = "transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1)";
  const EASE = 0.06; // lower = slower/smoother chase, higher = snappier
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Nudge scales with the button's own size so a small icon button gets a
  // proportionally smaller move than a full-width CTA, instead of the same
  // fixed px range for both.
  const maxTranslateFor = (rect) => Math.min(10, Math.min(rect.width, rect.height) * 0.25);

  // Shared easing/reset plumbing for both variants below — onEnter and
  // onMove each return a {x, y} target given the element's current rect
  // (and, for onMove, the pointer event); onEnter is optional (the
  // unbiased variant has no pop, so it's skipped there).
  const setupMagneticHover = (el, { onEnter, onMove }) => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    const tick = () => {
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;
      el.style.transition = "transform 0s";
      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    if (onEnter) {
      el.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        ({ x: targetX, y: targetY } = onEnter(el.getBoundingClientRect()));
        if (rafId === null) rafId = requestAnimationFrame(tick);
      });
    }

    el.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      ({ x: targetX, y: targetY } = onMove(el.getBoundingClientRect(), event));
      if (rafId === null) rafId = requestAnimationFrame(tick);
    });

    const resetTransform = () => {
      targetX = 0;
      targetY = 0;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      currentX = 0;
      currentY = 0;
      el.style.transition = SPRING_BACK;
      el.style.transform = "translate3d(0, 0, 0)";
    };

    el.addEventListener("pointerleave", resetTransform);
    el.addEventListener("pointercancel", resetTransform);
  };

  document.querySelectorAll(".header-cta, .btn-primary, .btn-secondary").forEach((el) => {
    setupMagneticHover(el, {
      onEnter: (rect) => {
        const m = maxTranslateFor(rect);
        return { x: m, y: -m };
      },
      // Keeps following the cursor after the initial pop, but clamped to
      // the up-right quadrant only — the pointer's position just shifts
      // the button somewhere between "centered" (0,0) and "fully popped"
      // (m, -m), never past either end.
      onMove: (rect, event) => {
        const m = maxTranslateFor(rect);
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        return {
          x: clamp(m * 0.6 + relX * 0.25, 0, m),
          y: clamp(-m * 0.6 + relY * 0.25, -m, 0),
        };
      },
    });
  });

  document.querySelectorAll(".header-dashboard-btn").forEach((el) => {
    setupMagneticHover(el, {
      // No onEnter — plain magnetic tracking, unbiased in any direction.
      onMove: (rect, event) => {
        const m = maxTranslateFor(rect);
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        return {
          x: clamp(relX * 0.25, -m, m),
          y: clamp(relY * 0.25, -m, m),
        };
      },
    });
  });
}

// --- FAQ accordion -----------------------------------------------------------
document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
  const panel = document.getElementById(trigger.getAttribute("aria-controls"));
  if (!panel) return;

  trigger.addEventListener("click", () => {
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!isOpen));
    panel.classList.toggle("is-open", !isOpen);
    panel.style.maxHeight = isOpen ? "" : `${panel.scrollHeight}px`;
  });
});

// --- Broken-image safety net --------------------------------------------------
// Any <img> that fails to load at runtime gets hidden so a missing asset
// never leaves a visible broken-image icon. "error" doesn't bubble on
// <img>, so this has to listen on the capture phase.
//
// .blog-figure (a full-width block, not a grid item) collapses entirely —
// safe, since nothing else needs to reflow around it.
//
// .card/.case-card/.blog-card sit in a FIXED-column-count grid
// (grid-template-columns: repeat(3/4, ...) — see .grid-3/.grid-4 in
// style.css), so hiding a whole card would leave an empty trailing cell
// rather than truly redistributing the row — CSS grid doesn't collapse
// fixed tracks just because one item disappears. None of these currently
// hold an image as their only content, so this just hides the broken <img>
// itself and leaves the rest of that card's content (heading/text) in
// place — no half-empty grid cell, nothing to reflow.
//
// .logo-tile is deliberately skipped altogether: the logo marquee's
// infinite-scroll animation depends on every tile staying the same fixed
// width (see .logo-tile comment in style.css) — hiding one would desync
// its duplicated tile sets and break the loop, so a missing logo there
// should be fixed at the source instead of hidden at runtime.
document.addEventListener(
  "error",
  (event) => {
    const img = event.target;
    if (!(img instanceof HTMLImageElement)) return;
    if (img.closest(".logo-tile")) return;

    const figure = img.closest(".blog-figure");
    (figure || img).style.display = "none";
  },
  true
);
