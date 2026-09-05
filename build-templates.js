/* Templates marketplace build script (2026-09-05) — not part of the
   shipped site's runtime, same status as build-blog.js/serve.js/
   screenshot.js (local dev tooling only). Reads content/templates/
   templates.json (exported from the Mowi Dashboard via
   `php artisan mowi:export-templates` — see that command's own docblock)
   and writes templates.html (the marketplace grid) plus one
   templates/<slug>.html per template, all plain static HTML with zero
   runtime Node dependency, matching build-blog.js's own "no build step
   for the shipped site" rule.

   This is the sync mechanism between the two apps: no runtime fetch (the
   website is a plain static site, see CLAUDE.md), so a template change
   in the dashboard requires re-running the export + this script + a
   redeploy, same cadence as any other content change on this site.

   Run with: node build-templates.js
   Update flow: dashboard session runs `php artisan mowi:export-templates`,
   copies the output to content/templates/templates.json, then this. */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const DATA_PATH = path.join(ROOT, "content", "templates", "templates.json");
const DETAIL_DIR = path.join(ROOT, "templates");
const SITE_URL = "https://mowi.agency";

// Same derivation as build-blog.js's own CSS_VERSION — read from
// index.html rather than hand-maintained, so this generator can never
// silently ship a stale cache-bust value. See that file's own comment for
// the 2026-08-11 incident this pattern exists to prevent.
function readVersion(pattern, file) {
  const html = fs.readFileSync(path.join(ROOT, file), "utf8");
  const match = html.match(pattern);
  if (!match) throw new Error(`build-templates: no match for ${pattern} in ${file}`);
  return match[1];
}
const CSS_VERSION = readVersion(/css\/style\.css\?v=([0-9-]+)/, "index.html");
// workflow-canvas.css/.js are deliberately left UNCHANGED by this build
// (the marketplace grid/card chrome lives in its own new templates.css
// instead). CSS is still read dynamically, from index.html (which also
// loads it, for the homepage's own static canvas pictures, and is never
// touched by this script) rather than from templates.html itself -- the
// index page THIS script generates never loads workflow-canvas.css/.js at
// all (only the detail pages under templates/ need the interactive
// canvas), so reading from the page being regenerated would be circular
// on a second run. workflow-canvas.js has no other page to read from
// (it was loaded ONLY by templates.html before this rewrite) -- hardcoded
// to its current, unit-changed value; bump this literal by hand if that
// file is ever edited (it is deliberately NOT touched by this pass -- see
// this file's header comment).
const WF_CSS_VERSION = readVersion(/workflow-canvas\.css\?v=([0-9-]+)/, "index.html");
const WF_JS_VERSION = "20260904-6";
// This file's OWN two new assets get one shared version, bumped whenever
// either changes — same "one value per file-pair, bump together" rule
// the rest of the site's cache-busting convention already follows.
const TPL_ASSET_VERSION = "20260905-1";

// ---------------------------------------------------------------------------
// Escaping — every field below can eventually carry CLIENT-authored text
// (the "Mijn templates" / community submission work this marketplace is
// built toward), so every interpolation is escaped from day one rather
// than only once that ships. build-blog.js's own renderInline() does NOT
// do this (it trusts its own Markdown source files) — this generator
// deliberately does not reuse that assumption.
// ---------------------------------------------------------------------------
function esc(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Dutch copywriting rule (site CLAUDE.md, "Copywriting voice"): no em
// dashes in prose. Template copy is DASHBOARD-authored (config/
// agent_templates.php etc., a separate repo with its own conventions),
// so this is a soft warning collected and printed at the end, not a
// build-blocking throw -- a marketing tagline written before this site's
// own style rule existed is a copy-review item, not a reason to fail the
// whole site build. (A hard throw stays appropriate for structural
// invariants this script itself owns -- see main()'s slug checks below.)
const emDashWarnings = [];
function assertNoEmDash(value, where) {
  if (typeof value === "string" && value.indexOf("—") !== -1) {
    emDashWarnings.push(`${where}: "${value}"`);
  }
}

// ---------------------------------------------------------------------------
// Chrome — own copies of build-blog.js's headerHtml()/footerHtml(),
// same house style (each generator owns its own chrome function; see
// build-blog.js's own header comment on why duplication here beats a
// shared module at this repo's size). Two real, pre-existing bugs fixed
// in passing while copying this: the mega-menu's "Alle X" links now point
// at the marketplace pre-filtered by type, and its four workflow-section
// deep links (#order-status etc.) — which pointed at ids that do not
// exist on /workflows, a dead link on every page that loads this chrome
// today — now point at their real template detail pages instead.
// ---------------------------------------------------------------------------
function headerHtml(activeHref) {
  const current = (href) => (href === activeHref ? ' aria-current="page"' : "");
  return `  <header class="site-header">
    <div class="header-bar">
      <a href="/" class="wordmark" aria-label="Mowi - home">
        <img src="/assets/mowi-icon.png" alt="" class="wordmark-icon" />
        <img src="/assets/mowi-wordmark.png" alt="Mowi" class="wordmark-text" />
      </a>

      <nav class="main-nav" id="main-nav" aria-label="Hoofdmenu">
        <ul>
          <li><a href="/zo-werkt-het">Zo werkt het</a></li>
          <li class="nav-dropdown">
            <button type="button" class="nav-dropdown-trigger" aria-expanded="false" aria-controls="product-menu" aria-haspopup="true">
              Product
              <span class="nav-dropdown-icon" aria-hidden="true"></span>
            </button>
            <div class="nav-menu" id="product-menu">
              <div class="nav-menu-col">
                <ul class="nav-menu-item-grid">
                  <li class="nav-menu-heading">Agents</li>
                  <li class="nav-menu-item-full"><a href="/templates?type=agents"><span class="nav-menu-item-title">Alle agents</span><span class="nav-menu-item-desc">Het volledige overzicht van alle Mowi-agents</span></a></li>
                  <li><a href="/e-mail-agent"><span class="nav-menu-item-title">Inbox agent</span><span class="nav-menu-item-desc">Sorteert en beantwoordt uw e-mail</span></a></li>
                  <li><a href="/call-agent"><span class="nav-menu-item-title">Voice agent</span><span class="nav-menu-item-desc">Neemt binnenkomende gesprekken aan</span></a></li>
                </ul>
              </div>
              <div class="nav-menu-col nav-menu-col-divider">
                <ul class="nav-menu-item-grid">
                  <li class="nav-menu-heading">Workflows</li>
                  <li class="nav-menu-item-full"><a href="/templates?type=workflows"><span class="nav-menu-item-title">Alle workflows</span><span class="nav-menu-item-desc">Het volledige overzicht van wat Mowi automatiseert</span></a></li>
                  <li><a href="/templates/dagelijkse-nieuwe-bestellingen"><span class="nav-menu-item-title">Orderstatus</span><span class="nav-menu-item-desc">Zoekt bestellingen op in uw webshop</span></a></li>
                  <li><a href="/templates/openstaande-factuur-signaal"><span class="nav-menu-item-title">Offerte-opvolging</span><span class="nav-menu-item-desc">Controleert en volgt offertes en facturen op</span></a></li>
                  <li><a href="/templates/dagelijkse-afspraken"><span class="nav-menu-item-title">Agenda-samenvatting</span><span class="nav-menu-item-desc">Uw agenda samengevat, op uw tijdstip</span></a></li>
                  <li><a href="/templates/klant-opzoeken"><span class="nav-menu-item-title">CRM-synchronisatie</span><span class="nav-menu-item-desc">Herkent klanten en houdt uw CRM bij</span></a></li>
                </ul>
              </div>
              <div class="nav-menu-col nav-menu-col-divider">
                <ul class="nav-menu-item-grid">
                  <li class="nav-menu-heading">Dashboards</li>
                  <li class="nav-menu-item-full"><a href="/templates?type=dashboards"><span class="nav-menu-item-title">Alle dashboards</span><span class="nav-menu-item-desc">Het volledige overzicht van al uw dashboards</span></a></li>
                  <li><a href="/templates/directie-overzicht"><span class="nav-menu-item-title">Directie overzicht</span><span class="nav-menu-item-desc">De cijfers waar een eigenaar op stuurt</span></a></li>
                  <li><a href="/templates/webshops-vergelijken"><span class="nav-menu-item-title">Webshops vergelijken</span><span class="nav-menu-item-desc">Kerncijfers per webshop naast elkaar</span></a></li>
                  <li><a href="/templates/openstaande-facturen"><span class="nav-menu-item-title">Openstaande facturen</span><span class="nav-menu-item-desc">Welke facturen aandacht nodig hebben</span></a></li>
                  <li><a href="/templates/winstgevendheid"><span class="nav-menu-item-title">Winstgevendheid</span><span class="nav-menu-item-desc">Marge op basis van uw eigen kostprijzen</span></a></li>
                </ul>
              </div>
            </div>
          </li>
          <li><a href="/templates"${current("/templates")}>Templates</a></li>
          <li><a href="/pricing">Prijzen</a></li>
          <li class="nav-mobile-actions"><a href="https://my.mowi.agency/login">Inloggen</a></li>
          <li class="nav-mobile-actions"><a href="https://my.mowi.agency/aanmelden" class="btn-primary" data-event="Signup Click">Start gratis</a></li>
        </ul>
      </nav>

      <div class="header-actions">
        <a href="https://my.mowi.agency/login" class="header-login">Inloggen</a>
        <a href="https://my.mowi.agency/aanmelden" class="btn-primary" data-event="Signup Click">Start gratis</a>
      </div>

      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="main-nav" aria-label="Menu openen">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
`;
}

function footerHtml(extraScripts) {
  return `  <footer class="footer-wrap">
    <div class="container">

      <div class="footer-cta">
        <h2 class="footer-cta-title">Vertel het en<br />Mowi regelt het</h2>
        <a href="https://my.mowi.agency/aanmelden" class="btn-primary" data-event="Signup Click">Start gratis</a>
      </div>

      <div class="footer-panel">
        <div class="footer-top">
          <div class="footer-brand">
            <a href="/" class="wordmark" aria-label="Mowi - home">
              <img src="/assets/mowi-icon.png" alt="" class="wordmark-icon" />
              <img src="/assets/mowi-wordmark.png" alt="Mowi" class="wordmark-text" />
            </a>
            <p class="footer-tagline">Automatisering voor het MKB.<br />Altijd eerst op proef.</p>
            <a href="#" class="footer-social" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg></a>
          </div>

          <nav class="footer-menus" aria-label="Footer">
            <div>
              <h3 class="footer-menu-heading">Product</h3>
              <ul>
                <li><a href="/workflows">Alle workflows</a></li>
                <li><a href="/templates">Templates</a></li>
                <li><a href="/koppelingen">Koppelingen</a></li>
                <li><a href="/pricing">Prijzen</a></li>
              </ul>
            </div>
            <div>
              <h3 class="footer-menu-heading">Bronnen</h3>
              <ul>
                <li><a href="/docs/">Documentatie</a></li>
                <li><a href="/blog/">Blog</a></li>
                <li><a href="/zo-werkt-het">Zo werkt het</a></li>
                <li><a href="/security">Security</a></li>
                <li><a href="/ai-transparantie">AI-transparantie</a></li>
              </ul>
            </div>
            <div>
              <h3 class="footer-menu-heading">Contact</h3>
              <ul>
                <li><a href="tel:+31853335800">+31 85 333 58 00</a></li>
                <li><a href="mailto:contact@mowi.agency">contact@mowi.agency</a></li>
                <li><a href="/demo">Contact sales</a></li>
              </ul>
            </div>
          </nav>
        </div>

        <div class="footer-bottom">
          <span>&copy; 2026 Mowi. Alle rechten voorbehouden.</span>
          <div class="footer-legal">
            <a href="/algemene-voorwaarden">Algemene voorwaarden</a>
            <a href="/privacyverklaring">Privacyverklaring</a>
            <a href="/cookies">Cookies</a>
            <a href="/bedrijfsgegevens">Bedrijfsgegevens</a>
            <a href="/subverwerkers">Subverwerkers</a>
            <img src="/assets/badges/gdpr.png" alt="GDPR" class="footer-badge" width="36" height="36" />
          </div>
        </div>
      </div>

    </div>
  </footer>
  <script src="/js/main.js?v=${CSS_VERSION}"></script>
${extraScripts || ""}`;
}

// ---------------------------------------------------------------------------
// Canvas rendering — mirrors resources/views/components/workflow-canvas.
// blade.php's own markup exactly (both the interactive and size="static"
// branches), so a template dumped here renders identically to its
// dashboard counterpart. Node icon paths are copied verbatim from that
// file's own $icon closure (stroke-width 1.75 here, matching every other
// hand-written canvas already on this site, vs. the dashboard's 1.8 — a
// pre-existing, deliberate difference between the two copies, not
// something this generator introduces).
// ---------------------------------------------------------------------------
const NODE_ICONS = {
  start: '<circle cx="12" cy="12" r="7" fill="none"/><circle cx="12" cy="12" r="2.3" fill="currentColor" stroke="none"/>',
  decision: '<circle cx="12" cy="12" r="8.5"/><path d="M9.3 9.3a2.7 2.7 0 1 1 3.6 2.5c-.8.3-1 .9-1 1.7"/><circle cx="12" cy="16.7" r=".3" fill="currentColor"/>',
  tool: '<path d="M4 7.5h8M18.5 7.5H20M4 16.5h2M12.5 16.5H20"/><circle cx="15" cy="7.5" r="2.3"/><circle cx="9" cy="16.5" r="2.3"/>',
  human: '<circle cx="12" cy="8.5" r="3"/><path d="M5.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6"/>',
  end: '<circle cx="12" cy="12" r="8.5"/><path d="M9 12.2l2 2 4-4.4"/>',
  talk: '<rect x="3.5" y="4.5" width="17" height="12" rx="3"/><path d="M8 16.5v3.5l4.5-3.5"/>',
};
function nodeIcon(kind) {
  return NODE_ICONS[kind] || NODE_ICONS.talk;
}

let markerCounter = 0;
function nextUid() {
  markerCounter += 1;
  return "wftpl" + markerCounter;
}

function renderNode(node, wrapClamp) {
  const body = wrapClamp
    ? `<span class="wf-clamp">${esc(node.text)}</span>`
    : esc(node.text);
  return `<div class="wf-node wf-node-${esc(node.kind)}" style="left:${node.x}px;top:${node.y}px;width:${node.w}px;height:${node.h}px">
  <div class="wf-node-head">
    <span class="wf-node-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${nodeIcon(node.kind)}</svg></span>
    <span class="wf-node-title">${esc(node.title)}</span>
  </div>
  <div class="wf-node-body" title="${esc(node.text)}">${body}</div>
</div>`;
}

function renderEdgesSvg(uid, graph) {
  const markerPath = `<path d="M0,0 L10,5 L0,10 z" fill="var(--wf-edge)" />`;
  const paths = graph.edges
    .map((e) => `<path d="${e.path}" class="wf-edge-path" marker-end="url(#${uid}-arrow)" />`)
    .join("");
  return `<svg class="wf-edges" width="${graph.width}" height="${graph.height}" aria-hidden="true"><defs><marker id="${uid}-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">${markerPath}</marker></defs>${paths}</svg>`;
}

function renderEdgeLabels(graph) {
  return graph.edges
    .filter((e) => e.label)
    .map((e) => `<span class="wf-edge-label" style="left:${e.label_x}px;top:${e.label_y}px" title="${esc(e.label)}">${esc(e.label)}</span>`)
    .join("\n");
}

/** Static, non-interactive crop for a card and for the "no build" fallback — never loads workflow-canvas.js. */
function renderCanvasStatic(template) {
  const graph = template.graph;
  const uid = nextUid();
  const wide = graph.width > 600 ? " wf-canvas-static-wide" : "";
  return `<div class="wf-canvas wf-canvas-static${wide}" style="--wf-win:${template.crop.win}px;--wf-off:${template.crop.off}px" aria-hidden="true">
  <div class="wf-viewport"><div class="wf-stage" style="width:${graph.width}px;height:${graph.height}px">
    ${renderEdgesSvg(uid, graph)}
    ${renderEdgeLabels(graph)}
    ${graph.nodes.map((n) => renderNode(n, true)).join("\n    ")}
  </div></div>
</div>`;
}

/** Full interactive canvas for a detail page — needs js/workflow-canvas.js, already loaded on every page in templates/. */
function renderCanvasInteractive(template) {
  const graph = template.graph;
  const uid = nextUid();
  return `<div class="wf-canvas" data-wf-canvas data-wf-fit="fit" role="group" aria-label="${esc(template.label)}">
  <div class="wf-viewport" data-wf-viewport tabindex="0">
    <div class="wf-stage" data-wf-stage style="width:${graph.width}px;height:${graph.height}px">
      ${renderEdgesSvg(uid, graph)}
      ${renderEdgeLabels(graph)}
      ${graph.nodes.map((n) => renderNode(n, false)).join("\n      ")}
    </div>
  </div>
  <div class="wf-zoom-controls" role="group" aria-label="Zoom">
    <button type="button" data-wf-zoom-out aria-label="Uitzoomen" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.35-4.35M8 10.5h5"/></svg></button>
    <button type="button" data-wf-zoom-reset aria-label="Passend maken" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>
    <button type="button" data-wf-zoom-in aria-label="Inzoomen" tabindex="-1"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.35-4.35M10.5 8v5M8 10.5h5"/></svg></button>
  </div>
  <span class="wf-hint" data-wf-hint>Sleep om te verkennen — scroll om te zoomen</span>
</div>`;
}

function renderDashMock(tiles) {
  return `<div class="tpl-dash-mock" aria-hidden="true">
  ${tiles
    .map(
      (t) => `<div class="tpl-dash-tile tpl-dash-tile-${esc(t.size || "small")}">
    <span class="tpl-dash-tile-title">${esc(t.title)}</span>
    <span class="tpl-dash-tile-body"></span>
  </div>`
    )
    .join("\n  ")}
</div>`;
}

function cardVisual(template) {
  if (template.graph) return renderCanvasStatic(template);
  if (template.tiles) return renderDashMock(template.tiles);
  return "";
}

const KIND_LABELS = { agent: "Agent", workflow: "Workflow", dashboard: "Dashboard" };

/** Every current template's CTA — see this file's own header comment on
    why this points at plain signup rather than a template-preloaded deep
    link: that needs a public dashboard-side route (/templates/<key>/start)
    that does not exist yet. Not a regression — this is exactly what the
    live page's own CTA already does today. */
const SIGNUP_URL = "https://my.mowi.agency/aanmelden";

function renderCard(template) {
  // Only prose fields are checked, not 'label' — a card/detail-page label
  // like "Voice agent — Loodgieter" (type — branche) is dashboard-owned
  // compound-title data, not written prose the site's own "no em dash"
  // copywriting rule was ever meant to police (that rule targets sentences,
  // e.g. this file's own summary/tagline fields below).
  assertNoEmDash(template.tagline || template.summary, `template ${template.key} summary`);

  const platformsHtml =
    template.needs.platforms.length > 0
      ? `<div class="tpl-card-platforms">${template.needs.platforms
          .slice(0, 4)
          .map((p) => `<img src="/assets/logos/${esc(p)}.svg" alt="" class="tpl-card-platform-icon" onerror="this.remove()" />`)
          .join("")}</div>`
      : "";

  const statusClass = template.status !== "live" ? "tpl-chip-off" : "tpl-chip-on";
  const statusLabel = template.status !== "live" ? "Binnenkort" : "Beschikbaar";

  return `<a href="/templates/${esc(template.slug)}" class="tpl-card" data-tpl-card data-tpl-kind="${esc(template.kind)}" data-tpl-industries="${esc(template.industries.join(","))}" data-tpl-koppelingen="${esc(template.needs.platforms.join(","))}" data-tpl-trigger="${esc((template.trigger && template.trigger.kind) || "")}" data-tpl-search="${esc((template.label + " " + (template.tagline || "") + " " + template.summary).toLowerCase())}">
  <div class="tpl-card-visual">${cardVisual(template)}</div>
  <div class="tpl-card-body">
    <div class="tpl-card-meta">
      <span class="tpl-chip tpl-chip-kind">${KIND_LABELS[template.kind]}</span>
      <span class="tpl-chip ${statusClass}">${statusLabel}</span>
    </div>
    <h3 class="tpl-card-title">${esc(template.label)}</h3>
    <p class="tpl-card-summary">${esc(template.tagline || template.summary)}</p>
    ${platformsHtml}
  </div>
</a>`;
}

function promptFor(template) {
  if (template.kind === "agent") return `Pas het template "${template.label}" voor mij toe.`;
  if (template.kind === "workflow") return `Bouw de automatisering "${template.label}" voor mij.`;
  return `Bouw het dashboard "${template.label}" voor mij.`;
}

function renderIndexPage(templates) {
  const koppelingen = Array.from(new Set(templates.flatMap((t) => t.needs.platforms))).sort();
  const featured = templates.filter((t) => t.status === "live" && t.featured).slice(0, 8);
  const communityCount = templates.filter((t) => t.source === "community").length;
  const heroSub =
    communityCount > 0
      ? "Agents, workflows en dashboards gebouwd met Mowi, door de Mowi-community en door Mowi zelf. Kies er een, Mowi zet hem klaar in uw account."
      : "Agents, workflows en dashboards die Mowi voor u bouwt. Kies er een, Mowi zet hem klaar in uw account.";

  const typeChip = (value, label) =>
    `<button type="button" class="tpl-filter-chip" data-tpl-filter="type" data-tpl-value="${value}" aria-pressed="false">${label}</button>`;
  const brancheOrder = [];
  templates.forEach((t) => t.industry_labels.forEach((label, i) => brancheOrder.push([t.industries[i], label])));
  const brancheMap = new Map(brancheOrder);
  const brancheChips = Array.from(brancheMap.entries())
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map(([key, label]) => `<button type="button" class="tpl-filter-chip" data-tpl-filter="branche" data-tpl-value="${esc(key)}" aria-pressed="false">${esc(label)}</button>`)
    .join("\n        ");
  const koppelingChips = koppelingen
    .map((key) => `<button type="button" class="tpl-filter-chip" data-tpl-filter="koppeling" data-tpl-value="${esc(key)}" aria-pressed="false">${esc(key.replace(/_/g, " "))}</button>`)
    .join("\n        ");

  const featuredRow =
    featured.length > 0
      ? `<div class="tpl-row" data-tpl-curated-row>
      <div class="tpl-row-head"><h2>Aanbevolen</h2></div>
      <div class="tpl-grid">
        ${featured.map(renderCard).join("\n        ")}
      </div>
    </div>`
      : "";

  const allGrid = templates.map(renderCard).join("\n        ");

  return `<!-- Generated by build-templates.js from content/templates/templates.json — do not hand-edit. -->
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Templates — Mowi</title>
  <meta name="description" content="Agents, workflows en dashboards die Mowi voor u bouwt. Kies een template en zet hem in minuten klaar in uw eigen account." />
  <link rel="canonical" href="${SITE_URL}/templates" />
  <meta property="og:title" content="Templates — Mowi" />
  <meta property="og:description" content="Agents, workflows en dashboards die Mowi voor u bouwt." />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&family=Inter+Tight:wght@600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css?v=${CSS_VERSION}" />
  <link rel="stylesheet" href="/css/workflow-canvas.css?v=${WF_CSS_VERSION}" />
  <link rel="stylesheet" href="/css/templates.css?v=${TPL_ASSET_VERSION}" />
  <link rel="icon" href="/assets/icon-192.png?v=20260904-3" />
  <link rel="shortcut icon" href="/assets/icon-192.png?v=20260904-3" />
  <link rel="apple-touch-icon" href="/assets/apple-icon-180.png?v=20260904-3" />
  <link rel="apple-touch-icon-precomposed" href="/assets/apple-icon-180.png?v=20260904-3" />
  <script defer data-domain="mowi.agency" src="https://plausible.io/js/script.js"></script>
</head>
<body>
${headerHtml("/templates")}
<main>
<section class="hero container hero-h1-reduced hero-tight-bottom">
  <h1>Templates</h1>
  <p class="hero-sub">${heroSub}</p>
</section>

<section class="section container" id="voorbeelden">
  <div class="tpl-toolbar" data-tpl-toolbar>
    <label class="tpl-search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
      <input type="search" data-tpl-search-input placeholder="Zoek een template of beschrijf een taak" aria-label="Zoek een template" />
    </label>
    <div class="tpl-filter-row" role="group" aria-label="Type">
      ${typeChip("agents", "Agents")}
      ${typeChip("workflows", "Workflows")}
      ${typeChip("dashboards", "Dashboards")}
    </div>
    <div class="tpl-filter-row" role="group" aria-label="Branche">
        ${brancheChips}
    </div>
    <div class="tpl-filter-row" role="group" aria-label="Koppeling">
        ${koppelingChips}
    </div>
    <div class="tpl-filter-row" role="group" aria-label="Trigger">
      <button type="button" class="tpl-filter-chip" data-tpl-filter="trigger" data-tpl-value="schedule" aria-pressed="false">Op een vast moment</button>
      <button type="button" class="tpl-filter-chip" data-tpl-filter="trigger" data-tpl-value="poll" aria-pressed="false">Bij een nieuw item</button>
    </div>
  </div>

  ${featuredRow}

  <div class="tpl-row">
    <div class="tpl-row-head"><h2 data-tpl-results-heading>Alle templates (${templates.length})</h2></div>
    <div class="tpl-grid" data-tpl-all-grid>
      ${allGrid}
    </div>
    <p class="tpl-empty" data-tpl-empty hidden>
      Niets gevonden voor deze combinatie.<br />
      <a href="${SIGNUP_URL}" class="btn-primary" data-event="Signup Click">Beschrijf het aan Mowi</a>
    </p>
  </div>
</section>
</main>
${footerHtml(`  <script src="/js/templates.js?v=${TPL_ASSET_VERSION}"></script>\n`)}
</body>
</html>
`;
}

function renderDetailPage(template, related) {
  assertNoEmDash(template.summary, `template ${template.key} summary`);

  const visual = template.graph
    ? `<div class="tpl-detail-visual">${renderCanvasInteractive(template)}<div class="tpl-detail-actions"><a href="${SIGNUP_URL}" class="btn-primary" data-event="Signup Click">Laat Mowi dit bouwen</a></div></div>`
    : template.tiles
    ? `<div class="tpl-detail-visual"><div class="tpl-detail-visual-inner" style="position:relative;height:22rem">${renderDashMock(template.tiles)}</div><div class="tpl-detail-actions"><a href="${SIGNUP_URL}" class="btn-primary" data-event="Signup Click">Laat Mowi dit bouwen</a></div></div>`
    : `<div class="tpl-detail-visual"><p class="hint" style="padding:1.5rem">${esc(template.blocked_reason || "Nog niet beschikbaar.")}</p></div>`;

  const stepsHtml =
    template.steps.length > 0
      ? `<ol class="tpl-detail-steps">${template.steps
          .map((s) => `<li><strong>${esc(s.title)}</strong><span>${esc(s.text)}</span></li>`)
          .join("")}</ol>`
      : `<p class="hint">${esc(template.blocked_reason || "Nog geen stappen beschikbaar.")}</p>`;

  const platformsHtml =
    template.needs.platforms.length > 0
      ? `<div class="tpl-card-platforms" style="margin-bottom:.625rem">${template.needs.platforms
          .map((p) => `<img src="/assets/logos/${esc(p)}.svg" alt="${esc(p.replace(/_/g, " "))}" class="tpl-card-platform-icon" style="height:1.25rem" onerror="this.remove()" />`)
          .join("")}</div>`
      : "";

  const relatedHtml =
    related.length > 0
      ? `<div class="tpl-row">
    <div class="tpl-row-head"><h2>Vergelijkbaar</h2></div>
    <div class="tpl-grid">
      ${related.map(renderCard).join("\n      ")}
    </div>
  </div>`
      : "";

  const breadcrumbJsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Templates", item: `${SITE_URL}/templates` },
      { "@type": "ListItem", position: 2, name: template.label, item: `${SITE_URL}/templates/${template.slug}` },
    ],
  });

  return `<!-- Generated by build-templates.js from content/templates/templates.json — do not hand-edit. -->
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(template.label)} — Templates — Mowi</title>
  <meta name="description" content="${esc(template.summary)}" />
  <link rel="canonical" href="${SITE_URL}/templates/${template.slug}" />
  <meta property="og:title" content="${esc(template.label)} — Mowi" />
  <meta property="og:description" content="${esc(template.summary)}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Instrument+Serif:ital@1&family=Inter+Tight:wght@600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css?v=${CSS_VERSION}" />
  <link rel="stylesheet" href="/css/workflow-canvas.css?v=${WF_CSS_VERSION}" />
  <link rel="stylesheet" href="/css/templates.css?v=${TPL_ASSET_VERSION}" />
  <link rel="icon" href="/assets/icon-192.png?v=20260904-3" />
  <link rel="shortcut icon" href="/assets/icon-192.png?v=20260904-3" />
  <link rel="apple-touch-icon" href="/assets/apple-icon-180.png?v=20260904-3" />
  <link rel="apple-touch-icon-precomposed" href="/assets/apple-icon-180.png?v=20260904-3" />
  <script type="application/ld+json">${breadcrumbJsonLd}</script>
  <script defer data-domain="mowi.agency" src="https://plausible.io/js/script.js"></script>
</head>
<body>
${headerHtml("/templates")}
<main>
<div class="container section">
  <p><a href="/templates" class="link-arrow">← Templates</a></p>
  <h1 style="margin-top:1rem">${esc(template.label)}</h1>
  <p class="hero-sub" style="margin-bottom:2rem">${esc(template.summary)}</p>

  ${visual}

  <div class="tpl-detail-grid">
    <section class="tpl-detail-section">
      <h2>Zo werkt het</h2>
      ${stepsHtml}
    </section>
    <section class="tpl-detail-section">
      <h2>Wat u nodig heeft</h2>
      ${platformsHtml}
      ${template.needs.koppeling_hint ? `<p>${esc(template.needs.koppeling_hint)}</p>` : ""}
      ${template.industry_labels.length > 0 ? `<p>Ook voor: ${esc(template.industry_labels.join(", "))}.</p>` : ""}
      <div class="tpl-prompt-box">Wat de Builder krijgt: "${esc(promptFor(template))}"</div>
    </section>
  </div>

  ${relatedHtml}
</div>
</main>
${footerHtml(`  <script src="/js/workflow-canvas.js?v=${WF_JS_VERSION}"></script>\n`)}
</body>
</html>
`;
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const templates = data.templates;

  const slugs = new Set();
  templates.forEach((t) => {
    if (slugs.has(t.slug)) throw new Error(`build-templates: duplicate slug '${t.slug}'`);
    slugs.add(t.slug);
    if (t.slug.indexOf(".") !== -1) throw new Error(`build-templates: slug '${t.slug}' contains a dot, which breaks this site's extensionless-URL convention`);
  });

  fs.writeFileSync(path.join(ROOT, "templates.html"), renderIndexPage(templates));
  console.log(`Wrote templates.html (${templates.length} templates, generated ${data.generated_at}, dashboard commit ${data.commit || "unknown"}).`);

  if (!fs.existsSync(DETAIL_DIR)) fs.mkdirSync(DETAIL_DIR);

  templates.forEach((t) => {
    const related = templates
      .filter((o) => o.key !== t.key && o.kind === t.kind && o.industries.some((i) => t.industries.includes(i)))
      .slice(0, 3);
    fs.writeFileSync(path.join(DETAIL_DIR, `${t.slug}.html`), renderDetailPage(t, related));
  });
  console.log(`Wrote ${templates.length} detail pages to templates/.`);

  // /templates/ (trailing slash) resolves to templates/index.html under
  // this site's own extensionless convention — without this file, that
  // one URL shape 404s even though /templates itself works fine.
  fs.writeFileSync(
    path.join(DETAIL_DIR, "index.html"),
    `<!DOCTYPE html>\n<html lang="nl"><head><meta charset="utf-8" /><meta http-equiv="refresh" content="0; url=/templates" /><link rel="canonical" href="${SITE_URL}/templates" /><title>Mowi — Templates</title></head><body><script>window.location.replace("/templates");</script><p><a href="/templates">Ga naar Templates</a></p></body></html>\n`
  );
  console.log("Wrote templates/index.html (redirect to /templates).");

  if (emDashWarnings.length > 0) {
    console.warn(`\nCopy-review: ${emDashWarnings.length} template field(s) contain an em dash (site style rule: no em dashes in prose). Dashboard-authored, not fixed by this build:`);
    emDashWarnings.forEach((w) => console.warn(`  - ${w}`));
  }
}

main();
