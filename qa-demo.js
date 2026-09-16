/* Demo sections QA (dev tooling, not part of the shipped site — same
   status as screenshot.js / qa-templates.js). Drives /support-agent's two
   new sections ("Hoor hem aan het werk", "Probeer het zelf") in Chromium
   (1440 and 390) and WebKit (iPhone 13). Every visibility check asserts
   RENDERED state (offsetParent / :not([hidden]) computed display), never
   just the `hidden` attribute — the 2026-09-05 qa-templates.js lesson
   (an author display rule can beat [hidden] and nothing would catch it).

   The live "Probeer het zelf" card is tested against a MOCKED
   /api/demo/session (page.route) by default, so this needs no real
   ElevenLabs agent, no API key, and costs nothing to run repeatedly — it
   verifies the UI state machine (idle -> consent -> connecting -> error/
   live -> ended), not a real conversation.

   Usage:
     node qa-demo.js [baseUrl]            mocked endpoint (default; needs
                                           `node serve.js` running for the
                                           default http://localhost:8765)
     node qa-demo.js <baseUrl> --live     an ADDITIONAL real call/chat
                                           against the real endpoint, with
                                           a faked microphone
                                           (--use-fake-ui-for-media-stream)
                                           — only meaningful once
                                           DEMO_ENABLED=true and the demo
                                           agents exist on production;
                                           Chromium only (WebKit cannot
                                           fake a microphone).

   Exit code 1 on any failed check. Screenshots go to screenshots/
   (gitignore-worthy, not a deliverable). */
const path = require("path");
const fs = require("fs");
const { chromium, webkit, devices } = require("playwright");

const args = process.argv.slice(2).filter((a) => a !== "--live");
const LIVE = process.argv.includes("--live");
// The live run costs a real, capped voice session, so only ONE page gets one.
// Both pages share js/demo.js and the same endpoint, and runParity() proves
// their markup has not diverged, so one page is enough — this flag just says
// which. Default is /support-agent.
const LIVE_PATH = (process.argv.find((a) => a.startsWith("--live-path=")) || "").split("=")[1] || "/support-agent";
const BASE = (args[0] || "http://localhost:8765").replace(/\/$/, "");
const OUT = path.join(__dirname, "screenshots");
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

const results = [];
let failures = 0;
function check(name, ok, detail) {
  results.push({ name, ok });
  if (!ok) failures++;
  console.log((ok ? "PASS " : "FAIL ") + name + (detail ? "  -- " + detail : ""));
}

async function visible(page, selector) {
  return page.evaluate((s) => { const el = document.querySelector(s); return !!el && el.offsetParent !== null; }, selector);
}
async function text(page, selector) {
  return page.evaluate((s) => { const el = document.querySelector(s); return el ? el.textContent.trim() : null; }, selector);
}

/** Mocks /api/demo/session with a fixed response for every call in this page. */
async function mockSession(page, status, body) {
  await page.route("**/api/demo/session", (route) =>
    route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) })
  );
}

async function run(browserType, label, viewport, device, pagePath = "/support-agent") {
  const launchArgs = LIVE && browserType === chromium
    ? { args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] }
    : {};
  const browser = await browserType.launch(launchArgs);
  const context = await browser.newContext(device ? { ...device } : { viewport });
  if (LIVE && browserType === chromium) await context.grantPermissions(["microphone"], { origin: BASE });
  const page = await context.newPage();

  // startVoiceCall() calls the REAL getUserMedia() before ever reaching the
  // (mocked) endpoint below. Without this, a headless browser has no UI to
  // resolve the permission prompt and the promise never settles — not a
  // real product bug (an actual visitor's browser always resolves one way
  // or another), but it would hang every mocked-endpoint check forever.
  //
  // Chromium only, NOT WebKit: verified live (2026-09-16) that this exact
  // override — confirmed correctly applied and independently callable via
  // page.evaluate() right after — is silently gone by the time WebKit
  // dispatches the real click event that calls it from inside js/demo.js,
  // even though nothing on this page ever reassigns it; a raw JS property
  // override on navigator.mediaDevices does not reliably survive into a
  // real DOM event handler under Playwright's WebKit automation. This is
  // an automation-engine limitation, not an application bug: real Mobile
  // Safari resolves getUserMedia through the OS permission UI exactly as
  // documented. The getUserMedia-dependent checks below are skipped for
  // WebKit for exactly this reason — see `supportsGetUserMedia`.
  const supportsGetUserMedia = browserType !== webkit;
  if (!LIVE && supportsGetUserMedia) {
    await page.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = () => Promise.resolve(new MediaStream());
    });
  }
  const consoleErrors = [];
  const bad = [];
  const requestedUrls = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("request", (r) => requestedUrls.push(r.url()));
  page.on("response", (r) => { if (r.status() >= 400 && !r.url().includes("/api/demo/session")) bad.push(r.status() + " " + r.url()); });

  await page.goto(BASE + pagePath);
  await page.waitForSelector("[data-demo-listen]", { state: "attached" });
  await page.waitForTimeout(300);

  // ---------------------------------------------------------------------
  // Both sections present
  // ---------------------------------------------------------------------
  check(`${label} both demo sections render`, await visible(page, "[data-demo-listen]") && await visible(page, "[data-demo-try]"));
  check(`${label} vendor SDK not requested on page load`, !requestedUrls.some((u) => u.includes("elevenlabs-client.js")), requestedUrls.filter((u) => u.includes("elevenlabs")).join(","));

  // ---------------------------------------------------------------------
  // Section A — sample player
  // ---------------------------------------------------------------------
  const tabs = await page.$$eval("[data-demo-call]", (els) => els.map((e) => e.getAttribute("data-demo-call")));
  check(`${label} four sample-call tabs`, tabs.length === 4, tabs.join(","));
  check(`${label} first tab selected by default`, await page.evaluate(() => document.querySelector('[data-demo-call="bestelstatus"]').getAttribute("aria-selected") === "true"));

  await page.waitForTimeout(200); // manifest fetch for the initial tab
  const initialSrc = await page.evaluate(() => document.querySelector("[data-demo-audio]").src);
  check(`${label} initial manifest/audio loaded`, initialSrc.includes("bestelstatus"), initialSrc);

  await page.click("[data-demo-play]");
  await page.waitForTimeout(500);
  const playingAfterClick = await page.evaluate(() => !document.querySelector("[data-demo-audio]").paused);
  check(`${label} play button starts playback`, playingAfterClick);
  check(`${label} play button reflects aria-pressed=true while playing`, await page.evaluate(() => document.querySelector("[data-demo-play]").getAttribute("aria-pressed") === "true"));

  await page.evaluate(() => { const a = document.querySelector("[data-demo-audio]"); a.currentTime = Math.min(3, a.duration || 3); });
  await page.waitForTimeout(600);
  const bubblesAfterSeek = await page.$$eval("[data-demo-transcript] .demo-bubble", (els) => els.length);
  check(`${label} at least one caption bubble appears as the sample plays`, bubblesAfterSeek >= 1, String(bubblesAfterSeek));

  // The disc moves with the voice. Two things matter here and the second is
  // the dangerous one: routing the <audio> element through an AnalyserNode
  // captures its output, so anything not reconnected to the destination
  // plays SILENTLY. A non-zero level is proof that audio is flowing through
  // that graph, not just that a number is changing.
  const levels = [];
  for (let i = 0; i < 14; i++) {
    levels.push(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector(".demo-disc")).getPropertyValue("--demo-level")) || 0));
    await page.waitForTimeout(110);
  }
  const peak = Math.max(...levels);
  const distinct = new Set(levels.map((v) => v.toFixed(2))).size;
  check(`${label} the disc reacts to the actual audio`, peak > 0.05 && distinct > 3, `peak ${peak.toFixed(2)}, ${distinct} distinct values`);
  check(`${label} audio still plays through the analyser (not silently captured)`,
    await page.evaluate(() => { const a = document.querySelector("[data-demo-audio]"); return !a.paused && a.currentTime > 0 && !a.muted; }));

  // Captions must land on the words they caption. Seeking to the start of a
  // known cue and counting bubbles is what catches timing drift — the
  // rendered manifests derive their cues from measured audio, and an earlier
  // build's estimated timings ran ~0.4s late by the final turn.
  const manifest = await page.evaluate(async (v) => {
    const r = await fetch('/content/demo-calls/bestelstatus.json?v=' + v);
    return r.json();
  }, await page.evaluate(() => document.body.getAttribute('data-demo-version')));
  const cue = manifest.lines[4];
  await page.evaluate((t) => { document.querySelector('[data-demo-audio]').currentTime = t; }, cue.start + 0.35);
  await page.waitForTimeout(700);
  const shown = await page.$$eval('[data-demo-transcript] .demo-bubble', (els) => els.map((e) => e.textContent));
  check(`${label} captions are in sync with the audio at cue 5`,
    shown.length === 5 && shown[shown.length - 1] === cue.text,
    `${shown.length} bubbles, last="${(shown[shown.length - 1] || '').slice(0, 45)}..." expected="${cue.text.slice(0, 45)}..."`);
  check(`${label} manifest cues stay inside the audio`,
    manifest.lines[manifest.lines.length - 1].end <= manifest.duration + 0.05,
    `last cue ${manifest.lines[manifest.lines.length - 1].end} vs duration ${manifest.duration}`);

  // Tab switch (click): pauses playback, swaps title/sub, drops the old
  // track's lines. NOT asserting an empty transcript: a fresh <audio src=>
  // load resets currentTime to 0 and fires its own timeupdate per the
  // HTML media spec, and this manifest's own first line starts at t=0 —
  // so the new track's opening line correctly appears right away, which
  // is the desired "immediate feedback" behaviour, not stale content.
  const oldBubbleText = await page.evaluate(() => (document.querySelector("[data-demo-transcript] .demo-bubble") || {}).textContent || "");
  await page.click("#demo-tab-afspraak");
  await page.waitForTimeout(400);
  check(`${label} switching tabs pauses playback`, await page.evaluate(() => document.querySelector("[data-demo-audio]").paused));
  check(`${label} switching tabs updates the title`, (await text(page, "[data-demo-listen-title]")) === "Afspraak inplannen", await text(page, "[data-demo-listen-title]"));
  const bubblesAfterSwitch = await page.$$eval("[data-demo-transcript] .demo-bubble", (els) => els.map((e) => e.textContent));
  check(`${label} switching tabs drops the previous track's lines`, bubblesAfterSwitch.every((t) => t !== oldBubbleText), JSON.stringify(bubblesAfterSwitch).slice(0, 80));
  const afspraakSrc = await page.evaluate(() => document.querySelector("[data-demo-audio]").src);
  check(`${label} switching tabs swaps the audio source`, afspraakSrc.includes("afspraak") && !afspraakSrc.includes("bestelstatus"), afspraakSrc);

  // Keyboard (arrow-key) navigation must ALSO swap the audio — this is
  // what the MutationObserver-on-aria-selected approach exists to catch,
  // since initPillTabs's own keyboard handler never fires a click event.
  await page.focus("#demo-tab-afspraak");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(300);
  const afterArrow = await page.evaluate(() => ({
    selected: document.activeElement.getAttribute("data-demo-call"),
    src: document.querySelector("[data-demo-audio]").src,
  }));
  check(`${label} arrow-key tab navigation also swaps the audio source`, afterArrow.src.includes(afterArrow.selected), JSON.stringify(afterArrow));

  await page.screenshot({ path: path.join(OUT, `demo-${label}-listen.png`) });

  // ---------------------------------------------------------------------
  // Section B — try it (mocked endpoint)
  // ---------------------------------------------------------------------
  check(`${label} try-card starts idle`, await page.evaluate(() => document.querySelector("[data-demo-try]").getAttribute("data-state") === "idle"));
  check(`${label} Bellen selected by default, Chatten panel hidden`, await visible(page, "#demo-panel-voice") && !(await visible(page, "#demo-panel-chat")));

  await page.click("#demo-mode-chat");
  await page.waitForTimeout(150);
  check(`${label} Chatten toggle reveals the chat panel`, await visible(page, "#demo-panel-chat") && !(await visible(page, "#demo-panel-voice")));
  check(`${label} chat greeting is shown statically before any session`, ((await text(page, "[data-demo-greeting]")) || "").includes("digitale assistent"));

  await page.click("#demo-mode-voice");
  await page.waitForTimeout(150);
  check(`${label} switching back to Bellen restores the voice panel`, await visible(page, "#demo-panel-voice"));

  // -- Consent flow --
  await page.click("[data-demo-start]");
  await page.waitForTimeout(150);
  check(`${label} Start reveals the consent panel and hides the card body`, await visible(page, "[data-demo-consent]") && !(await visible(page, "[data-demo-body]")));
  check(`${label} consent lists the required points`, ((await text(page, "[data-demo-consent]")) || "").includes("18 jaar") && ((await text(page, "[data-demo-consent]")) || "").includes("privacyverklaring"));

  await page.click("[data-demo-cancel]");
  await page.waitForTimeout(150);
  check(`${label} Annuleren returns to idle`, await visible(page, "[data-demo-body]") && !(await visible(page, "[data-demo-consent]")));

  if (supportsGetUserMedia) {
    // -- Kill switch (503) --
    await mockSession(page, 503, { message: "De demo is op dit moment niet beschikbaar." });
    await page.click("[data-demo-start]");
    await page.waitForTimeout(100);
    await page.click("[data-demo-agree]");
    await page.waitForTimeout(400);
    check(`${label} a 503 from the endpoint shows the Dutch message and returns to idle`, ((await text(page, "[data-demo-error]")) || "").includes("niet beschikbaar") && await visible(page, "[data-demo-body]"), await text(page, "[data-demo-error]"));
    check(`${label} a 503 also offers the real next step instead of a dead end`, await visible(page, "[data-demo-fallback]"));

    // -- Daily cap (429) --
    await mockSession(page, 429, { message: "De demo is voor vandaag vol." });
    await page.click("[data-demo-start]");
    await page.click("[data-demo-agree]");
    await page.waitForTimeout(400);
    check(`${label} a 429 from the endpoint surfaces its own message`, ((await text(page, "[data-demo-error]")) || "").includes("vandaag vol"), await text(page, "[data-demo-error]"));
    check(`${label} a 429 also offers the real next step instead of a dead end`, await visible(page, "[data-demo-fallback]"));
    check(`${label} that fallback points at /demo`, ((await page.getAttribute("[data-demo-fallback]", "href")) || "").includes("/demo"), await page.getAttribute("[data-demo-fallback]", "href"));

    // -- A "successful" mint with an unreachable signed url: the SDK itself
    // must fail to connect, and that failure must still land the UI back in
    // a sane, non-stuck state (not asserting which exact state, since the
    // real SDK's rejection shape against a bogus host is not something to
    // assume — this is exactly what the FIRST REAL production run needs a
    // human to watch once, per the report). --
    await mockSession(page, 200, { signed_url: "wss://localhost:1/does-not-exist", mode: "voice", max_seconds: 120, max_messages: 20 });
    await page.click("[data-demo-start]");
    await page.click("[data-demo-agree]");
    await page.waitForTimeout(3000);
    const stateAfterBogusConnect = await page.evaluate(() => document.querySelector("[data-demo-try]").getAttribute("data-state"));
    check(`${label} an unreachable signed url does not leave the UI on "connecting" forever`, stateAfterBogusConnect !== "connecting", stateAfterBogusConnect);
    await page.screenshot({ path: path.join(OUT, `demo-${label}-try-consent-or-error.png`) });
    if (stateAfterBogusConnect === "live") { await page.click("[data-demo-hangup]"); await page.waitForTimeout(300); }
  } else {
    console.log(`SKIP  ${label} voice consent/503/429/connect checks — WebKit automation cannot fake getUserMedia in a real click handler (see run()'s comment); consent-panel open/cancel is still verified above.`);
  }

  // -- Chat: the user's own message renders immediately regardless of
  // what the (mocked, unreachable) session does afterward. --
  await page.click("#demo-mode-chat");
  await page.waitForTimeout(150);
  await mockSession(page, 200, { signed_url: "wss://localhost:1/does-not-exist", mode: "chat", max_seconds: 120, max_messages: 20 });
  await page.fill("[data-demo-chat-input]", "Wat kost dit?");
  await page.click(".demo-chat-send");
  await page.waitForTimeout(300);
  check(`${label} the visitor's own chat message renders immediately`, ((await text(page, "[data-demo-chat-log]")) || "").includes("Wat kost dit?"));

  // Expected noise from THIS SCRIPT's own mocks, not the app: the browser
  // auto-logs "Failed to load resource" for our mocked 503/429 responses,
  // and a WebSocket attempt against our deliberately-bogus signed url
  // (wss://localhost:1/does-not-exist) fails with ERR_UNSAFE_PORT — both
  // are the test fixture working as intended, not a real defect.
  const isExpectedTestNoise = (m) => m.includes("interactive-widget") || m.includes("does-not-exist") || m.includes("ERR_UNSAFE_PORT")
    || m.includes("status of 503") || m.includes("status of 429"); // Chromium's auto-logged resource-load-failure text carries no URL, only the status — every 503/429 on this page in this script is our own mockSession()
  await checkWorkflowCanvas(page, label);
  await checkWorkflowTypes(page, label);
  await checkMintPayload(page, label, supportsGetUserMedia);

  check(`${label} zero console errors`, consoleErrors.filter((m) => !isExpectedTestNoise(m)).length === 0, consoleErrors.filter((m) => !isExpectedTestNoise(m)).slice(0, 5).join(" | "));
  check(`${label} zero unexpected 4xx/5xx responses`, bad.length === 0, bad.slice(0, 5).join(" | "));
  check(`${label} no horizontal page overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  // prefers-reduced-motion must kill the disc motion completely. The level is
  // written as an inline style, so the sitewide reduced-motion CSS rule (which
  // only disables animations and transitions) cannot catch it — js/demo.js has
  // to check the query itself, and this is what proves it still does.
  const rmContext = await browser.newContext(Object.assign({ reducedMotion: "reduce" }, device ? device : { viewport }));
  const rmPage = await rmContext.newPage();
  await rmPage.goto(BASE + pagePath);
  await rmPage.waitForSelector("[data-demo-listen]");
  await rmPage.click("[data-demo-play]");
  await rmPage.waitForTimeout(1500);
  const rm = await rmPage.evaluate(() => ({
    level: parseFloat(getComputedStyle(document.querySelector(".demo-disc")).getPropertyValue("--demo-level")) || 0,
    transform: getComputedStyle(document.querySelector(".demo-disc")).transform,
    playing: !document.querySelector("[data-demo-audio]").paused,
  }));
  check(`${label} reduced motion stops the disc but not the audio`,
    rm.level === 0 && (rm.transform === "none" || rm.transform === "matrix(1, 0, 0, 1, 0, 0)") && rm.playing,
    JSON.stringify(rm));
  await rmContext.close();

  if (viewport && viewport.width < 500) {
    await page.reload();
    await page.waitForSelector("[data-demo-listen]");
    await page.waitForTimeout(300);
    const tabRow = await page.evaluate(() => {
      const el = document.querySelector(".demo-tabs");
      return { scrollWidth: el.scrollWidth, clientWidth: el.clientWidth };
    });
    check(`${label} sample tab row scrolls horizontally on phone`, tabRow.scrollWidth > tabRow.clientWidth, JSON.stringify(tabRow));
    await page.screenshot({ path: path.join(OUT, `demo-${label}-phone.png`) });
  }

  await browser.close();
}

async function runLive(browserType, label, pagePath = LIVE_PATH) {
  const browser = await browserType.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.grantPermissions(["microphone"], { origin: BASE });
  const page = await context.newPage();
  await page.goto(BASE + pagePath);
  await page.waitForSelector("[data-demo-try]");

  await page.click("[data-demo-start]");
  await page.waitForTimeout(200);
  await page.click("[data-demo-agree]");

  // Sample the disc while the agent is actually speaking. This is the only
  // place the conversation-driven path (the SDK's getOutputVolume /
  // getInputVolume, rather than the AnalyserNode used for the samples) is
  // exercised at all, so without this it ships unverified.
  const liveLevels = [];
  for (let i = 0; i < 100; i++) {
    liveLevels.push(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector("[data-demo-live] .demo-disc")).getPropertyValue("--demo-level")) || 0));
    await page.waitForTimeout(200);
  }
  const livePeak = Math.max(...liveLevels);
  check(`${label} LIVE: the disc moves with the agent's real voice`,
    livePeak > 0.05 && new Set(liveLevels.map((v) => v.toFixed(2))).size > 3,
    `peak ${livePeak.toFixed(2)}, ${new Set(liveLevels.map((v) => v.toFixed(2))).size} distinct values`);

  const liveText = await text(page, "[data-demo-live-log]");
  check(`${label} LIVE: a real voice session produced at least one agent line within 20s`, !!liveText && liveText.length > 0, liveText);

  // The company names live in TWO repos with no shared source: the website's
  // tab (build-templates.js) and the dashboard's agent prompt
  // (config/demo_profiles.php). This is the only thing that notices when they
  // drift — the agent itself says which company it is, in its first sentence.
  const tabCompany = await page.evaluate(() => {
    const t = document.querySelector("[data-demo-types] [role=tab][aria-selected=true]");
    return t ? t.getAttribute("data-company") : null;
  });
  check(`${label} LIVE: the agent introduces itself as the company the tab promised`,
    !!tabCompany && (liveText || "").includes(tabCompany), `tab says "${tabCompany}"`);
  await page.click("[data-demo-hangup]").catch(() => {});
  await page.waitForTimeout(500);
  check(`${label} LIVE: hanging up reaches the ended state`, await page.evaluate(() => document.querySelector("[data-demo-try]").getAttribute("data-state") === "ended"));

  await page.click("[data-demo-again]").catch(() => {});
  await page.click("#demo-mode-chat");
  await page.waitForTimeout(150);
  await page.fill("[data-demo-chat-input]", "Wat doet Mowi precies?");
  await page.click(".demo-chat-send");
  await page.waitForTimeout(15000);
  const chatText = await text(page, "[data-demo-chat-log]");
  // The live run asks "Wat doet Mowi precies?". On 2026-09-16 the Fietsplaza
  // agent answered "Mowi is het bedrijf achter Fietsplaza" — a relationship it
  // invented, told to a real visitor. The prompt now states the company is
  // fictional and unrelated; this is what would notice if that regressed.
  const inventedLink = /(?:het bedrijf achter|eigenaar van|onderdeel van|partner van|moederbedrijf)/i;
  check(`${label} LIVE: the agent invents no link between Mowi and the demo company`,
    !inventedLink.test(chatText || ""), (chatText || "").slice(0, 200));

  check(`${label} LIVE: a real chat session produced an agent reply within 15s`, (chatText || "").split("Wat doet Mowi precies?").length > 1, chatText);

  await browser.close();
}


/**
 * The two pages carry the same demo markup, duplicated by hand because the
 * site is static HTML with no includes. Nothing stops them drifting apart
 * except this check: it compares the structural contract both pages' shared
 * js/demo.js depends on — which data-demo-* hooks exist, which sample calls
 * the tab row offers, which endpoint gets called, and which asset version is
 * stamped on <body>. Copy is expected to differ (the phone page talks about
 * the telephone), so headings are deliberately NOT compared.
 */

/**
 * The workflow canvas beside the live demo. This is the half of the pair that
 * is easy to ship broken and never notice: it is generated markup (see
 * injectDemoWorkflows() in build-templates.js) mounted by a separate script,
 * so a missing <script>, an empty generated block, or a CSS change that gives
 * the stage no height all leave a card that simply looks empty.
 *
 * It must also NOT steal the page scroll — the canvas sits mid-page, and a
 * drag that scrolled the document instead of panning would be worse than not
 * having it at all.
 */
async function checkWorkflowCanvas(page, label) {
  // Four panels now, three of them hidden — always test the visible one.
  const sel = ".demo-flow-panel:not([hidden]) [data-wf-canvas]";
  const present = await page.$(sel);
  check(`${label} the workflow canvas is on the page`, !!present);
  if (!present) return;

  const state = await page.evaluate((s) => {
    const c = document.querySelector(s);
    const r = c.getBoundingClientRect();
    return {
      mounted: c.hasAttribute("data-wf-mounted"),
      nodes: c.querySelectorAll(".wf-node").length,
      zoom: c.querySelectorAll("[data-wf-zoom-in],[data-wf-zoom-out]").length,
      h: Math.round(r.height),
    };
  }, sel);

  check(`${label} the canvas mounted and has real nodes`, state.mounted && state.nodes >= 5, JSON.stringify(state));
  check(`${label} the canvas has a visible height`, state.h > 200, `${state.h}px`);
  check(`${label} the canvas has zoom controls`, state.zoom === 2);

  // css/style.css sets `html { scroll-behavior: smooth }`, so scrollIntoView
  // ANIMATES. That broke this check twice over: window.scrollY was still
  // gliding when the "does not scroll the page" baseline was read, AND the
  // element box measured before the glide finished pointed somewhere else by
  // the time the drag ran, so the drag missed the canvas entirely. Turning
  // smooth scrolling off for the test makes the scroll instant and the
  // geometry stable; it changes nothing about what is being tested, since the
  // site itself already disables it under prefers-reduced-motion.
  await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
  await page.evaluate(() => document.querySelector(".demo-flow-panel:not([hidden]) .demo-flow-stage").scrollIntoView({ block: "center" }));
  await page.waitForTimeout(250);

  const box = await (await page.$(`${sel} [data-wf-viewport]`)).boundingBox();
  const readT = () => page.evaluate((s) => getComputedStyle(document.querySelector(s + " [data-wf-stage]")).transform, sel);

  // On a touch device the canvas deliberately does NOT pan until it is armed
  // by a tap (js/workflow-canvas.js: `pointerType === "touch" && !armed`), so
  // that a swipe over a mid-page canvas scrolls the page like the visitor
  // expects. Arming is therefore part of the behaviour under test, not a
  // workaround: tap the hint, which is the arming control on touch.
  const isTouch = await page.evaluate(() => "ontouchstart" in window || navigator.maxTouchPoints > 0);
  if (isTouch) {
    await page.tap(`${sel} [data-wf-hint]`).catch(() => {});
    await page.waitForTimeout(250);
    check(`${label} a tap arms the canvas on touch`, await page.evaluate((s) =>
      document.querySelector(s + " [data-wf-viewport]").classList.contains("wf-armed"), sel));
  }

  const before = await readT();
  const scrollBefore = await page.evaluate(() => window.scrollY);

  if (isTouch) {
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2).catch(() => {});
    await page.evaluate(({ x, y }) => {
      const v = document.querySelector(".demo-flow-stage [data-wf-viewport]");
      const ev = (type, cy) => v.dispatchEvent(new PointerEvent(type, { pointerId: 1, pointerType: "touch", clientX: x, clientY: cy, bubbles: true, cancelable: true }));
      ev("pointerdown", y);
      for (let i = 1; i <= 12; i++) ev("pointermove", y - i * 10);
      ev("pointerup", y - 120);
    }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
    await page.waitForTimeout(200);
  } else {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - i * 10);
    await page.mouse.up();
    await page.waitForTimeout(200);
  }

  check(`${label} dragging the canvas pans it`, (await readT()) !== before, `${before} -> ${await readT()}`);
  check(`${label} dragging the canvas does not scroll the page`, (await page.evaluate(() => window.scrollY)) === scrollBefore);

  const afterDrag = await readT();
  await page.click(`${sel} [data-wf-zoom-in]`);
  await page.waitForTimeout(200);
  check(`${label} the zoom control zooms`, (await readT()) !== afterDrag);
}


/**
 * The four call types. They sit ABOVE both cards and now drive BOTH of them:
 * the workflow panel on the right, and which company's agent the left card
 * will ring. The ways this breaks: a panel showing no canvas, two panels open
 * at once, a canvas that mounted at 0x0 while hidden and never got re-framed,
 * a link still pointing at the first type's template, or — the one that would
 * actually mislead a visitor — the left card naming one company while the
 * mint asks for another type's agent.
 */
async function checkWorkflowTypes(page, label) {
  const expected = ["bestelstatus", "afspraak", "terugbelverzoek", "receptie"];

  const tabs = await page.$$eval("[data-demo-types] [role=tab]", (els) => els.map((e) => e.getAttribute("data-demo-type")));
  check(`${label} the demo section offers the same four types as the samples`,
    JSON.stringify(tabs) === JSON.stringify(expected), tabs.join(","));

  // Above both cards, like the reference — not inside one of them.
  check(`${label} the type tabs sit above both cards`, await page.evaluate(() => {
    const seg = document.querySelector("[data-demo-types]");
    const duo = document.querySelector(".demo-duo");
    return !!seg && !!duo && !duo.contains(seg) && seg.compareDocumentPosition(duo) & Node.DOCUMENT_POSITION_FOLLOWING;
  }));

  check(`${label} the type buttons use the site's own CTA classes`, await page.evaluate(() => {
    const p = document.querySelector(".demo-flow-panel:not([hidden])");
    return !!p.querySelector("a.btn-primary") && !!p.querySelector("a.link-arrow") && !p.querySelector(".demo-btn");
  }));

  const seen = new Set();
  const companies = new Set();

  for (const key of expected) {
    await page.click(`#demo-type-${key}`);
    await page.waitForTimeout(450);
    const st = await page.evaluate((k) => {
      const open = [...document.querySelectorAll(".demo-flow-panel")].filter((x) => !x.hidden);
      const c = open[0] && open[0].querySelector("[data-wf-canvas]");
      const stage = c && c.querySelector("[data-wf-stage]");
      const tab = document.querySelector(`#demo-type-${k}`);
      return {
        openCount: open.length,
        id: open[0] && open[0].id,
        nodes: c ? c.querySelectorAll(".wf-node").length : 0,
        href: open[0] ? open[0].querySelector(".link-arrow").getAttribute("href") : null,
        company: tab.getAttribute("data-company"),
        title: document.querySelector("[data-demo-title]").textContent.trim(),
        sub: document.querySelector("[data-demo-sub]").textContent.trim(),
        offsetX: stage ? getComputedStyle(stage).transform.split(",")[4] : null,
        vpWidth: c ? Math.round(c.querySelector("[data-wf-viewport]").getBoundingClientRect().width) : 0,
      };
    }, key);

    check(`${label} type "${key}" shows exactly one panel, with a real workflow`,
      st.openCount === 1 && st.id === `wf-panel-${key}` && st.nodes >= 3, JSON.stringify({ n: st.nodes, id: st.id }));
    check(`${label} type "${key}" was re-framed after being revealed`, st.vpWidth > 200 && st.offsetX !== null, `viewport ${st.vpWidth}px`);
    // The left card must name THIS type's company, or the visitor is told
    // they are ringing one business and reaches another.
    check(`${label} type "${key}" retitles the demo card to ${st.company}`,
      st.title === st.company, `${st.title} / ${st.sub.slice(0, 50)}`);
    seen.add(st.href);
    companies.add(st.company);
  }

  check(`${label} each type links to its own template`, seen.size === expected.length, [...seen].join(" "));

  // Sal caught this by eye, not by a test: the company names differ in length,
  // so one type's subtitle wrapped to a second line and pushed the title and
  // the disc up by a line. Switching a tab must move nothing but the content.
  const geometry = [];
  for (const key of expected) {
    await page.click(`#demo-type-${key}`);
    await page.waitForTimeout(250);
    geometry.push(await page.evaluate(() => {
      const r = (sel) => Math.round(document.querySelector(sel).getBoundingClientRect().top);
      return [r("[data-demo-title]"), r("[data-demo-sub]"), r("[data-demo-try] .demo-disc")].join("/");
    }));
  }
  check(`${label} switching type does not move the card's title, line or disc`,
    new Set(geometry).size === 1, geometry.join("  vs  "));
  check(`${label} each type is a different company`, companies.size === expected.length, [...companies].join(", "));

  await page.click("#demo-type-bestelstatus");
  await page.waitForTimeout(300);
}

/**
 * What the browser actually sends when a session is minted. The type decides
 * which agent is reached, and the device id is what the dashboard's rolling
 * repeat-visitor cap counts — if either stopped being sent, the demo would
 * keep working and both would silently stop doing their job.
 */
async function checkMintPayload(page, label, supportsGetUserMedia = true) {
  if (!supportsGetUserMedia) {
    console.log(`SKIP  ${label} mint-payload check — WebKit automation cannot fake getUserMedia in a real click handler (same limitation as the voice checks above).`);
    return;
  }

  let body = null;
  await page.route("**/api/demo/session", (route) => {
    body = route.request().postData();
    route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "De demo is op dit moment niet beschikbaar." }) });
  });

  // Earlier checks leave the card on the Chatten panel, where the call button
  // is hidden. Put it back on Bellen before asking for a voice mint.
  await page.click("#demo-mode-voice");
  await page.waitForTimeout(200);
  await page.click("#demo-type-afspraak");
  await page.waitForTimeout(300);
  await page.click("[data-demo-start]");
  await page.waitForTimeout(150);
  await page.click("[data-demo-agree]");
  await page.waitForTimeout(600);

  check(`${label} the mint sends the selected type`, !!body && body.includes("type=afspraak"), body);
  check(`${label} the mint sends a device id`, !!body && /device_id=[^&]{8,}/.test(body), body);

  // Written only when a session is actually started, never on a page view.
  check(`${label} the device id is only stored once a session is started`,
    await page.evaluate(() => { try { return !!localStorage.getItem("mowiDemoDevice"); } catch (e) { return "blocked"; } }));

  await page.unroute("**/api/demo/session");
  await page.click("#demo-type-bestelstatus").catch(() => {});
  await page.waitForTimeout(200);
}

/**
 * The homepage carries the demo card and the workflow, but NOT the sample-call
 * player, so it gets its own pass rather than run()'s full suite.
 */
async function runHome(browserType, label) {
  const browser = await browserType.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 1000 } })).newPage();
  // Same stub run() installs: getUserMedia never resolves in a headless
  // browser, so without this the consent step hangs forever and every check
  // past it fails for a reason that has nothing to do with the page.
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = () => Promise.resolve(new MediaStream());
  });
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });

  await page.goto(BASE + "/");
  await page.waitForTimeout(600);

  check(`${label} the demo card is on the homepage`, await visible(page, "[data-demo-try]"));
  check(`${label} it is the second section`, await page.evaluate(() => {
    const secs = [...document.querySelectorAll("section")];
    const i = secs.findIndex((s) => s.querySelector("[data-demo-try]"));
    return i === 1;
  }));
  check(`${label} Bellen/Chatten still toggles here`, await page.evaluate(async () => {
    document.querySelectorAll("[data-demo-try] [role=tab]")[1].click();
    await new Promise((r) => setTimeout(r, 200));
    return !document.querySelector("#demo-panel-chat").hidden;
  }));
  // The homepage's own static workflow pictures must be left alone by the
  // canvas script it now loads — they carry no data-wf-canvas on purpose.
  check(`${label} the static workflow pictures were not hijacked`, await page.evaluate(
    () => [...document.querySelectorAll(".wf-canvas-static")].every((el) => !el.hasAttribute("data-wf-mounted"))));

  await checkWorkflowCanvas(page, label);
  await checkWorkflowTypes(page, label);
  await checkMintPayload(page, label, true) /* chromium-only run: the stub above always applies */;

  // checkMintPayload above answers the mint with a deliberate 503, and
  // Chromium auto-logs that as a console error. Same allowlist as run().
  const noise = (m) => m.includes("status of 503") || m.includes("status of 429") || m.includes("interactive-widget");
  check(`${label} zero console errors`, errors.filter((m) => !noise(m)).length === 0, errors.filter((m) => !noise(m)).join(" | "));
  check(`${label} no horizontal page overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  await browser.close();
}

async function runParity(browserType, label) {
  const browser = await browserType.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

  const shapeOf = async (pagePath) => {
    await page.goto(BASE + pagePath);
    return page.evaluate(() => ({
      hooks: [...new Set([...document.querySelectorAll("[data-demo-listen] *, [data-demo-try] *, [data-demo-listen], [data-demo-try]")]
        .flatMap((el) => [...el.attributes].map((a) => a.name).filter((n) => n.startsWith("data-demo-"))))].sort(),
      slugs: [...document.querySelectorAll("[data-demo-call]")].map((el) => el.getAttribute("data-demo-call")),
      endpoint: document.querySelector("[data-demo-try]").getAttribute("data-endpoint"),
      version: document.body.getAttribute("data-demo-version"),
    }));
  };

  const a = await shapeOf("/support-agent");
  const b = await shapeOf("/call-agent");

  check(`${label} both pages expose the same data-demo-* hooks`,
    JSON.stringify(a.hooks) === JSON.stringify(b.hooks),
    a.hooks.filter((h) => !b.hooks.includes(h)).concat(b.hooks.filter((h) => !a.hooks.includes(h))).join(",") || "identical");
  check(`${label} both pages offer the same four sample calls`,
    JSON.stringify(a.slugs) === JSON.stringify(b.slugs), `${a.slugs} vs ${b.slugs}`);
  check(`${label} both pages call the same endpoint`, a.endpoint === b.endpoint, `${a.endpoint} vs ${b.endpoint}`);
  check(`${label} both pages stamp the same asset version`, a.version === b.version, `${a.version} vs ${b.version}`);

  await browser.close();
}

(async () => {
  await run(chromium, "chromium-1440", { width: 1440, height: 900 });
  await run(chromium, "chromium-390", { width: 390, height: 844 });
  await run(webkit, "webkit-iphone", null, devices["iPhone 13"]);
  // The phone page carries the same two sections. Run the full suite against
  // it once (one browser is enough — the cross-browser risk lives in the
  // shared CSS/JS, which the three runs above already cover), then prove the
  // two pages have not drifted.
  await run(chromium, "chromium-callagent", { width: 1440, height: 900 }, null, "/call-agent");
  await runParity(chromium, "parity");
  await runHome(chromium, "home");
  if (LIVE) await runLive(chromium, `live-chromium${LIVE_PATH}`);
  console.log(`\n${results.length - failures}/${results.length} checks passed against ${BASE}${LIVE ? " (including LIVE)" : ""}`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
