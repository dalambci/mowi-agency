/* Templates marketplace QA (dev tooling, not part of the shipped site —
   same status as screenshot.js). Drives /templates in Chromium (1440 and
   390) and WebKit (iPhone 13) and asserts every filter on RENDERED
   visibility (offsetParent), never on the `hidden` attribute: on
   2026-09-05 the attribute was set correctly and nothing moved, because
   an author display rule beat [hidden]. A check on the attribute would
   have passed; this one would have failed.

   Usage: node qa-templates.js [baseUrl]   (default http://localhost:8765,
   which needs `node serve.js` running; pass https://mowi.agency after a
   deploy + Varnish purge). Exit code 1 on any failed check. Screenshots
   go to screenshots/ (gitignore-worthy, not a deliverable). */
const path = require("path");
const fs = require("fs");
const { chromium, webkit, devices } = require("playwright");

const BASE = (process.argv[2] || "http://localhost:8765").replace(/\/$/, "");
const OUT = path.join(__dirname, "screenshots");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const results = [];
let failures = 0;
function check(name, ok, detail) {
  results.push({ name, ok });
  if (!ok) failures++;
  console.log((ok ? "PASS " : "FAIL ") + name + (detail ? "  -- " + detail : ""));
}

async function visibleCards(page, section) {
  return page.evaluate((s) => {
    const root = s ? document.querySelector(`[data-tpl-section="${s}"]`) : document;
    if (!root) return -1;
    return Array.from(root.querySelectorAll("[data-tpl-card]")).filter((el) => el.offsetParent !== null).length;
  }, section);
}
async function sectionVisible(page, section) {
  return page.evaluate((s) => { const el = document.querySelector(`[data-tpl-section="${s}"]`); return !!el && el.offsetParent !== null; }, section);
}
async function sectionsConsistent(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll("[data-tpl-section]")).every((s) => {
    const n = Array.from(s.querySelectorAll("[data-tpl-card]")).filter((e) => e.offsetParent !== null).length;
    return (n > 0) === (s.offsetParent !== null);
  }));
}
async function load(page, url) {
  await page.goto(url);
  await page.waitForSelector("[data-tpl-card]", { state: "attached" });
  await page.waitForTimeout(250);
}

async function run(browserType, label, viewport, device) {
  const browser = await browserType.launch();
  const context = await browser.newContext(device ? { ...device } : { viewport });
  const page = await context.newPage();
  const consoleErrors = [];
  const bad = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("response", (r) => { if (r.status() >= 400) bad.push(r.status() + " " + r.url()); });

  // 1. First paint: unfiltered, three sections with counts, clean URL
  await load(page, BASE + "/templates");
  const a = await visibleCards(page, "agent"), w = await visibleCards(page, "workflow"), d = await visibleCards(page, "dashboard");
  const counts = await page.evaluate(() => Array.from(document.querySelectorAll("[data-tpl-count]")).map((e) => e.textContent.trim()));
  check(`${label} first paint shows every card in three sections`, a > 0 && w > 0 && d > 0 && counts.join(",") === `${a},${w},${d}`, `${a}/${w}/${d} counts ${counts.join(",")}`);
  check(`${label} no pill row on first paint`, await page.evaluate(() => document.querySelector("[data-tpl-active]").offsetParent === null));
  check(`${label} URL clean on first paint`, page.url() === BASE + "/templates", page.url());
  const imgs = await page.evaluate(() => Array.from(document.querySelectorAll(".tpl-picture img, .tpl-dd-menu img")).map((i) => ({ src: i.getAttribute("src"), ok: i.complete && i.naturalWidth > 0 })));
  check(`${label} every logo loaded (${imgs.length})`, imgs.length > 0 && imgs.every((i) => i.ok), imgs.filter((i) => !i.ok).map((i) => i.src).slice(0, 5).join(" "));
  const art = await page.evaluate(() => ({
    mascots: document.querySelectorAll(".tpl-picture-agent .tpl-mascot").length,
    agentLead: Array.from(document.querySelectorAll(".tpl-picture-agent .tpl-glyph:not(.tpl-glyph-sm) svg")).map((s) => s.dataset.glyph),
    agentChannel: Array.from(document.querySelectorAll(".tpl-picture-agent .tpl-glyph-sm svg")).map((s) => s.dataset.glyph),
    charts: document.querySelectorAll('.tpl-picture-dashboard .tpl-glyph svg[data-glyph="chart"]').length,
    badges: Array.from(document.querySelectorAll(".tpl-picture-workflow .tpl-badge")).map((b) => b.textContent.trim()),
    dashBadges: Array.from(document.querySelectorAll(".tpl-picture-dashboard .tpl-badge")).map((b) => b.textContent.trim()),
    agentBadges: document.querySelectorAll(".tpl-picture-agent .tpl-badge").length,
  }));
  // 2026-09-07: the ghost left the cards, the branche took its slot. This
  // also pins the point of that change — an agent card's picture is now
  // unique to its trade, where all 10 Voice cards used to be identical.
  check(`${label} agent pictures = branche glyph + phone/mail, no mascot`,
    art.mascots === 0 && art.agentLead.length === a && art.agentLead.every((g) => g && g.startsWith("branche-")) && art.agentChannel.length === a && art.agentChannel.every((g) => g === "phone" || g === "mail"),
    JSON.stringify(art));
  check(`${label} every branche is drawn differently`, new Set(art.agentLead).size === 10, String(new Set(art.agentLead).size));
  check(`${label} dashboard pictures use the chart glyph`, art.charts === d, String(art.charts));
  check(`${label} corner labels: workflow cadence, dashboard period, none on agents`, art.badges.length > 0 && art.badges.every((b) => ["Dagelijks", "Wekelijks", "Elk uur", "Direct"].includes(b)) && art.dashBadges.length === d && art.dashBadges.every((b) => /^\d+ dagen$/.test(b)) && art.agentBadges === 0, JSON.stringify(art.badges.slice(0, 4)) + " " + JSON.stringify(art.dashBadges.slice(0, 2)) + " agent badges " + art.agentBadges);
  const overflow = await page.evaluate(() => Array.from(document.querySelectorAll(".tpl-picture")).filter((p) => { const r = p.querySelector(".tpl-picture-row"); return r && r.scrollWidth > p.clientWidth; }).length);
  check(`${label} no picture row overflows its card`, overflow === 0, String(overflow));
  check(`${label} no horizontal page overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  // "No text" means the picture row itself — the corner label is the one deliberate exception, and "+N" is a count, not copy.
  check(`${label} no visible text inside a picture`, await page.evaluate(() => Array.from(document.querySelectorAll(".tpl-picture-row")).every((r) => r.innerText.trim().replace(/\+\d+/g, "").trim() === "")));
  await page.screenshot({ path: path.join(OUT, `tpl-${label}-first.png`) });

  // 2. Type control isolates a section and writes the URL
  await page.click('[data-tpl-filter="type"][data-tpl-value="workflows"]');
  await page.waitForTimeout(120);
  check(`${label} type=workflows isolates the Workflows section`, !(await sectionVisible(page, "agent")) && (await sectionVisible(page, "workflow")) && !(await sectionVisible(page, "dashboard")) && (await visibleCards(page, "workflow")) === w);
  check(`${label} URL ?type=workflows`, page.url().endsWith("?type=workflows"), page.url());

  // 3. Branche dropdown: facet count equals the result count, zero-count options disabled
  await page.click('[data-tpl-dd="branche"] .tpl-dd-btn');
  await page.waitForTimeout(80);
  check(`${label} branche menu opens`, await page.evaluate(() => document.getElementById("tpl-dd-branche").offsetParent !== null));
  const opts = await page.evaluate(() => Array.from(document.querySelectorAll("#tpl-dd-branche [role=option]")).map((o) => ({ v: o.dataset.tplValue, n: parseInt(o.querySelector(".tpl-dd-count").textContent, 10), dis: o.getAttribute("aria-disabled") === "true" })));
  check(`${label} zero-count options disabled, others enabled`, opts.length > 0 && opts.every((o) => o.dis === (o.n === 0)), JSON.stringify(opts));
  const pick = opts.find((o) => o.n > 0);
  await page.click(`#tpl-dd-branche [role=option][data-tpl-value="${pick.v}"]`);
  await page.waitForTimeout(120);
  const wv = await visibleCards(page, "workflow");
  check(`${label} facet count (${pick.n}) equals the visible workflows`, wv === pick.n, String(wv));
  check(`${label} menu closed after pick, focus back on the button`, await page.evaluate(() => document.getElementById("tpl-dd-branche").offsetParent === null && document.activeElement === document.querySelector('[data-tpl-dd="branche"] .tpl-dd-btn')));
  check(`${label} pill + result count shown`, await page.evaluate((n) => { const p = document.querySelector(".tpl-pill"); const t = document.querySelector("[data-tpl-total]"); return !!p && p.offsetParent !== null && t.textContent.trim() === String(n); }, wv));
  check(`${label} dropdown button shows the chosen label`, await page.evaluate((v) => document.querySelector('[data-tpl-dd="branche"] .tpl-dd-btn').classList.contains("is-set"), pick.v));
  check(`${label} URL carries type + branche`, page.url().includes("type=workflows") && page.url().includes("branche=" + pick.v), page.url());
  await page.screenshot({ path: path.join(OUT, `tpl-${label}-filtered.png`) });

  // 4. Escape closes and refocuses; koppeling options carry logos + names
  await page.click('[data-tpl-dd="koppeling"] .tpl-dd-btn');
  await page.waitForTimeout(80);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(80);
  check(`${label} Escape closes the koppeling menu and refocuses`, await page.evaluate(() => document.getElementById("tpl-dd-koppeling").offsetParent === null && document.activeElement === document.querySelector('[data-tpl-dd="koppeling"] .tpl-dd-btn')));
  const kop = await page.evaluate(() => Array.from(document.querySelectorAll("#tpl-dd-koppeling [role=option]")).map((o) => ({ label: o.querySelector("[data-tpl-label]").textContent.trim(), img: !!o.querySelector("img") })));
  // A display name, never the raw registry key ("exact_online") the first version showed; "bol.com" is legitimately lowercase.
  check(`${label} koppeling options named with a logo each`, kop.length >= 10 && kop.every((k) => k.img && !/_/.test(k.label)), JSON.stringify(kop.slice(0, 3)));

  // 5. Pill removal, then clear all
  await page.click(".tpl-pill");
  await page.waitForTimeout(120);
  check(`${label} pill removal restores every workflow`, (await visibleCards(page, "workflow")) === w);
  await page.click(".tpl-clear");
  await page.waitForTimeout(120);
  check(`${label} Wis filters restores the first paint`, (await visibleCards(page, "agent")) === a && (await visibleCards(page, "dashboard")) === d && page.url() === BASE + "/templates", page.url());

  // 6. Search, then the empty state
  await page.fill('[data-tpl-filter="q"]', "factuur");
  await page.waitForTimeout(150);
  const total = await page.evaluate(() => Array.from(document.querySelectorAll("[data-tpl-section] [data-tpl-card]")).filter((e) => e.offsetParent !== null).length);
  check(`${label} search "factuur" finds something and hides only the empty sections`, total >= 1 && (await sectionsConsistent(page)), "total " + total);
  await page.fill('[data-tpl-filter="q"]', "zzzzqqq");
  await page.waitForTimeout(150);
  check(`${label} empty state with Wis filters`, await page.evaluate(() => { const e = document.querySelector("[data-tpl-empty]"); return e.offsetParent !== null && e.textContent.includes("Wis filters"); }));
  await page.click("[data-tpl-empty] [data-tpl-clear]");
  await page.waitForTimeout(120);
  check(`${label} empty-state clear restores`, (await visibleCards(page, "agent")) === a);

  // 7. Seeded deep links (the mega-menu's own links)
  await load(page, BASE + "/templates?type=agents");
  check(`${label} ?type=agents seeds`, (await sectionVisible(page, "agent")) && !(await sectionVisible(page, "workflow")) && (await page.evaluate(() => document.querySelector('[data-tpl-filter="type"][data-tpl-value="agents"]').getAttribute("aria-pressed") === "true")));
  await load(page, BASE + "/templates?type=workflow&branche=" + pick.v);
  check(`${label} singular ?type=workflow + ?branche= seed a pill`, (await visibleCards(page, "workflow")) === pick.n && (await page.evaluate(() => !!document.querySelector(".tpl-pill"))));
  await load(page, BASE + "/templates?branche=not-a-branche");
  check(`${label} unknown ?branche= is ignored`, (await visibleCards(page, "agent")) === a && page.url() === BASE + "/templates");

  // 8. Phones: two cards per row
  if (viewport && viewport.width < 500) {
    await load(page, BASE + "/templates");
    check(`${label} two cards per row`, await page.evaluate(() => { const c = Array.from(document.querySelectorAll('[data-tpl-section="agent"] [data-tpl-card]')).slice(0, 2).map((x) => x.getBoundingClientRect()); return c.length === 2 && Math.abs(c[0].top - c[1].top) < 2 && c[1].left > c[0].right; }));
    await page.screenshot({ path: path.join(OUT, `tpl-${label}-phone.png`) });
  }

  // 9. A detail page: canvas mounted, signup CTA, logo tiles with names
  await page.goto(BASE + "/templates/klant-opzoeken");
  await page.waitForTimeout(400);
  check(`${label} detail page renders the canvas + CTA + named logos + numbered steps`, await page.evaluate(() => !!document.querySelector(".tpl-detail-visual-wrap [data-wf-canvas] .wf-node") && !!document.querySelector(".tpl-detail-cta a.btn-primary") && document.querySelectorAll(".tpl-needs .tpl-logo-list .tpl-logo img[alt]").length > 0 && document.querySelectorAll(".tpl-detail-nodes .tpl-node .tpl-node-num").length > 0));
  await page.screenshot({ path: path.join(OUT, `tpl-${label}-detail.png`) });

  // 10. A detail page mirrors the dashboard's (2026-09-06): the label as H1, the flow's nodes as cards, a needs checklist, the
  // canvas beside the copy (fitted whole: every node inside the frame),
  // a same-branche related row — and the same grid: stacked (intro /
  // visual / nodes / needs) below 1024px; from 1024px the intro and the
  // needs share the left column next to the visual, the nodes full width
  // under both.
  const phone = !viewport || viewport.width < 1024;
  // The detail page starts as high as the index: back link top == index H1 top (both relative to the header).
  await page.goto(BASE + "/templates");
  await page.waitForTimeout(300);
  const indexTop = await page.evaluate(() => Math.round(document.querySelector(".tpl-head h1").getBoundingClientRect().top - document.querySelector(".site-header").getBoundingClientRect().bottom));
  await page.goto(BASE + "/templates/voice-agent-kapper");
  await page.waitForTimeout(500);
  const detailTop = await page.evaluate(() => Math.round(document.querySelector(".tpl-detail-back").getBoundingClientRect().top - document.querySelector(".site-header").getBoundingClientRect().bottom));
  check(`${label} detail page starts as high as the templates page`, Math.abs(indexTop - detailTop) <= 1, `index ${indexTop}px vs detail ${detailTop}px`);
  const agent = await page.evaluate(() => {
    const r = (sel) => { const el = document.querySelector(sel); return el ? el.getBoundingClientRect() : null; };
    const i = r(".tpl-detail-intro"), v = r(".tpl-detail-visual-wrap"), n = r(".tpl-detail-nodes"), d = r(".tpl-detail-needs");
    const all = !!(i && v && n && d);
    const vp = document.querySelector(".tpl-detail-visual-wrap [data-wf-viewport]");
    const nodes = Array.from(document.querySelectorAll(".tpl-detail-visual-wrap .wf-node"));
    const vr = vp ? vp.getBoundingClientRect() : null;
    const fitted = !!vr && nodes.length > 0 && nodes.every((el) => { const b = el.getBoundingClientRect(); return b.top >= vr.top - 1 && b.bottom <= vr.bottom + 1 && b.left >= vr.left - 1 && b.right <= vr.right + 1; });
    const related = Array.from(document.querySelectorAll(".tpl-detail-related [data-tpl-card]")).map((c) => c.getAttribute("data-tpl-industries") || "");
    return {
      h1: document.querySelector("h1") ? document.querySelector("h1").textContent.trim() : "",
      cards: document.querySelectorAll(".tpl-detail-nodes .tpl-node").length,
      needs: document.querySelectorAll(".tpl-needs li").length,
      // Removed 2026-09-06 (Sal: "too much text and makes it too busy with the icons").
      identityRow: !!document.querySelector(".tpl-agent-identity"),
      canvas: nodes.length > 0,
      fitted,
      cta: !!document.querySelector(".tpl-detail-cta a.btn-primary"),
      related,
      stacked: all && v.top >= i.bottom - 1 && n.top >= v.bottom - 1 && d.top >= n.bottom - 1,
      sideBySide: all && v.left >= i.right - 1 && Math.abs(v.top - i.top) < 2 && d.left < v.left && d.top >= i.bottom - 1 && n.top >= Math.max(v.bottom, d.bottom) - 1 && n.width > v.width,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
    };
  });
  check(`${label} agent page: the label is the H1`, agent.h1 === "Voice agent — Kapper", agent.h1);
  check(`${label} agent page: flow cards, needs list, canvas, CTA, no identity row`, agent.cards >= 3 && agent.needs >= 1 && agent.canvas && agent.cta && !agent.identityRow, JSON.stringify({ cards: agent.cards, needs: agent.needs, canvas: agent.canvas, cta: agent.cta, identityRow: agent.identityRow }));
  check(`${label} agent page: the whole flow is fitted inside the frame`, agent.fitted);
  check(`${label} agent page: related row is same-branche only (kapper)`, agent.related.length >= 2 && agent.related.every((ind) => ind.split(",").includes("kapper")), JSON.stringify(agent.related));
  check(`${label} agent page: ${phone ? "stacked intro / visual / nodes / needs" : "intro + needs left of the visual, nodes full width below"}`, phone ? agent.stacked : agent.sideBySide);
  check(`${label} agent page: no horizontal overflow`, agent.overflow === 0, String(agent.overflow));

  check(`${label} zero console errors`, consoleErrors.filter((m) => !m.includes("interactive-widget")).length === 0, consoleErrors.slice(0, 3).join(" | "));
  check(`${label} zero 4xx/5xx responses`, bad.length === 0, bad.slice(0, 5).join(" | "));
  await browser.close();
}

(async () => {
  await run(chromium, "chromium-1440", { width: 1440, height: 900 });
  await run(chromium, "chromium-390", { width: 390, height: 844 });
  await run(webkit, "webkit-iphone", null, devices["iPhone 13"]);
  console.log(`\n${results.length - failures}/${results.length} checks passed against ${BASE}`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
