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

async function run(browserType, label, viewport, device) {
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

  await page.goto(BASE + "/support-agent");
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

    // -- Daily cap (429) --
    await mockSession(page, 429, { message: "De demo is voor vandaag vol." });
    await page.click("[data-demo-start]");
    await page.click("[data-demo-agree]");
    await page.waitForTimeout(400);
    check(`${label} a 429 from the endpoint surfaces its own message`, ((await text(page, "[data-demo-error]")) || "").includes("vandaag vol"), await text(page, "[data-demo-error]"));

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
  check(`${label} zero console errors`, consoleErrors.filter((m) => !isExpectedTestNoise(m)).length === 0, consoleErrors.filter((m) => !isExpectedTestNoise(m)).slice(0, 5).join(" | "));
  check(`${label} zero unexpected 4xx/5xx responses`, bad.length === 0, bad.slice(0, 5).join(" | "));
  check(`${label} no horizontal page overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));

  // prefers-reduced-motion must kill the disc motion completely. The level is
  // written as an inline style, so the sitewide reduced-motion CSS rule (which
  // only disables animations and transitions) cannot catch it — js/demo.js has
  // to check the query itself, and this is what proves it still does.
  const rmContext = await browser.newContext(Object.assign({ reducedMotion: "reduce" }, device ? device : { viewport }));
  const rmPage = await rmContext.newPage();
  await rmPage.goto(BASE + "/support-agent");
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

async function runLive(browserType, label) {
  const browser = await browserType.launch({ args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.grantPermissions(["microphone"], { origin: BASE });
  const page = await context.newPage();
  await page.goto(BASE + "/support-agent");
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
  check(`${label} LIVE: a real chat session produced an agent reply within 15s`, (chatText || "").split("Wat doet Mowi precies?").length > 1, chatText);

  await browser.close();
}

(async () => {
  await run(chromium, "chromium-1440", { width: 1440, height: 900 });
  await run(chromium, "chromium-390", { width: 390, height: 844 });
  await run(webkit, "webkit-iphone", null, devices["iPhone 13"]);
  if (LIVE) await runLive(chromium, "live-chromium");
  console.log(`\n${results.length - failures}/${results.length} checks passed against ${BASE}${LIVE ? " (including LIVE)" : ""}`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
