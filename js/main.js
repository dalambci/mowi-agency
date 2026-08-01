/* Mowi — shared vanilla JS behaviour. No framework, no build step.
   Two of the interactions requested for this site (the marquee pause-on-
   hover and smooth-scroll to anchors like #afspraak) are pure CSS —
   `animation-play-state` and `scroll-behavior: smooth` — and don't need any
   JS. See css/style.css for those. */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Mobile nav toggle -----------------------------------------------------
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("main-nav");

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    mainNav.classList.toggle("is-open", !isOpen);
    document.body.style.overflow = isOpen ? "" : "hidden";
  });

  // Close the mobile menu after tapping a link, so navigation feels instant.
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      mainNav.classList.remove("is-open");
      document.body.style.overflow = "";
    });
  });
}

// --- Nav dropdown ("Service") -------------------------------------------------
// Click-to-toggle (not hover-only, so it works the same on touch and mouse).
// The open/closed animation itself is a pure CSS max-height transition keyed
// off aria-expanded — this just flips the attribute.
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

// --- Scroll-reveal animations -----------------------------------------------
// Elements with [data-reveal] fade/rise in once they enter the viewport.
// The animation itself (timing, distance) lives in css/style.css — this just
// flips the class at the right moment.
const revealTargets = document.querySelectorAll("[data-reveal]");

if (revealTargets.length && "IntersectionObserver" in window) {
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
