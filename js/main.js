/* Mowi — shared vanilla JS behaviour. No framework, no build step.
   Two of the interactions requested for this site (the marquee pause-on-
   hover and smooth-scroll to anchors like #afspraak) are pure CSS —
   `animation-play-state` and `scroll-behavior: smooth` — and don't need any
   JS. See css/style.css for those. */

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// --- Sticky header compaction on scroll --------------------------------------
// Matches vuewer.com's own pattern (their header does
// `x-init="window.addEventListener('scroll', () => scrolled = window.scrollY > 0)"`)
// — see css/style.css's .site-header.is-scrolled for the actual top-offset
// values this toggles between.
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

  // Close the mobile menu after tapping a link, so navigation feels instant.
  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMobileNav);
  });

  // Tapping the dimmed backdrop (body.nav-open::after, see css/style.css)
  // closes the sheet — the backdrop itself is a pseudo-element, so this
  // listens on body and bails out for clicks that landed on the panel or
  // the toggle button itself.
  document.body.addEventListener("click", (event) => {
    if (!document.body.classList.contains("nav-open")) return;
    if (mainNav.contains(event.target) || navToggle.contains(event.target)) return;
    closeMobileNav();
  });
}

// --- Contact CTAs: skip the Calendly-widget scroll on desktop ---------------
// On mobile, jumping straight to the booking widget after tapping a CTA
// reads as natural — it's right below the hero already. On desktop the
// same jump can scroll a full page length past content the click had
// nothing to do with, which reads as jarring rather than helpful; land on
// the page itself instead (and if already on /contact, just stay put —
// no scroll at all). Checked at click time, not once at load, against the
// site's own mobile/desktop nav breakpoint (48rem, see .main-nav above in
// style.css), so a resize between load and click is still honored.
document.querySelectorAll('a[href$="#calendly-widget"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    if (!window.matchMedia("(min-width: 48rem)").matches) return; // mobile: keep the native scroll
    event.preventDefault();
    const target = link.getAttribute("href").replace("#calendly-widget", "");
    if (target) window.location.href = target;
  });
});

// --- Nav dropdown ("Products" mega-menu) ---------------------------------------
// Click-to-toggle here; hover-to-open at desktop/tablet widths is pure CSS
// (see .nav-dropdown:hover in style.css) and needs no JS. This stays wired
// alongside it because hover has no touch equivalent, and it's the only way
// keyboard users (Tab + Enter/Space) can open/close it. The open/closed
// animation itself is pure CSS (max-height accordion on mobile, opacity +
// translate on desktop — see .nav-megamenu in style.css) keyed off
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

// Esc closes an open dropdown and returns focus to its trigger — otherwise
// a keyboard user tabbed into the mega-menu's links would have no way to
// dismiss it short of tabbing all the way back out.
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  document.querySelectorAll('.nav-dropdown-trigger[aria-expanded="true"]').forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
    trigger.focus();
  });
});

// Mobile only, by request — "Platform" (3 items) is naturally shorter than
// "Automations" (5 items); capping Automations to Platform's own rendered
// height, and letting just that list scroll internally
// (.nav-megamenu-scroll in style.css), keeps the two columns visually
// matched instead of the panel growing lopsided. Desktop's panel just sizes
// to its own content, uncapped. Recomputed on load and resize since it
// depends on actual text-wrap at the current column width (360px vs.
// 390px, ...), not a value CSS alone can express — this works even while
// the menu is closed, since overflow-clipping an ancestor doesn't change a
// descendant's own layout size, only what's painted.
const mobileMegaMenuQuery = window.matchMedia("(max-width: 47.9375rem)");

// A custom-drawn track + thumb, not the browser's native scrollbar — iOS
// Safari always auto-hides its native scrollbar and there is no CSS
// override for that, so a *real* permanent indicator has to be an element
// we draw and position ourselves. Created once per Automations list (lazily,
// on first sync) and appended as a sibling of the <ul> inside
// .nav-megamenu-col, which is what it's positioned relative to — not the
// <ul> itself, since anything absolutely positioned inside an
// overflow:auto element scrolls away with its content instead of staying
// put as a fixed rail alongside it.
function ensureScrollIndicator(list) {
  const column = list.parentElement;
  let track = column.querySelector(".nav-megamenu-scrollbar");
  if (!track) {
    track = document.createElement("div");
    track.className = "nav-megamenu-scrollbar";
    track.innerHTML = '<div class="nav-megamenu-scrollbar-thumb"></div>';
    column.appendChild(track);
  }
  // list.offsetTop/clientHeight (not top:0/height:100% in CSS) since the
  // track needs to span just the <ul>, not the label above it too — both
  // live in the same .nav-megamenu-col.
  track.style.top = `${list.offsetTop}px`;
  track.style.height = `${list.clientHeight}px`;
  return track.querySelector(".nav-megamenu-scrollbar-thumb");
}

function syncMegaMenuColumnHeights() {
  document.querySelectorAll(".nav-megamenu").forEach((menu) => {
    const [platformList, automationsList] = menu.querySelectorAll(".nav-megamenu-col ul");
    if (!platformList || !automationsList) return;

    if (mobileMegaMenuQuery.matches) {
      automationsList.style.maxHeight = `${platformList.getBoundingClientRect().height}px`;
      automationsList.classList.add("nav-megamenu-scroll");

      const thumb = ensureScrollIndicator(automationsList);

      // Bottom-edge fade (mask-image, see .nav-megamenu-scroll in
      // style.css) and the thumb's own size/position both signal there's
      // more to scroll to; the fade is removed once actually scrolled to
      // the end so the last item doesn't stay half-faded after the user
      // has already seen it. Listener is bound once per element (guarded
      // via the dataset flag) since this whole function reruns on every
      // resize.
      const updateScrollState = () => {
        const { scrollTop, scrollHeight, clientHeight } = automationsList;
        automationsList.classList.toggle("is-at-bottom", scrollHeight - scrollTop - clientHeight < 2);

        const thumbHeight = Math.max(16, (clientHeight / scrollHeight) * clientHeight);
        const maxScrollTop = scrollHeight - clientHeight;
        const scrollRatio = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0;
        thumb.style.height = `${thumbHeight}px`;
        thumb.style.top = `${(clientHeight - thumbHeight) * scrollRatio}px`;
      };
      if (!automationsList.dataset.scrollFadeBound) {
        automationsList.addEventListener("scroll", updateScrollState, { passive: true });
        automationsList.dataset.scrollFadeBound = "true";
      }
      updateScrollState();
    } else {
      automationsList.style.maxHeight = "";
      automationsList.classList.remove("nav-megamenu-scroll", "is-at-bottom");
      const track = automationsList.parentElement.querySelector(".nav-megamenu-scrollbar");
      if (track) track.remove();
    }
  });
}

syncMegaMenuColumnHeights();
window.addEventListener("resize", syncMegaMenuColumnHeights);

// --- Scroll-reveal animations -----------------------------------------------
// Elements with [data-reveal] fade/rise in once they enter the viewport.
// The animation itself (timing, distance) lives in css/style.css — this just
// flips the class at the right moment. Content only becomes invisible once
// .reveal-armed is added here — if this script never runs, elements simply
// never leave their normal, visible default (see the .reveal-armed comment
// in css/style.css for why the hiding is opt-in, not opt-out).
const revealTargets = document.querySelectorAll("[data-reveal]");

if (revealTargets.length && "IntersectionObserver" in window) {
  revealTargets.forEach((el) => el.classList.add("reveal-armed"));

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  revealTargets.forEach((el) => revealObserver.observe(el));
} else {
  // No IntersectionObserver support (or nothing to reveal): show everything.
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

// --- Hero entrance animation -------------------------------------------------
// Copied 1:1 from vuewer.com's own hero: fetched their live HTML + compiled
// JS bundle and read the exact Alpine/GSAP values (delays, easings,
// distances — see css/style.css for the full breakdown, next to the CSS
// classes this drives). Their headline uses GSAP for a per-character
// stagger; this project stays vanilla JS, so setupHeroTextAnimation below
// reimplements the same effect — split into words (so a word never
// line-wraps mid-character) then characters, each getting a --char-delay
// custom property (base delay + 0.03s per character, matching GSAP's
// stagger:0.03) that a plain CSS animation reads.
function setupHeroTextAnimation(el, delay = 0) {
  const words = el.textContent.split(/(\s+)/);
  el.textContent = "";
  let charIndex = 0;
  words.forEach((word) => {
    if (word.trim() === "") {
      el.appendChild(document.createTextNode(word));
      return;
    }
    const wordSpan = document.createElement("span");
    wordSpan.className = "text-reveal-word";
    wordSpan.style.display = "inline-block";
    wordSpan.style.whiteSpace = "nowrap";
    [...word].forEach((char) => {
      const charSpan = document.createElement("span");
      charSpan.className = "text-reveal-char";
      charSpan.textContent = char;
      charSpan.style.setProperty("--char-delay", `${(delay + charIndex * 0.03).toFixed(2)}s`);
      charIndex += 1;
      wordSpan.appendChild(charSpan);
    });
    el.appendChild(wordSpan);
  });
}

const heroContent = document.querySelector(".hero-frame-content");
const heroHeading = heroContent ? heroContent.querySelector(".hero-heading-reveal") : null;

if (heroContent) {
  if (heroHeading && !prefersReducedMotion) setupHeroTextAnimation(heroHeading);

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    heroContent.classList.add("is-revealed");
  } else {
    // Only arm the hidden state right before actually observing — this is
    // the homepage's headline/CTA, so it must never be hidden by CSS alone
    // (see .reveal-armed comment in css/style.css).
    heroContent.classList.add("reveal-armed");
    const heroObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    heroObserver.observe(heroContent);
  }
}

// --- Magnetic button hover ---------------------------------------------------
// Reproduced 1:1 from vuewer.com's own buttons — inspected live via DevTools,
// not just the reference doc's summary. Their nav "Start" pill AND their
// body CTAs ("Get Started" / "More Info") are both wrapped in an Alpine
// component (x-data="hoverFollower()") that nudges the whole button a few
// px toward the pointer — horizontal/vertical translate only, no rotation,
// confirmed by watching the real hover on vuewer.com directly (an earlier
// pass here mistakenly added a tilt based on a noisy inline-style reading;
// the button stays level). No shadow either — per request, buttons have no
// hover box-shadow.
//
// Direction always stays up-and-right: on entry the button pops straight
// to its full up-right nudge (not computed from wherever the pointer
// happened to land — an earlier pass here offset from the button's center
// instead, which made the direction depend on entry position and felt
// inconsistent button to button). It then keeps following the cursor as it
// moves inside the button, but that following is clamped to the same
// up-right quadrant (x never goes below 0, y never goes above 0) instead of
// the full ±range an unclamped magnetic pull would allow — so it still
// visibly tracks the pointer without ever drifting down-left and losing
// the consistent demeanor the initial pop established.
//
// The button doesn't jump straight there — it EASES toward it every
// animation frame (current += (target - current) * EASE), which is what
// actually produces vuewer's smooth, slightly-lagging "chase" feel;
// snapping the transform directly on entry (an earlier pass here) reads as
// far too sharp/aggressive by comparison, even though the CSS transition
// while easing is genuinely instant either way — the smoothing itself is
// the lerp loop, not a transition duration. On pointerleave the CSS
// `transition: transform 380ms cubic-bezier(.2,.8,.2,1)` takes over
// instead, matching vuewer's own spring-back exactly.
//
// The "left behind" box: on vuewer, every one of these buttons actually
// sits inside a second, static element exactly its own size (their
// grandparent — see .btn-slot/.header-cta-slot in style.css) that does NOT
// get this transform, so translating just the button visibly slides it out
// of that fixed slot. This only targets the moving button itself; the slot
// is pure CSS and needs no JS.
//
// .header-dashboard-btn (the login icon in the header) gets a plain,
// unbiased version instead — it still tracks the cursor in whatever
// direction it moves, just without the up-right pop/bias above, since a
// bare icon with no slot/fill behind it (see its own CSS comment in
// style.css) doesn't carry that consistent demeanor the same way the
// filled buttons do.
if (!prefersReducedMotion) {
  const SPRING_BACK = "transform 380ms cubic-bezier(0.2, 0.8, 0.2, 1)";
  const EASE = 0.06; // lower = slower/smoother chase, higher = snappier
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  // Nudge scales with the button's own size so a small icon button gets a
  // proportionally smaller move than a full-width CTA, instead of the same
  // fixed px range for both.
  const maxTranslateFor = (rect) => Math.min(10, Math.min(rect.width, rect.height) * 0.25);

  // Shared easing/reset plumbing for both variants below — onEnter and
  // onMove each return a {x, y} target given the element's current rect
  // (and, for onMove, the pointer event); onEnter is optional (the
  // unbiased variant has no pop, so it's skipped there).
  const setupMagneticHover = (el, { onEnter, onMove }) => {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId = null;

    const tick = () => {
      currentX += (targetX - currentX) * EASE;
      currentY += (targetY - currentY) * EASE;
      el.style.transition = "transform 0s";
      el.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    if (onEnter) {
      el.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        ({ x: targetX, y: targetY } = onEnter(el.getBoundingClientRect()));
        if (rafId === null) rafId = requestAnimationFrame(tick);
      });
    }

    el.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      ({ x: targetX, y: targetY } = onMove(el.getBoundingClientRect(), event));
      if (rafId === null) rafId = requestAnimationFrame(tick);
    });

    const resetTransform = () => {
      targetX = 0;
      targetY = 0;
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      currentX = 0;
      currentY = 0;
      el.style.transition = SPRING_BACK;
      el.style.transform = "translate3d(0, 0, 0)";
    };

    el.addEventListener("pointerleave", resetTransform);
    el.addEventListener("pointercancel", resetTransform);
  };

  document.querySelectorAll(".header-cta, .btn-primary, .btn-secondary").forEach((el) => {
    setupMagneticHover(el, {
      onEnter: (rect) => {
        const m = maxTranslateFor(rect);
        return { x: m, y: -m };
      },
      // Keeps following the cursor after the initial pop, but clamped to
      // the up-right quadrant only — the pointer's position just shifts
      // the button somewhere between "centered" (0,0) and "fully popped"
      // (m, -m), never past either end.
      onMove: (rect, event) => {
        const m = maxTranslateFor(rect);
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        return {
          x: clamp(m * 0.6 + relX * 0.25, 0, m),
          y: clamp(-m * 0.6 + relY * 0.25, -m, 0),
        };
      },
    });
  });

  document.querySelectorAll(".header-dashboard-btn").forEach((el) => {
    setupMagneticHover(el, {
      // No onEnter — plain magnetic tracking, unbiased in any direction.
      onMove: (rect, event) => {
        const m = maxTranslateFor(rect);
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        return {
          x: clamp(relX * 0.25, -m, m),
          y: clamp(relY * 0.25, -m, m),
        };
      },
    });
  });
}

// --- FAQ accordion -----------------------------------------------------------
document.querySelectorAll(".accordion-trigger").forEach((trigger) => {
  const panel = document.getElementById(trigger.getAttribute("aria-controls"));
  if (!panel) return;

  trigger.addEventListener("click", () => {
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!isOpen));
    panel.classList.toggle("is-open", !isOpen);
    panel.style.maxHeight = isOpen ? "" : `${panel.scrollHeight}px`;
  });
});

// --- Analytics event hooks (Website & Conversion plan, Phase 0) --------------
// Phase 1 installs the actual Plausible <script> tag; until then (and on any
// session where an ad-blocker strips it) window.plausible doesn't exist, so
// mowiTrack stays a silent no-op. Built now, alongside the components that
// need to fire these events, so Phase 1 is just "add the script tag and
// verify" — no further code changes.
function mowiTrack(name, props) {
  if (typeof window.plausible === "function") {
    window.plausible(name, props ? { props } : undefined);
  }
}

// Generic [data-event="Event Name" data-event-prop="value"] delegation.
// Deliberately NOT keyed off .btn-primary — that class is reused for things
// that are not the sitewide booking CTA (e.g. the contact form's submit
// button) and would mis-fire "CTA Click" if this listened on the class
// instead. Each dataset key past "event" itself becomes a lowerCamel prop:
// data-event-agent="email-triage" -> { agent: "email-triage" }.
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
  // CTA Click's spec'd prop is { page } — derive it from the URL instead of
  // requiring every CTA instance to hardcode its own page name.
  if (name === "CTA Click" && !("page" in props)) props.page = window.location.pathname;
  mowiTrack(name, props);
});

// Calendly posts this message to the embedding window the moment a booking
// is confirmed inside the inline widget (contact.html today). Harmless on
// any page without the widget — it just never fires.
window.addEventListener("message", (event) => {
  if (event.data && event.data.event === "calendly.event_scheduled") {
    mowiTrack("Call Booked", { page: window.location.pathname });
  }
});

// --- Demo video slot: click-to-play (0.4) -------------------------------------
// .demo-video-play only exists in the markup once a real file lands at
// assets/demos/<agent-slug>.mp4 (see css/style.css) — the "Demo binnenkort"
// poster state has no button to wire up, so this simply finds nothing on
// pages that don't have a real video yet.
document.querySelectorAll(".demo-video-play").forEach((btn) => {
  btn.addEventListener(
    "click",
    () => {
      const slot = btn.closest(".demo-video");
      const src = slot ? slot.dataset.videoSrc : null;
      if (!slot || !src) return;
      slot.innerHTML = "";
      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      slot.appendChild(video);
    },
    { once: true }
  );
});

// Broken-image safety net moved to js/broken-image-guard.js, loaded from
// <head> instead — see that file's header comment for why (a race with
// images already in the initial HTML, since this script runs at the bottom
// of <body>).

// ==========================================================================
// /agentic-ai visual pilot (piloted 2026-08-04 as /ai-automatisering, page
// renamed 2026-08-05; hero rebuilt 2026-08-06) —
// widget behavior. Every selector below is null-guarded, so this is a
// silent no-op on every other page. The hero showcase and the agent-feed
// widget already render a complete, correct-looking end state in plain
// HTML before any of this runs (the showcase's 4 task cards + first result
// pair, the agent-feed's 4 static rows) — this only adds the *motion* on
// top.
// ==========================================================================

// Shared helper: stop/resume a continuous loop while its widget is scrolled
// off-screen, so nothing burns CPU (rAF/setInterval/CSS animation) while
// invisible. Purely a saving on top of already-correct behavior — a widget
// that never gets observed (no IntersectionObserver support) just keeps
// running unconditionally, which is still fine.
function pauseWhenOffscreen(el, onEnter, onLeave) {
  if (!el || !("IntersectionObserver" in window)) return;
  new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) onEnter();
        else onLeave();
      });
    },
    { threshold: 0.1 }
  ).observe(el);
}

// --- Hero showcase: taak -> Mowi -> resultaat ---------------------------------
// One 3-column grid with 4 fixed task/result rows, at every viewport width
// (see css/style.css's own comment on .hero-showcase) — sized down for
// phones via CSS, not swapped for a different component.
const showcaseHub = document.querySelector(".hero-showcase .showcase-hub");

if (showcaseHub && !prefersReducedMotion) {
  pauseWhenOffscreen(
    showcaseHub,
    () => showcaseHub.classList.remove("is-paused"),
    () => showcaseHub.classList.add("is-paused")
  );
}

const showcaseTaskEls = [...document.querySelectorAll(".hero-showcase .showcase-task")];
// .showcase-endpoint, not .showcase-result: on email-triage two of the four
// outcomes are richer card types (.showcase-compose, .showcase-offerte-card)
// that need the exact same is-pending/reveal/connector-line treatment as a
// plain .showcase-result — see that class's own comment in css/style.css.
// Order matches showcaseTaskEls 1:1 (index i's outcome belongs to task i).
const showcaseResultEls = [...document.querySelectorAll(".hero-showcase .showcase-endpoint")];
const showcaseGhost = document.getElementById("showcaseGhost");
const showcaseEl = document.querySelector(".hero-showcase");
const showcaseLinesSvg = document.getElementById("showcaseLines");
const SVG_NS = "http://www.w3.org/2000/svg";

// Types `text` into el at a fixed rate ("watching the agent write", not
// reading along), then calls done(). Shared by the compose card's reply
// line and the offerte card's auto-generated follow-up question.
function typeInto(el, text, done) {
  let charIndex = 0;
  function typeChar() {
    el.textContent = text.slice(0, charIndex);
    if (charIndex < text.length) {
      charIndex += 1;
      setTimeout(typeChar, 14); // fast — "watching the agent write", not reading along
      return;
    }
    done();
  }
  typeChar();
}

// Types cardEl's line letter by letter (compose cards only — every other
// card type has no .showcase-compose-line and just holds for a flat
// ~1200ms), then fades in its one skeleton line and finally the "Concept
// klaar" badge. Calls onDone once it's sat on the finished state for a beat.
function typeComposeCard(cardEl, onDone) {
  const lineEl = cardEl.querySelector(".showcase-compose-line");
  if (!lineEl) {
    setTimeout(onDone, 1200);
    return;
  }
  const skeleton = cardEl.querySelector(".showcase-compose-skeleton");
  const badge = cardEl.querySelector(".showcase-compose-badge");
  // dataset.fullText was stashed by the initial setup above (the line's own
  // textContent was already cleared then, to avoid a flash of the finished
  // sentence before typing starts) — fall back to textContent for safety if
  // this is ever called without that setup having run first.
  const fullText = lineEl.dataset.fullText || lineEl.textContent;
  lineEl.textContent = "";
  if (skeleton) skeleton.classList.add("is-hidden");
  if (badge) badge.classList.add("is-hidden");

  typeInto(lineEl, fullText, () => {
    setTimeout(() => {
      if (skeleton) skeleton.classList.remove("is-hidden");
      setTimeout(() => {
        if (badge) badge.classList.remove("is-hidden");
        setTimeout(onDone, 350); // hold on the finished badge briefly before the cycle moves on
      }, 250);
    }, 150); // brief pause between "typing stops" and "skeleton appears"
  });
}

// Reveals cardEl's field rows one at a time (each a fade+slide-in, not a
// per-character type — quick "fill" actions, not a typing effect, which is
// reserved for prose): two fields the agent found, one it's missing, then
// types out the auto-reply asking for exactly that, then the "Vraag
// automatisch verstuurd" badge. Calls onDone once it's sat on the finished
// state for a beat. Offerteaanvraag's own beat — the biggest time-saver:
// the agent doesn't just file the mail, it notices what's missing and
// chases it down automatically. Deliberately kept to 3 fields/no closing
// line — this card sets the .is-fluid result column's height, see the
// HTML's own comment on .showcase-offerte-card.
function playOfferteBeat(cardEl, onDone) {
  const fields = [...cardEl.querySelectorAll(".showcase-offerte-field")];
  const askEl = cardEl.querySelector(".showcase-offerte-ask");
  const badge = cardEl.querySelector(".showcase-compose-badge");
  const closing = cardEl.querySelector(".showcase-offerte-closing");

  fields.forEach((f) => f.classList.add("is-hidden"));
  if (badge) badge.classList.add("is-hidden");
  if (closing) closing.classList.add("is-hidden");
  // Same dataset.fullText stash-and-clear as the compose card's line — see
  // its own comment above — so the finished sentence never flashes before
  // typing starts.
  let askFullText = "";
  if (askEl) {
    askFullText = askEl.dataset.fullText || askEl.textContent;
    askEl.textContent = "";
  }

  const FIELD_STAGGER = 400;
  fields.forEach((f, idx) => {
    setTimeout(() => f.classList.remove("is-hidden"), 200 + idx * FIELD_STAGGER);
  });

  setTimeout(() => {
    function revealBadgeThenClosing() {
      if (badge) badge.classList.remove("is-hidden");
      setTimeout(() => {
        if (closing) closing.classList.remove("is-hidden");
        setTimeout(onDone, 450); // hold on the finished card, longest of the reveal types — this is the beat that has to land
      }, 300);
    }
    if (!askEl) {
      revealBadgeThenClosing();
      return;
    }
    typeInto(askEl, askFullText, () => {
      setTimeout(revealBadgeThenClosing, 150); // brief pause between "typing stops" and the badge appearing
    });
  }, 200 + fields.length * FIELD_STAGGER);
}

// Every card's actual box, in pixels relative to the showcase container —
// recomputed on demand (never cached) so it's always correct after a
// resize or a font-swap reflow.
function showcaseRectOf(el) {
  const containerRect = showcaseEl.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const left = r.left - containerRect.left;
  const top = r.top - containerRect.top;
  return {
    left,
    right: left + r.width,
    centerX: left + r.width / 2,
    centerY: top + r.height / 2,
  };
}

// Draws one line per task->hub leg plus one per hub->result leg, for every
// page alike — every .showcase-endpoint is a real, stable element from
// first paint (see showcaseResultEls above), so there's always a genuine
// target to point to; nothing free-floating, nothing computed against a
// stale position. All lines meet exactly at the hub's own center — real
// geometry, not approximated, so they always genuinely touch both the card
// and the hub (the hub plate's higher z-index then
// covers the convergence point, so each pair reads as one line passing
// straight through the logo).
function drawShowcaseLines() {
  if (!showcaseEl || !showcaseLinesSvg || !showcaseHub || !showcaseTaskEls.length) return;
  const containerRect = showcaseEl.getBoundingClientRect();
  if (!containerRect.width) return; // not laid out yet

  showcaseLinesSvg.setAttribute("width", containerRect.width);
  showcaseLinesSvg.setAttribute("height", containerRect.height);
  showcaseLinesSvg.innerHTML = "";

  const hub = showcaseRectOf(showcaseHub);

  showcaseTaskEls.forEach((taskEl, i) => {
    const task = showcaseRectOf(taskEl);

    const taskLine = document.createElementNS(SVG_NS, "line");
    taskLine.setAttribute("x1", task.right);
    taskLine.setAttribute("y1", task.centerY);
    taskLine.setAttribute("x2", hub.centerX);
    taskLine.setAttribute("y2", hub.centerY);
    taskLine.dataset.row = String(i);
    showcaseLinesSvg.appendChild(taskLine);

    const resultEl = showcaseResultEls[i];
    if (!resultEl) return;
    const result = showcaseRectOf(resultEl);

    const resultLine = document.createElementNS(SVG_NS, "line");
    resultLine.setAttribute("x1", hub.centerX);
    resultLine.setAttribute("y1", hub.centerY);
    resultLine.setAttribute("x2", result.left);
    resultLine.setAttribute("y2", result.centerY);
    resultLine.setAttribute("pathLength", "1"); // lets the CSS dashoffset transition use simple 0-1 units regardless of actual on-screen length
    resultLine.dataset.row = String(i);
    resultLine.dataset.side = "result";
    if (resultEl.classList.contains("is-pending")) {
      resultLine.classList.add("is-hidden");
    }
    showcaseLinesSvg.appendChild(resultLine);
  });
}

function setShowcaseLineActive(index, active) {
  if (!showcaseLinesSvg) return;
  showcaseLinesSvg.querySelectorAll(`[data-row="${index}"]`).forEach((line) => {
    line.classList.toggle("is-active", active);
  });
}

function setShowcaseResultLineVisible(index, visible) {
  if (!showcaseLinesSvg) return;
  const line = showcaseLinesSvg.querySelector(`[data-row="${index}"][data-side="result"]`);
  if (line) line.classList.toggle("is-hidden", !visible);
}

// Results start hidden (see the "Desktop/tablet" block below) before the
// very first line draw, so is-pending is already correct by the time
// drawShowcaseLines() first reads it — order matters here.
//
// Compose/offerte cards ALSO need their own internal reveal-able parts
// (typed line, fields, skeleton, badge) hidden right now, not just left for
// their beat function to hide 250ms after the card itself appears — a real
// bug caught by continuous polling, not a one-off spot check: without this,
// the card's default (finished) state is briefly visible the instant
// is-pending is removed, THEN the beat clears and replays everything,
// reading as a flash before the "real" reveal starts. Text is stashed to
// dataset.fullText before clearing so typeComposeCard still has the real
// sentence to retype later.
if (showcaseHub && !prefersReducedMotion) {
  showcaseResultEls.forEach((el) => {
    el.classList.add("is-pending");
    if (el.classList.contains("showcase-compose")) {
      const lineEl = el.querySelector(".showcase-compose-line");
      if (lineEl) {
        lineEl.dataset.fullText = lineEl.textContent;
        lineEl.textContent = "";
      }
      el.querySelectorAll(".showcase-compose-skeleton, .showcase-compose-badge").forEach((n) =>
        n.classList.add("is-hidden")
      );
    } else if (el.classList.contains("showcase-offerte-card")) {
      // Ask line follows .showcase-compose-line's own convention (stash +
      // clear text, no is-hidden class — it's driven by its content, not
      // its opacity) rather than the field/badge/closing convention below.
      const askEl = el.querySelector(".showcase-offerte-ask");
      if (askEl) {
        askEl.dataset.fullText = askEl.textContent;
        askEl.textContent = "";
      }
      el
        .querySelectorAll(".showcase-offerte-field, .showcase-compose-badge, .showcase-offerte-closing")
        .forEach((n) => n.classList.add("is-hidden"));
    }
  });
}

if (showcaseEl && showcaseLinesSvg) {
  drawShowcaseLines();
  window.addEventListener("resize", drawShowcaseLines);
  // Plus Jakarta Sans loads async — a late font swap can shift card widths
  // slightly after the lines were first drawn against fallback-font metrics.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(drawShowcaseLines);
  }
}

// --- Desktop/tablet: the traveling card ---------------------------------------
if (
  showcaseHub &&
  showcaseGhost &&
  showcaseTaskEls.length &&
  showcaseResultEls.length &&
  !prefersReducedMotion
) {
  const positionGhostOn = (el) => {
    const containerRect = showcaseEl.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    showcaseGhost.style.left = `${r.left - containerRect.left}px`;
    showcaseGhost.style.top = `${r.top - containerRect.top}px`;
    showcaseGhost.style.width = `${r.width}px`;
    showcaseGhost.style.height = `${r.height}px`;
  };

  let desktopIndex = 0;
  let desktopVisible = true;
  let desktopRunning = false;

  function runDesktopStep() {
    const i = desktopIndex;
    const taskEl = showcaseTaskEls[i];
    const resultEl = showcaseResultEls[i];

    taskEl.classList.add("is-active");
    setShowcaseLineActive(i, true);

    // Parked exactly on the task card, no transition — this is the
    // starting point every distance below is measured relative to.
    showcaseGhost.className = "showcase-ghost showcase-task";
    showcaseGhost.innerHTML = taskEl.innerHTML;
    showcaseGhost.style.transition = "none";
    positionGhostOn(taskEl);
    showcaseGhost.style.transform = "translate(0, 0) scale(1)";
    showcaseGhost.style.opacity = "1";
    void showcaseGhost.offsetWidth; // force reflow so the next transition actually animates

    const task = showcaseRectOf(taskEl);
    const hub = showcaseRectOf(showcaseHub);
    const result = showcaseRectOf(resultEl);
    // Same convergence point the static lines use (drawShowcaseLines above)
    // — the ghost flies the exact same path its own row's lines trace.
    const toHub = { x: hub.centerX - task.centerX, y: hub.centerY - task.centerY };
    const toResult = { x: result.centerX - task.centerX, y: result.centerY - task.centerY };

    requestAnimationFrame(() => {
      showcaseGhost.style.transition = "transform 0.8s var(--ease-out), opacity 0.5s ease";
      showcaseGhost.style.transform = `translate(${toHub.x}px, ${toHub.y}px) scale(0.2)`;
      showcaseGhost.style.opacity = "0";
    });

    setTimeout(() => {
      // Absorbed into the hub — a short processing pulse.
      showcaseHub.classList.add("is-processing");
      setTimeout(() => showcaseHub.classList.remove("is-processing"), 600);

      // Swap content to the result while parked at the hub (identical
      // transform to where phase 1 ended, so nothing visibly jumps). The
      // offerte card is deliberately rich/wide (four field rows) — cloning
      // its full innerHTML into the ghost read as a long line of text
      // stretching almost out of the viewport while still mid-flight, a
      // real visual bug caught live, not in the automated sweeps (nothing
      // in those checks the GHOST's own content, only the real cards'
      // final positions). A plain icon+label placeholder flies compactly
      // instead, matching every other row's ghost — the rich card itself
      // only ever appears once actually landed, where playOfferteBeat
      // reveals it properly.
      showcaseGhost.className = "showcase-ghost showcase-result";
      showcaseGhost.innerHTML = resultEl.classList.contains("showcase-offerte-card")
        ? '<span class="showcase-check"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7" /></svg></span><span>Vraag verstuurd</span>'
        : resultEl.innerHTML;
      showcaseGhost.style.transition = "none";
      showcaseGhost.style.transform = `translate(${toHub.x}px, ${toHub.y}px) scale(0.2)`;
      showcaseGhost.style.opacity = "0";
      void showcaseGhost.offsetWidth;

      setTimeout(() => {
        showcaseGhost.style.transition = "transform 0.8s var(--ease-bounce), opacity 0.3s ease";
        showcaseGhost.style.transform = `translate(${toResult.x}px, ${toResult.y}px) scale(1)`;
        showcaseGhost.style.opacity = "1";

        setTimeout(() => {
          // Arrived — hand off to the real, already-positioned result card.
          // The hub->result line appears at this exact moment too, never
          // before the card it connects to actually exists on screen.
          taskEl.classList.remove("is-active");
          setShowcaseLineActive(i, false);
          resultEl.classList.remove("is-pending");
          setShowcaseResultLineVisible(i, true);
          showcaseGhost.style.opacity = "0";

          function finishRowAndAdvance() {
            desktopIndex += 1;
            if (desktopIndex >= showcaseTaskEls.length) {
              desktopIndex = 0;
              showcaseResultEls.forEach((el, idx) => {
                el.classList.add("is-pending");
                setShowcaseResultLineVisible(idx, false);
              });
              setTimeout(advanceDesktop, 500);
            } else {
              advanceDesktop();
            }
          }

          // Which beat plays (if any) depends on the result card's own
          // type — same convention as every other reveal on the site, just
          // now with three possible card types instead of one:
          //   .showcase-compose      -> typeComposeCard (~1.6s)
          //   .showcase-offerte-card -> playOfferteBeat (~2.5-3s)
          //   plain .showcase-result -> flat 1200ms hold, unchanged
          if (resultEl.classList.contains("showcase-compose")) {
            setTimeout(() => typeComposeCard(resultEl, () => setTimeout(finishRowAndAdvance, 400)), 250);
          } else if (resultEl.classList.contains("showcase-offerte-card")) {
            setTimeout(() => playOfferteBeat(resultEl, () => setTimeout(finishRowAndAdvance, 400)), 250);
          } else {
            setTimeout(finishRowAndAdvance, 1200);
          }
        }, 800); // matches the fly-to-result transition duration
      }, 550); // brief pause "inside" the hub before flying back out
    }, 800); // matches the fly-to-hub transition duration
  }

  function advanceDesktop() {
    if (!desktopVisible) {
      desktopRunning = false;
      return;
    }
    runDesktopStep();
  }

  function startDesktop() {
    desktopVisible = true;
    if (!desktopRunning) {
      desktopRunning = true;
      runDesktopStep();
    }
  }

  function stopDesktop() {
    desktopVisible = false;
  }

  pauseWhenOffscreen(showcaseEl, startDesktop, stopDesktop);

  window.addEventListener("resize", () => {
    // A resize can happen mid-flight — snap the ghost to wherever it
    // should be for its CURRENT phase rather than leave it misaligned;
    // the next step recomputes fresh coordinates regardless.
    if (showcaseGhost.style.opacity === "0") return;
    positionGhostOn(showcaseTaskEls[desktopIndex]);
  });
}

// "Mowi koppelt met" is a static row of pill labels (see css/style.css's
// .koppelt-widget) — no JS needed, so there's nothing to wire up here.

// --- Live agent-feed widget ---------------------------------------------------
// The 4 rows already in the HTML are a real, correct end state (also the
// reduced-motion fallback, since this block simply never runs then). When
// motion is allowed, it keeps cycling through the same short script,
// prepending one new row at a time and dropping the oldest.
const agentFeedCard = document.querySelector(".agent-feed-card");
const agentFeedList = document.getElementById("agentFeedList");

if (agentFeedCard && agentFeedList && !prefersReducedMotion) {
  const SCRIPT = [
    { text: "E-mail agent — 14 mails gesorteerd", status: "done" },
    { text: "Invoice processing — 6 facturen verwerkt", status: "done" },
    {
      text: "Needs attention — koppeling verlopen",
      status: "warning",
      resolvesTo: "Needs attention — opgelost",
    },
    { text: "Report generator — rapport verzonden", status: "done" },
    { text: "CRM sync — 9 leads bijgewerkt", status: "done" },
  ];
  const MAX_ROWS = 4;
  let scriptIndex = 0;
  let feedTimer = null;

  function addFeedRow(entry) {
    const li = document.createElement("li");
    li.className = `agent-feed-row agent-feed-row-enter is-${entry.status}`;

    const dot = document.createElement("span");
    dot.className = "agent-feed-dot";
    dot.setAttribute("aria-hidden", "true");

    const text = document.createElement("span");
    text.className = "agent-feed-text";
    text.textContent = entry.text;

    li.append(dot, text);
    agentFeedList.prepend(li);
    // Two-step class removal (armed on append, cleared next frame) so the
    // browser actually renders the "entering" state first — dropping both
    // in the same frame would collapse straight to the resting state with
    // no visible transition.
    requestAnimationFrame(() => li.classList.remove("agent-feed-row-enter"));

    while (agentFeedList.children.length > MAX_ROWS) {
      agentFeedList.lastElementChild.remove();
    }
    return li;
  }

  function playFeedStep() {
    const entry = SCRIPT[scriptIndex % SCRIPT.length];
    scriptIndex += 1;
    const row = addFeedRow(entry);

    if (entry.resolvesTo) {
      setTimeout(() => {
        row.classList.remove("is-warning");
        row.classList.add("is-done");
        row.querySelector(".agent-feed-text").textContent = entry.resolvesTo;
      }, 2200);
    }
  }

  function startFeed() {
    if (feedTimer) return;
    feedTimer = setInterval(playFeedStep, 2800);
  }

  function stopFeed() {
    clearInterval(feedTimer);
    feedTimer = null;
  }

  pauseWhenOffscreen(agentFeedCard, startFeed, stopFeed);
}

// --- Homepage hero: configurator conversation demo (Stage 3) -----------------
// .configurator-demo is the hero's centerpiece proof device: a fixed, honest
// script (see index.html's own comment for exactly which real capability it
// illustrates — a Manifest Standard v1 operation, verified against
// config/capabilities.php before this copy was written) staged as
// user message -> Mowi's playback -> dry-run result -> confirm -> live.
// The full, finished conversation is real Dutch copy in plain HTML from
// first paint (reveal-safety invariant, same as [data-reveal]/.reveal-armed
// above — see css/style.css's .configurator-demo comment for the exact
// default state) — this only ever restages that SAME text as a
// typed/staggered reveal, reusing typeInto() and pauseWhenOffscreen() from
// the hero showcase above rather than duplicating that logic. Never runs
// under prefers-reduced-motion, matching every other looping widget on this
// page (the agent-feed widget, the hero showcase).
const configuratorDemo = document.querySelector(".configurator-demo");

if (configuratorDemo && !prefersReducedMotion) {
  const userP = configuratorDemo.querySelector(".configurator-bubble-user p");
  const mowiP = configuratorDemo.querySelector(".configurator-bubble-mowi p");
  const dryrun = configuratorDemo.querySelector(".configurator-dryrun");
  const confirmBtn = configuratorDemo.querySelector(".configurator-confirm-btn");
  const liveBadge = configuratorDemo.querySelector(".configurator-live-badge");

  if (userP && mowiP && dryrun && confirmBtn && liveBadge) {
    // Stashed once, from the real HTML — never hardcoded here, so the
    // script this plays is always exactly what's actually written on the
    // page (edit the HTML, the demo replays the new copy automatically).
    const userText = userP.textContent;
    const mowiText = mowiP.textContent;
    let configuratorVisible = false;
    let configuratorRunning = false;

    function playConfiguratorDemoOnce(onDone) {
      userP.textContent = "";
      mowiP.textContent = "";
      dryrun.classList.add("is-pending");
      liveBadge.classList.add("is-pending");
      confirmBtn.classList.remove("is-confirmed");

      typeInto(userP, userText, () => {
        setTimeout(() => {
          // Brief pause between "the client finished typing" and "Mowi
          // starts replying" — reads as a real beat, not an instant echo.
          typeInto(mowiP, mowiText, () => {
            setTimeout(() => {
              dryrun.classList.remove("is-pending");
              setTimeout(() => {
                confirmBtn.classList.add("is-confirmed");
                setTimeout(() => {
                  liveBadge.classList.remove("is-pending");
                  setTimeout(onDone, 3800); // hold on the finished state before replaying
                }, 350);
              }, 700);
            }, 350);
          });
        }, 500);
      });
    }

    function loopConfiguratorDemo() {
      if (!configuratorVisible) {
        configuratorRunning = false;
        return;
      }
      configuratorRunning = true;
      playConfiguratorDemoOnce(loopConfiguratorDemo);
    }

    pauseWhenOffscreen(
      configuratorDemo,
      () => {
        configuratorVisible = true;
        if (!configuratorRunning) loopConfiguratorDemo();
      },
      () => {
        configuratorVisible = false;
      }
    );
  }
}

// --- Pricing calculator (/pricing "Custom" card) ---------------------------
// Reads prices from each checkbox's data-price rather than a lookup table here,
// so the number JS sums and the number printed beside the label can never drift
// apart — a price change is a single HTML edit. Guarded by the container query,
// so every other page loading main.js does nothing.
document.querySelectorAll("[data-pricing-calculator]").forEach((widget) => {
  const boxes = Array.from(widget.querySelectorAll('input[type="checkbox"]'));
  const totalOut = widget.querySelector("[data-total-out]");
  const emptyNote = widget.querySelector("[data-empty-note]");
  const soonNote = widget.querySelector("[data-soon-note]");

  if (!boxes.length || !totalOut) return;

  function updateTotal() {
    const checked = boxes.filter((box) => box.checked);
    const total = checked.reduce((sum, box) => sum + Number(box.dataset.price || 0), 0);

    totalOut.textContent = String(total);
    // Both notes are advisory, not errors — the CTA stays usable either way,
    // since signup can still start with nothing pre-selected.
    if (emptyNote) emptyNote.hidden = checked.length > 0;
    if (soonNote) soonNote.hidden = !checked.some((box) => "soon" in box.dataset);
  }

  boxes.forEach((box) => box.addEventListener("change", updateTotal));
  // Run once on load so a browser that restored previous checkbox state on a
  // back/forward navigation doesn't leave a total contradicting the boxes.
  updateTotal();
});
