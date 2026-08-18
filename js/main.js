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

  /* ---- Card strip (workflow slider) drag-to-scroll -----------------------
     Native touch/wheel scroll already works for free — this only adds
     click-and-drag for mouse/trackpad, same pattern as any horizontal
     media rail. */
  document.querySelectorAll("[data-card-strip]").forEach(function (track) {
    var isDown = false;
    var startX = 0;
    var startScroll = 0;

    track.addEventListener("pointerdown", function (event) {
      if (event.pointerType === "touch") return;
      isDown = true;
      startX = event.clientX;
      startScroll = track.scrollLeft;
      track.classList.add("is-dragging");
    });

    track.addEventListener("pointermove", function (event) {
      if (!isDown) return;
      track.scrollLeft = startScroll - (event.clientX - startX);
    });

    function endDrag() {
      isDown = false;
      track.classList.remove("is-dragging");
    }

    track.addEventListener("pointerup", endDrag);
    track.addEventListener("pointerleave", endDrag);
    track.addEventListener("pointercancel", endDrag);
  });

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
