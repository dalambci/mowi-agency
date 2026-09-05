/* Templates marketplace filtering (2026-09-05) — vanilla JS, no build
   step, mirrors the Mowi Dashboard's own Alpine filtering on the same
   page (resources/views/flows/templates.blade.php) one-to-one: every
   card already carries its own data-tpl-* attributes (kind/industries/
   koppelingen/trigger/search), so filtering is just toggling [hidden] on
   whichever cards don't match the current chip/search state — no XHR, no
   re-render, and every card is visible with JS disabled since [hidden]
   is never set until this file runs.

   URL state (2026-09-05): every active filter is mirrored into the query
   string (?type=&branche=&koppeling=&trigger=&q=) via history.replaceState
   — so a link straight into "workflows for loodgieters" is shareable, and
   the marketplace's own mega-menu links (?type=agents etc.) seed the
   right chip on load without any server involved (this is a static site;
   there is no server-side filtering at all, unlike the dashboard's own
   copy of this page, which pre-resolves per-client availability server-
   side and only filters client-side on top of that).

   type is PLURAL in the URL/chip vocabulary (?type=workflows, matching
   the mega-menu's own "Alle workflows" links and the dashboard's own
   ?type= convention) but SINGULAR on every card (data-tpl-kind="workflow",
   matching App\Templates\MarketplaceCatalog's 'kind' field) — TYPE_TO_KIND/
   KIND_TO_TYPE below are the one translation point, checked in both
   directions (state in, chip/URL out) so this can't drift out of sync
   again the way it did in this file's first draft (confirmed only by
   actually clicking a filter chip and checking which cards were left
   hidden — every card silently failed to match and the grid went empty,
   not by reading the code). */
(function () {
  "use strict";

  var toolbar = document.querySelector("[data-tpl-toolbar]");
  var grid = document.querySelector("[data-tpl-all-grid]");
  if (!toolbar || !grid) return;

  var TYPE_TO_KIND = { agents: "agent", workflows: "workflow", dashboards: "dashboard" };
  var KIND_TO_TYPE = { agent: "agents", workflow: "workflows", dashboard: "dashboards" };

  var searchInput = toolbar.querySelector("[data-tpl-search-input]");
  var chips = Array.prototype.slice.call(toolbar.querySelectorAll("[data-tpl-filter]"));
  var curatedRows = document.querySelectorAll("[data-tpl-curated-row]");
  var emptyState = document.querySelector("[data-tpl-empty]");
  var resultsHeading = document.querySelector("[data-tpl-results-heading]");
  var allCards = Array.prototype.slice.call(grid.querySelectorAll("[data-tpl-card]"));
  var totalCount = allCards.length;

  var params = new URLSearchParams(window.location.search);
  var rawType = params.get("type");
  var state = {
    q: params.get("q") || "",
    type: rawType && TYPE_TO_KIND[rawType] ? TYPE_TO_KIND[rawType] : null,
    branche: params.get("branche"),
    koppeling: params.get("koppeling"),
    trigger: params.get("trigger"),
  };

  function isFiltering() {
    return !!(state.q || state.type || state.branche || state.koppeling || state.trigger);
  }

  function matches(card) {
    var d = card.dataset;
    if (state.type && d.tplKind !== state.type) return false;
    if (state.branche && d.tplIndustries.split(",").indexOf(state.branche) === -1) return false;
    if (state.koppeling && d.tplKoppelingen.split(",").indexOf(state.koppeling) === -1) return false;
    if (state.trigger && d.tplTrigger !== state.trigger) return false;
    if (state.q && d.tplSearch.indexOf(state.q.toLowerCase()) === -1) return false;
    return true;
  }

  /** A chip's own data-tpl-value is plural for the "type" group, singular
      (matching state directly) for every other group — this is the one
      place that distinction is applied, so a chip's pressed state can
      never disagree with what matches() actually filtered on. */
  function chipStateValue(group, rawValue) {
    return group === "type" ? TYPE_TO_KIND[rawValue] || rawValue : rawValue;
  }

  function syncChipStates() {
    chips.forEach(function (chip) {
      var group = chip.getAttribute("data-tpl-filter");
      var value = chipStateValue(group, chip.getAttribute("data-tpl-value"));
      chip.setAttribute("aria-pressed", state[group] === value ? "true" : "false");
    });
  }

  function syncUrl() {
    var next = new URLSearchParams();
    Object.keys(state).forEach(function (key) {
      if (!state[key]) return;
      next.set(key, key === "type" ? KIND_TO_TYPE[state[key]] || state[key] : state[key]);
    });
    var qs = next.toString();
    var url = window.location.pathname + (qs ? "?" + qs : "");
    window.history.replaceState(null, "", url);
  }

  function render() {
    var filtering = isFiltering();
    var visible = 0;

    allCards.forEach(function (card) {
      var show = matches(card);
      card.hidden = !show;
      if (show) visible++;
    });

    curatedRows.forEach(function (row) {
      row.hidden = filtering;
    });

    if (resultsHeading) {
      resultsHeading.textContent = filtering ? "Zoekresultaten" : "Alle templates (" + totalCount + ")";
    }

    if (emptyState) emptyState.hidden = visible !== 0;

    syncChipStates();
    syncUrl();
  }

  if (searchInput) {
    searchInput.value = state.q;
    searchInput.addEventListener("input", function () {
      state.q = searchInput.value;
      render();
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var group = chip.getAttribute("data-tpl-filter");
      var value = chipStateValue(group, chip.getAttribute("data-tpl-value"));
      state[group] = state[group] === value ? null : value;
      render();
    });
  });

  render();
})();
