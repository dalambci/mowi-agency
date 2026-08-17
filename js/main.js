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
  }

  if (navToggle && mainNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = navToggle.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        closeMobileNav();
      } else {
        navToggle.setAttribute("aria-expanded", "true");
        mainNav.classList.add("is-open");
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

  // Clicking anywhere outside an open dropdown closes it.
  document.addEventListener("click", function (event) {
    document.querySelectorAll('.nav-dropdown-trigger[aria-expanded="true"]').forEach(function (trigger) {
      if (!trigger.closest(".nav-dropdown").contains(event.target)) {
        trigger.setAttribute("aria-expanded", "false");
      }
    });
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
