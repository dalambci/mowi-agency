/* Templates marketplace filtering (2026-09-05; round 2 on 2026-09-06) —
   vanilla JS, no build step. The same algorithm the Mowi Dashboard runs in
   Alpine on its copy of this page (resources/js/tpl-marketplace.js there):
   one pure function of {q, type, branche, koppeling, trigger} over the
   data-tpl-* attributes every card already carries. render() toggles the
   `hidden` attribute per card, recounts every section (an empty section
   hides), computes the facet count each dropdown option shows (how many
   cards remain with that option on top of the OTHER active filters — 0
   makes it unclickable), rebuilds the removable pills, and mirrors the
   state into the URL with history.replaceState so a link into "workflows
   for a kapper" is shareable and the mega-menu's ?type= links seed the
   right control on load. With JS disabled every card and the build-time
   counts simply stay as generated.

   The `hidden` attribute only works because css/templates.css carries an
   explicit `.tpl-card[hidden]{display:none}`: an author `display:flex` on
   the card beats the browser's own [hidden] rule, which is exactly what
   made every filter on this page a no-op on 2026-09-05 — the attribute
   was set correctly and nothing moved. Verify filtering on RENDERED
   visibility (offsetParent), never on the attribute.

   type is PLURAL in the URL vocabulary (?type=workflows, the mega-menu's
   "Alle workflows" links) but SINGULAR on every card (data-tpl-kind=
   "workflow", App\Templates\MarketplaceCatalog's own 'kind'); the singular
   is accepted in the URL as a synonym. TYPE_TO_KIND/KIND_TO_TYPE below are
   the one translation point. */
(function () {
  "use strict";

  var root = document.querySelector("[data-tpl-marketplace]");
  if (!root) return;

  var TYPE_TO_KIND = { agents: "agent", workflows: "workflow", dashboards: "dashboard" };
  var KIND_TO_TYPE = { agent: "agents", workflow: "workflows", dashboard: "dashboards" };
  var GROUPS = ["branche", "koppeling", "trigger"];

  var searchInput = document.querySelector('[data-tpl-filter="q"]');
  var typeButtons = toArray(root.querySelectorAll('[data-tpl-filter="type"]'));
  var options = toArray(root.querySelectorAll('[role="option"][data-tpl-filter]'));
  var dropdowns = toArray(root.querySelectorAll("[data-tpl-dd]"));
  var sections = toArray(root.querySelectorAll("[data-tpl-section]"));
  var activeRow = root.querySelector("[data-tpl-active]");
  var pillsHost = root.querySelector("[data-tpl-pills]");
  var totalEl = root.querySelector("[data-tpl-total]");
  var emptyState = root.querySelector("[data-tpl-empty]");

  // Every card's attributes read once; matching later is pure array work.
  var cards = toArray(root.querySelectorAll("[data-tpl-card]")).map(function (el) {
    return {
      el: el,
      kind: el.getAttribute("data-tpl-kind"),
      industries: split(el.getAttribute("data-tpl-industries")),
      koppelingen: split(el.getAttribute("data-tpl-koppelingen")),
      trigger: el.getAttribute("data-tpl-trigger") || "",
      search: el.getAttribute("data-tpl-search") || "",
    };
  });

  // Labels for pills and the dropdown buttons come from the option text —
  // one source for chips, pills and URL.
  var labels = { branche: {}, koppeling: {}, trigger: {} };
  options.forEach(function (opt) {
    var labelEl = opt.querySelector("[data-tpl-label]");
    labels[opt.getAttribute("data-tpl-filter")][opt.getAttribute("data-tpl-value")] = labelEl ? labelEl.textContent.trim() : opt.getAttribute("data-tpl-value");
  });

  var params = new URLSearchParams(window.location.search);
  var rawType = params.get("type");
  var state = {
    q: params.get("q") || "",
    type: TYPE_TO_KIND[rawType] || (KIND_TO_TYPE[rawType] ? rawType : null),
    branche: params.get("branche"),
    koppeling: params.get("koppeling"),
    trigger: params.get("trigger"),
  };
  // An unknown value in the URL is ignored, never left dangling in the state.
  GROUPS.forEach(function (group) {
    if (state[group] && !labels[group][state[group]]) state[group] = null;
  });

  function toArray(list) {
    return Array.prototype.slice.call(list);
  }
  function split(value) {
    return (value || "").split(",").filter(Boolean);
  }

  function isFiltering() {
    return !!(state.q.trim() || state.type || state.branche || state.koppeling || state.trigger);
  }

  function matches(card, s) {
    if (s.type && card.kind !== s.type) return false;
    if (s.branche && card.industries.indexOf(s.branche) === -1) return false;
    if (s.koppeling && card.koppelingen.indexOf(s.koppeling) === -1) return false;
    if (s.trigger && card.trigger !== s.trigger) return false;
    var needle = s.q.trim().toLowerCase();
    if (needle && card.search.indexOf(needle) === -1) return false;
    return true;
  }

  function withOption(group, value) {
    var probe = {};
    Object.keys(state).forEach(function (key) { probe[key] = state[key]; });
    probe[group] = value;
    return probe;
  }

  function facet(group, value) {
    var probe = withOption(group, value);
    return cards.filter(function (card) { return matches(card, probe); }).length;
  }

  function render() {
    var filtering = isFiltering();
    var total = 0;
    var counts = {};

    cards.forEach(function (card) {
      var show = matches(card, state);
      card.el.hidden = !show;
      if (show) {
        total++;
        counts[card.kind] = (counts[card.kind] || 0) + 1;
      }
    });

    sections.forEach(function (section) {
      var kind = section.getAttribute("data-tpl-section");
      var count = counts[kind] || 0;
      var countEl = section.querySelector("[data-tpl-count]");
      if (countEl) countEl.textContent = String(count);
      section.hidden = count === 0;
    });

    options.forEach(function (opt) {
      var group = opt.getAttribute("data-tpl-filter");
      var value = opt.getAttribute("data-tpl-value");
      var n = facet(group, value);
      var countEl = opt.querySelector(".tpl-dd-count");
      if (countEl) countEl.textContent = String(n);
      opt.setAttribute("aria-selected", state[group] === value ? "true" : "false");
      opt.setAttribute("aria-disabled", state[group] !== value && n === 0 ? "true" : "false");
    });

    typeButtons.forEach(function (button) {
      var value = TYPE_TO_KIND[button.getAttribute("data-tpl-value")] || null;
      button.setAttribute("aria-pressed", state.type === value ? "true" : "false");
    });

    dropdowns.forEach(function (dd) {
      var group = dd.getAttribute("data-tpl-dd");
      var button = dd.querySelector(".tpl-dd-btn");
      var labelEl = dd.querySelector("[data-tpl-dd-label]");
      if (labelEl) labelEl.textContent = state[group] ? labels[group][state[group]] : labelEl.getAttribute("data-tpl-dd-default");
      if (button) button.classList.toggle("is-set", !!state[group]);
    });

    if (pillsHost) {
      pillsHost.innerHTML = "";
      GROUPS.forEach(function (group) {
        if (!state[group]) return;
        var pill = document.createElement("button");
        pill.type = "button";
        pill.className = "tpl-pill";
        pill.setAttribute("data-tpl-clear", group);
        pill.innerHTML = '<span></span><span aria-hidden="true">&times;</span><span class="visually-hidden">verwijderen</span>';
        pill.firstChild.textContent = labels[group][state[group]];
        pillsHost.appendChild(pill);
      });
    }
    if (totalEl) totalEl.textContent = String(total);
    if (activeRow) activeRow.hidden = !filtering;
    if (emptyState) emptyState.hidden = !(filtering && total === 0);

    syncUrl();
  }

  function syncUrl() {
    var next = new URLSearchParams();
    if (state.q.trim()) next.set("q", state.q.trim());
    if (state.type) next.set("type", KIND_TO_TYPE[state.type] || state.type);
    GROUPS.forEach(function (group) { if (state[group]) next.set(group, state[group]); });
    var qs = next.toString();
    var url = window.location.pathname + (qs ? "?" + qs : "");
    if (url !== window.location.pathname + window.location.search) window.history.replaceState(null, "", url);
  }

  function clear(group) {
    if (group) {
      state[group] = null;
    } else {
      state.q = "";
      if (searchInput) searchInput.value = "";
      state.type = null;
      GROUPS.forEach(function (key) { state[key] = null; });
    }
    render();
  }

  /* ---- Dropdowns: open/close is pure CSS keyed off aria-expanded (the same
     idiom the header's Product menu uses in js/main.js); this flips the
     attribute, closes the others, moves focus into the list on open and
     back to the button on close. ---- */
  function menuOf(dd) { return dd.querySelector(".tpl-dd-menu"); }
  function buttonOf(dd) { return dd.querySelector(".tpl-dd-btn"); }

  function closeMenu(dd, refocus) {
    var button = buttonOf(dd);
    if (button.getAttribute("aria-expanded") !== "true") return;
    button.setAttribute("aria-expanded", "false");
    if (refocus) button.focus();
  }
  function closeAll(except) {
    dropdowns.forEach(function (dd) { if (dd !== except) closeMenu(dd, false); });
  }
  function openMenu(dd) {
    closeAll(dd);
    buttonOf(dd).setAttribute("aria-expanded", "true");
    var menu = menuOf(dd);
    var target = menu.querySelector('[role="option"][aria-selected="true"]') || menu.querySelector('[role="option"]:not([aria-disabled="true"])');
    if (target) target.focus();
  }

  dropdowns.forEach(function (dd) {
    var button = buttonOf(dd);
    var menu = menuOf(dd);
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      if (button.getAttribute("aria-expanded") === "true") closeMenu(dd, true);
      else openMenu(dd);
    });
    // Arrow keys walk the enabled options; Tab works natively (real buttons).
    menu.addEventListener("keydown", function (event) {
      if (["ArrowDown", "ArrowUp", "Home", "End"].indexOf(event.key) === -1) return;
      var enabled = toArray(menu.querySelectorAll('[role="option"]:not([aria-disabled="true"])'));
      if (enabled.length === 0) return;
      event.preventDefault();
      var current = enabled.indexOf(document.activeElement);
      var next = 0;
      if (event.key === "ArrowDown") next = current < 0 ? 0 : Math.min(current + 1, enabled.length - 1);
      if (event.key === "ArrowUp") next = current < 0 ? enabled.length - 1 : Math.max(current - 1, 0);
      if (event.key === "End") next = enabled.length - 1;
      enabled[next].focus();
    });
  });

  options.forEach(function (opt) {
    opt.addEventListener("click", function () {
      var group = opt.getAttribute("data-tpl-filter");
      var value = opt.getAttribute("data-tpl-value");
      if (opt.getAttribute("aria-disabled") === "true") return;
      // Single-select per group: picking the selected option again clears it.
      state[group] = state[group] === value ? null : value;
      render();
      closeMenu(opt.closest("[data-tpl-dd]"), true);
    });
  });

  document.addEventListener("click", function (event) {
    dropdowns.forEach(function (dd) {
      if (!dd.contains(event.target)) closeMenu(dd, false);
    });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    dropdowns.forEach(function (dd) { closeMenu(dd, true); });
  });

  typeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      state.type = TYPE_TO_KIND[button.getAttribute("data-tpl-value")] || null;
      render();
    });
  });

  // Pills (rebuilt per render) and both "Wis filters" buttons, delegated.
  root.addEventListener("click", function (event) {
    var clearer = event.target.closest("[data-tpl-clear]");
    if (!clearer) return;
    clear(clearer.getAttribute("data-tpl-clear") || null);
  });

  if (searchInput) {
    searchInput.value = state.q;
    searchInput.addEventListener("input", function () {
      state.q = searchInput.value;
      render();
    });
  }

  render();
})();
