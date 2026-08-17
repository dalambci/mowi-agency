/* Mowi — shared vanilla JS behaviour (rebuild v2, Stage 0: Foundation).
   No framework, no build step. Clean rewrite of the rebrand-era main.js —
   see git history on `master` for that version.

   Cut per the "no invented motion" constraint (see CLAUDE.md): magnetic-
   hover pointer-tracking on buttons, scroll-triggered reveal-on-intersection
   fade/slide-in ([data-reveal]/IntersectionObserver choreography), the
   task->hub->result flying-card showcase, the homepage configurator-demo,
   the word-by-word statement reveal, the agent-feed ticker, and the pricing
   calculator — all page-specific widgets belonging to pages not yet rebuilt
   in v2, or superseded by the generic .chat-input engine below. Kept:
   header scroll state, mobile nav + dropdown mechanics, FAQ accordion, and
   the shared typing engine (typeInto), now generalized into initChatInput()
   — the one confirmed-observed animation pattern (shapes.co's auto-playing
   hero chat input) — plus initPillTabs() and initCardStrip(). */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Sticky header compaction on scroll --------------------------------------
const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  const updateHeaderScrolled = () => {
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 0);
  };
  updateHeaderScrolled();
  window.addEventListener("scroll", updateHeaderScrolled, { passive: true });
}

// --- Mobile nav toggle -----------------------------------------------------
const navToggle = document.getElementById("navToggle");
const mainNav = document.getElementById("main-nav");

function closeMobileNav() {
  if (!navToggle || !mainNav) return;
  navToggle.setAttribute("aria-expanded", "false");
  mainNav.classList.remove("is-open");
  document.body.classList.remove("nav-open");
  document.body.style.overflow = "";
}

if (navToggle && mainNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closeMobileNav();
    } else {
      navToggle.setAttribute("aria-expanded", "true");
      mainNav.classList.add("is-open");
      document.body.classList.add("nav-open");
      document.body.style.overflow = "hidden";
    }
  });

  // Close the mobile sheet after tapping a real link, so navigation feels
  // instant. Dropdown triggers are <button>s, not <a>, so they're unaffected.
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  // Tapping the dimmed backdrop (body.nav-open::after, see css/style.css)
  // closes the sheet.
  document.body.addEventListener("click", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (mainNav.contains(event.target) || navToggle.contains(event.target)) return;
    closeMobileNav();
  });
}

// --- Nav dropdown ("Product" mega-menu) -------------------------------------
// Click-to-toggle here; hover-to-open at desktop widths is pure CSS (see
// .nav-dropdown:hover in style.css). Wired here too because hover has no
// touch equivalent, and it's the only way keyboard users (Tab + Enter/Space)
// can open/close it. Open/close animation itself is pure CSS, keyed off
// aria-expanded — this just flips the attribute.
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

// Escape closes an open dropdown and returns focus to its trigger.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll('.nav-dropdown-trigger[aria-expanded="true"]').forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  });
});

// --- FAQ accordion -----------------------------------------------------------
document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
  const panel = document.getElementById(trigger.getAttribute("aria-controls"));
  if (!panel) return;

  trigger.addEventListener("click", () => {
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!isOpen));
    panel.style.maxHeight = isOpen ? "" : `${panel.scrollHeight}px`;
  });
});

// --- Shared helpers ------------------------------------------------------------

// Stops/resumes a callback pair while `el` is scrolled off-screen, so
// nothing burns CPU (a setInterval/typing loop) while invisible. A widget
// that never gets observed (no IntersectionObserver support) just keeps
// running unconditionally, which is still fine.
function pauseWhenOffscreen(el, onEnter, onLeave) {
  if (!el || !("IntersectionObserver" in window)) {
    onEnter();
    return;
  }
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) onEnter();
        else onLeave();
      });
    },
    { threshold: 0.15 }
  ).observe(el);
}

// Types `text` into el at a fixed rate ("watching Mowi write", not reading
// along), then calls done(). Shared by every typed-copy interaction on the
// site — do not duplicate this loop elsewhere; extend callers instead.
function typeInto(el, text, done) {
  let charIndex = 0;
  function typeChar() {
    el.textContent = text.slice(0, charIndex);
    if (charIndex < text.length) {
      charIndex += 1;
      setTimeout(typeChar, 22);
      return;
    }
    done();
  }
  typeChar();
}

// ==========================================================================
// Chat input — the signature device ("describe what you want handled").
// The ONE confirmed-observed animation pattern kept from the reference
// review (shapes.co's hero chat input auto-playing through an example
// question into a "Thinking…" state, no click involved).
//
// Usage contract:
//   <div class="chat-input" data-mode="auto-play"
//        data-prompts="Vraag 1|Vraag 2|Vraag 3"
//        data-results="Resultaat 1|Resultaat 2|Resultaat 3">
//     <div class="chat-input-field">
//       <span class="chat-input-text" data-chat-text></span><span
//       class="chat-input-caret" data-chat-caret aria-hidden="true"></span>
//       <span class="chat-input-placeholder" data-chat-placeholder>Beschrijf
//       wat u geregeld wilt hebben…</span>
//     </div>
//     <button type="button" class="chat-input-submit" aria-label="Versturen">…</button>
//   </div>
//   <div class="chat-input-thinking" data-chat-thinking hidden>Mowi denkt
//     na… <span class="chat-input-dots"><span></span><span></span><span></span></span></div>
//   <div class="chat-input-result" data-chat-result hidden></div>
//
// - data-mode="idle" (or omitted): static placeholder, no JS needed at all.
// - data-mode="auto-play": loops through data-prompts (pipe-separated),
//   typing each one, pausing, showing the "Mowi denkt na…" state, then
//   data-results' matching entry (same index, pipe-separated, same count as
//   prompts). Gated on IntersectionObserver (via pauseWhenOffscreen) so it
//   only plays while in view — this starts/stops a timer, it does not
//   choreograph a reveal-on-scroll opacity/transform effect.
// - prefers-reduced-motion: skips straight to a static final frame (first
//   prompt fully typed, its result shown, no loop, no caret).
// - Call initChatInput(el, opts) directly to override the element's own
//   data-attributes (opts.mode / opts.prompts / opts.results), or just drop
//   a `.chat-input` with the right data-attributes on any page — every
//   `.chat-input` on the page auto-initializes on load (see bottom of this
//   block).
// ==========================================================================
function initChatInput(el, opts = {}) {
  const mode = opts.mode || el.dataset.mode || "idle";
  const textEl = el.querySelector("[data-chat-text]");
  if (!textEl || mode !== "auto-play") return; // idle mode is static markup, nothing to wire up

  const placeholderEl = el.querySelector("[data-chat-placeholder]");
  const responseRoot = el.closest(".chat-input-frame") || el.parentElement;
  const thinkingEl = (responseRoot && responseRoot.querySelector("[data-chat-thinking]")) || null;
  const resultEl = (responseRoot && responseRoot.querySelector("[data-chat-result]")) || null;

  const prompts = (opts.prompts || (el.dataset.prompts || "").split("|"))
    .map((s) => s.trim())
    .filter(Boolean);
  const results = (opts.results || (el.dataset.results || "").split("|")).map((s) => s.trim());
  if (!prompts.length) return;

  if (prefersReducedMotion) {
    textEl.textContent = prompts[0];
    if (placeholderEl) placeholderEl.hidden = true;
    if (results[0] && resultEl) {
      resultEl.textContent = results[0];
      resultEl.hidden = false;
    }
    if (thinkingEl) thinkingEl.hidden = true;
    return;
  }

  let visible = false;
  let running = false;
  let promptIndex = 0;

  function resetFrame() {
    textEl.textContent = "";
    if (placeholderEl) placeholderEl.hidden = false;
    el.classList.remove("is-caret-visible");
    if (thinkingEl) thinkingEl.hidden = true;
    if (resultEl) {
      resultEl.hidden = true;
      resultEl.textContent = "";
    }
  }

  function playOnce(onDone) {
    const prompt = prompts[promptIndex % prompts.length];
    const result = results[promptIndex % results.length] || "";
    resetFrame();
    if (placeholderEl) placeholderEl.hidden = true;
    el.classList.add("is-caret-visible");

    typeInto(textEl, prompt, () => {
      setTimeout(() => {
        el.classList.remove("is-caret-visible");
        if (thinkingEl) thinkingEl.hidden = false;
        setTimeout(() => {
          if (thinkingEl) thinkingEl.hidden = true;
          if (resultEl && result) {
            resultEl.textContent = result;
            resultEl.hidden = false;
          }
          setTimeout(onDone, 2200); // hold on the finished result before the loop moves on
        }, 1100); // "Mowi denkt na…" hold
      }, 350); // brief pause between "typing stops" and "thinking" starting
    });
  }

  function loop() {
    if (!visible) {
      running = false;
      return;
    }
    running = true;
    playOnce(() => {
      promptIndex += 1;
      setTimeout(loop, 500);
    });
  }

  pauseWhenOffscreen(
    el,
    () => {
      visible = true;
      if (!running) loop();
    },
    () => {
      visible = false;
    }
  );
}

document.querySelectorAll(".chat-input").forEach((el) => initChatInput(el));

// ==========================================================================
// Pill tabs — role="tablist"/"tab" + panels with [hidden]. Active tab swaps
// instantly (no slide/bounce). Supports activating a tab from a URL hash on
// load (e.g. #email-agent activates the tab whose aria-controls="email-agent").
//
// Markup contract:
//   <div data-pill-tabs>
//     <div class="pill-tablist" role="tablist" aria-label="…">
//       <button class="pill-tab" role="tab" id="tab-x" aria-selected="true"
//         aria-controls="x">…</button>
//       …
//     </div>
//     <div class="pill-panels">
//       <div class="pill-panel" id="x" role="tabpanel" aria-labelledby="tab-x">…</div>
//       <div class="pill-panel" id="y" role="tabpanel" aria-labelledby="tab-y" hidden>…</div>
//     </div>
//   </div>
//
// Every `[data-pill-tabs]` on the page auto-initializes on load.
// ==========================================================================
function initPillTabs(container) {
  const tabs = [...container.querySelectorAll('[role="tab"]')];
  const panels = [...container.querySelectorAll('[role="tabpanel"]')];
  if (!tabs.length) return;

  function activate(tab, { focus = false } = {}) {
    if (!tab) return;
    tabs.forEach((t) => {
      const selected = t === tab;
      t.setAttribute("aria-selected", String(selected));
      t.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((p) => {
      p.hidden = p.id !== tab.getAttribute("aria-controls");
    });
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", (event) => {
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      let next = i;
      if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      activate(tabs[next], { focus: true });
    });
  });

  const hashId = window.location.hash.slice(1);
  const hashTab = hashId && tabs.find((t) => t.getAttribute("aria-controls") === hashId);
  activate(hashTab || tabs.find((t) => t.getAttribute("aria-selected") === "true") || tabs[0]);
}

document.querySelectorAll("[data-pill-tabs]").forEach(initPillTabs);

// ==========================================================================
// Card strip — native horizontal scroll + scroll-snap, optional click-drag,
// and an arrow affordance that fades once scrolled near the end.
//
// Markup contract:
//   <div class="card-strip-wrap">
//     <div class="card-strip" data-card-strip>…strip-card elements…</div>
//     <button class="card-strip-arrow" data-card-strip-arrow aria-label="Verder scrollen">→</button>
//   </div>
//
// Every `[data-card-strip]` on the page auto-initializes on load.
// ==========================================================================
function initCardStrip(track) {
  const wrap = track.closest(".card-strip-wrap") || track.parentElement;
  const arrow = wrap ? wrap.querySelector("[data-card-strip-arrow]") : null;

  function updateArrow() {
    if (!arrow) return;
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    arrow.dataset.atEnd = String(atEnd);
  }

  track.addEventListener("scroll", updateArrow, { passive: true });
  window.addEventListener("resize", updateArrow);
  updateArrow();

  if (arrow) {
    arrow.addEventListener("click", () => {
      track.scrollBy({ left: track.clientWidth * 0.8, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  // Optional click-and-drag scrolling for mice/trackpads, alongside the
  // native touch/wheel scroll every browser already gives this for free.
  let isDown = false;
  let startX = 0;
  let startScroll = 0;

  track.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") return; // native touch scroll handles this
    isDown = true;
    startX = event.clientX;
    startScroll = track.scrollLeft;
    track.classList.add("is-dragging");
  });

  track.addEventListener("pointermove", (event) => {
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
}

document.querySelectorAll("[data-card-strip]").forEach(initCardStrip);

// --- Analytics event hooks ----------------------------------------------------
// window.plausible only exists once the Plausible <script> tag (kept as-is
// in every page's <head>) has loaded — an ad-blocker strips it on some
// sessions, so mowiTrack stays a silent no-op then.
function mowiTrack(name, props) {
  if (typeof window.plausible === "function") {
    window.plausible(name, props ? { props } : undefined);
  }
}

// Generic [data-event="Event Name" data-event-prop="value"] delegation.
// Deliberately NOT keyed off .btn-primary — that class is reused for things
// that aren't the sitewide booking CTA. Each dataset key past "event" itself
// becomes a lowerCamel prop: data-event-agent="email-triage" -> { agent: "email-triage" }.
document.addEventListener("click", (event) => {
  const el = event.target.closest("[data-event]");
  if (!el) return;
  const name = el.getAttribute("data-event");
  const props = {};
  Object.entries(el.dataset).forEach(([key, value]) => {
    if (key === "event" || !key.startsWith("event")) return;
    const propName = key.slice(5);
    props[propName.charAt(0).toLowerCase() + propName.slice(1)] = value;
  });
  if (name === "CTA Click" && !("page" in props)) props.page = window.location.pathname;
  mowiTrack(name, props);
});

// Calendly posts this message to the embedding window the moment a booking
// is confirmed inside the inline widget (/demo). Harmless on any page
// without the widget — it just never fires.
window.addEventListener("message", (event) => {
  if (event.data && event.data.event === "calendly.event_scheduled") {
    mowiTrack("Call Booked", { page: window.location.pathname });
  }
});
