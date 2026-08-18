/* Mowi — shared vanilla JS (skeleton rebuild, 2026-08-18).
   No framework, no build step. Deliberately tiny: the skeleton site is
   blank pages + chrome, so the only behavior that exists is the header —
   dropdown open/close and the mobile nav sheet. Everything the v2 rebuild
   had beyond this (chat-input auto-play, pill tabs, card strips) was
   removed together with the pages that used it; see git history on
   `master` if any of it is ever wanted back. */

(function () {
  "use strict";

  /* ---- Mobile nav toggle -------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("main-nav");

  function closeMobileNav() {
    if (!navToggle || !mainNav) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Menu openen");
    mainNav.classList.remove("is-open");
    // Unlock background scroll (locked while the mobile sheet is open — the
    // sheet itself scrolls via its own max-height/overflow, mobile only; the
    // hamburger doesn't exist on desktop so this never fires there).
    document.body.classList.remove("nav-open");
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMobileNav();
      } else {
        navToggle.setAttribute("aria-expanded", "true");
        navToggle.setAttribute("aria-label", "Menu sluiten");
        mainNav.classList.add("is-open");
        document.body.classList.add("nav-open");
      }
    });
  }

  /* ---- Dropdowns ------------------------------------------------------------
     Click-driven (hover has no touch equivalent, and click is the only way
     keyboard users can open it). Open/close styling is pure CSS keyed off
     aria-expanded — this only flips the attribute. */
  document.querySelectorAll(".nav-dropdown-trigger").forEach(function (trigger) {
    trigger.addEventListener("click", function (event) {
      event.stopPropagation();
      var isOpen = trigger.getAttribute("aria-expanded") === "true";
      // close any other open dropdown first
      document.querySelectorAll('.nav-dropdown-trigger[aria-expanded="true"]').forEach(function (other) {
        if (other !== trigger) other.setAttribute("aria-expanded", "false");
      });
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  /* Desktop only: the dropdown also opens on hover. Click stays as-is above
     (keyboard + touch). The close runs on a short delay so the pointer can
     cross the 10px gap between the trigger and the panel without it
     collapsing mid-way. */
  var hoverNav = window.matchMedia("(min-width: 64rem) and (hover: hover)");
  document.querySelectorAll(".nav-dropdown").forEach(function (dropdown) {
    var trigger = dropdown.querySelector(".nav-dropdown-trigger");
    if (!trigger) return;
    var closeTimer = null;
    dropdown.addEventListener("mouseenter", function () {
      if (!hoverNav.matches) return;
      clearTimeout(closeTimer);
      trigger.setAttribute("aria-expanded", "true");
    });
    dropdown.addEventListener("mouseleave", function () {
      if (!hoverNav.matches) return;
      closeTimer = setTimeout(function () {
        trigger.setAttribute("aria-expanded", "false");
      }, 120);
    });
  });

  // Clicking anywhere outside an open dropdown closes it.
  document.addEventListener("click", function (event) {
    document.querySelectorAll('.nav-dropdown-trigger[aria-expanded="true"]').forEach(function (trigger) {
      if (!trigger.closest(".nav-dropdown").contains(event.target)) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
    // Same for the mobile nav sheet: a tap anywhere outside the sheet (and
    // outside the hamburger, which toggles it itself) closes it. Desktop is
    // untouched — is-open only ever exists on mobile.
    if (mainNav && mainNav.classList.contains("is-open") &&
        !mainNav.contains(event.target) && !navToggle.contains(event.target)) {
      closeMobileNav();
    }
  });

  /* ---- Marquee cloning ----------------------------------------------------
     Any [data-marquee-clone] track gets its real content duplicated at
     runtime, so a CSS translateX(-50%) loop is seamless — the author only
     ever maintains one copy in HTML. Clones are hidden from assistive tech
     and pulled out of tab order so keyboard/screen-reader users only ever
     reach the real items.

     Copies are added in PAIRS, keeping the total count even, until the
     track is at least twice as wide as its wrapper. That guarantees
     translateX(-50%) — the loop point every marquee keyframe here uses —
     always has real content to show. A single doubling isn't enough for a
     short row (e.g. 6 logos) inside a wide viewport: a reverse-direction
     track starts its animation AT the -50% position, and if one copy is
     narrower than the visible window, that position exposes empty space
     before the loop wraps around — this is what fixes it.

     Every track's animation-duration is then set from MARQUEE_PX_PER_SECOND
     rather than a hardcoded number in CSS, so the integrations rows and the
     workflow-card row always move at the same visual speed — one shared
     constant instead of separately-tuned durations that would silently
     drift out of sync the moment either track's content changes.

     Two hard-won lessons baked in here (both were live bugs, 2026-08-19):

     1. Init runs at window "load", NOT at script parse. The logo <img>s have
        no width/height attributes, so before they load each one measures
        ~0px wide — a parse-time measurement saw a near-empty track, set a
        far-too-short duration, and the logo rows visibly RACED on a cold
        cache (correct again on reload, when images were cached). The card
        strip never raced because its cards are fixed-width CSS boxes.

     2. The loop travel is an exact measured period — the px distance from
        the first original to its first clone — written to --marquee-shift
        and consumed by the marquee-scroll keyframes. The old translateX(-50%)
        loop point was off by half a flex gap every cycle (see the keyframes
        comment in style.css for the math), which is the wrap "flicker" that
        was previously chased on the v2 site and fixed the same way: make the
        wrap land on the same logo so the strip reads as unending. */
  var MARQUEE_PX_PER_SECOND = 41;
  function initMarquees() {
    document.querySelectorAll("[data-marquee-clone]").forEach(function (track) {
      var wrapper = track.parentElement;
      var originals = Array.prototype.slice.call(track.children);
      function appendCopy() {
        originals.forEach(function (node) {
          var clone = node.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          if (clone.matches("a, button")) clone.setAttribute("tabindex", "-1");
          clone.querySelectorAll("a, button").forEach(function (el) {
            el.setAttribute("tabindex", "-1");
          });
          track.appendChild(clone);
        });
      }
      appendCopy(); // always at least 2 copies total
      // Period = one copy + one gap: transform-invariant (both children share
      // the track's transform), so measuring mid-animation is still exact.
      // Rounded to a whole pixel: getBoundingClientRect() returns subpixel
      // floats, and the keyframes always START at the exact integer
      // translateX(0). A fractional --marquee-shift means the wrap lands on
      // a subpixel offset, which resets to 0 (integer) a frame later — a
      // one-frame antialiasing snap that reads as a very faint flicker even
      // though the loop position itself is mathematically exact.
      var period = Math.round(
        track.children[originals.length].getBoundingClientRect().left -
        track.children[0].getBoundingClientRect().left
      );
      // Keep the wrapper full through one full period of travel: the visible
      // window slides [0, period], so the track must overhang by period+width.
      var guard = 0;
      while (track.scrollWidth - period < wrapper.clientWidth + 1 && guard < 8) {
        appendCopy();
        guard++;
      }
      track.style.setProperty("--marquee-shift", -period + "px");
      track.style.animationDuration = (period / MARQUEE_PX_PER_SECOND) + "s";
    });
  }
  if (document.readyState === "complete") {
    initMarquees();
  } else {
    window.addEventListener("load", initMarquees);
  }

  // Escape closes an open dropdown (and the mobile sheet) and restores focus.
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    document.querySelectorAll('.nav-dropdown-trigger[aria-expanded="true"]').forEach(function (trigger) {
      trigger.setAttribute("aria-expanded", "false");
      trigger.focus();
    });
    closeMobileNav();
  });
})();
