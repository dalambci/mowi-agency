/* Demo sections on /support-agent (2026-09-16): "Hoor hem aan het werk"
   (sample-call player) and "Probeer het zelf" (a live, capped call/chat
   with Mowi's own demo receptionist). Page-scoped, loaded after js/main.js
   — main.js's initPillTabs already wires every [data-pill-tabs] container
   on the page (both the sample-call tab row and the Bellen/Chatten
   toggle here use that exact same contract, unmodified); this file only
   adds what initPillTabs doesn't know about: audio playback, the call/
   chat state machine, and the network calls.

   Modern JS (async/await, fetch, dynamic behaviour), not the sitewide
   main.js's ES5 house style — this file needs the async control flow a
   live call genuinely has, and it is never parsed by anything older than
   what @elevenlabs/client itself already requires.

   Dutch error copy mirrors the dashboard's own resources/js/
   voice-browser-test.js (same product, same wording a client already
   sees testing their own agent) — kept in sync deliberately, not by
   accident. */
(function () {
  "use strict";

  function withV(url) {
    var v = document.body.getAttribute("data-demo-version") || "1";
    return url + (url.indexOf("?") === -1 ? "?" : "&") + "v=" + v;
  }


  /* ---------------------------------------------------------------------
     Disc level — the one piece of motion on the page.

     Writes --demo-level (0..1) onto a .demo-disc; css/demo.css turns that
     into a small scale and a breathing ring. The level always comes from
     REAL audio: an AnalyserNode over the sample player, and the SDK's own
     getOutputVolume/getInputVolume during a live call. Nothing here runs on
     a timer pretending to be speech.

     prefers-reduced-motion is checked here rather than left to CSS: these
     are inline style writes, and the sitewide reduced-motion rule only
     disables CSS animations and transitions, so it would not catch them.
     --------------------------------------------------------------------- */
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function discLevel(disc) {
    var raf = null;
    var smoothed = 0;
    var ctx = null;
    var analyser = null;
    var buffer = null;

    function write(v) {
      if (disc) disc.style.setProperty("--demo-level", v.toFixed(3));
    }

    function loop(read) {
      raf = window.requestAnimationFrame(function step() {
        var raw = 0;
        try { raw = read() || 0; } catch (e) { raw = 0; }
        // Speech sits low and spiky; rise fast so a syllable registers, fall
        // slower so the disc settles instead of flickering between words.
        var target = Math.max(0, Math.min(1, raw));
        smoothed = target > smoothed ? smoothed + (target - smoothed) * 0.5 : smoothed + (target - smoothed) * 0.12;
        write(smoothed);
        raf = window.requestAnimationFrame(step);
      });
    }

    return {
      /* The <audio> element is routed through an AnalyserNode. Connecting
         straight on to the destination in the same breath is not optional:
         once createMediaElementSource() captures an element, anything that
         is not reconnected plays silently. Wrapped so that a browser which
         refuses Web Audio loses the motion, never the sound. */
      fromAudio: function (audioEl) {
        if (reduceMotion || !audioEl || analyser) return;
        try {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return;
          ctx = new AC();
          var source = ctx.createMediaElementSource(audioEl);
          analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);
          analyser.connect(ctx.destination);
          buffer = new Uint8Array(analyser.fftSize);
        } catch (e) {
          analyser = null;
          return;
        }
      },
      startAudio: function () {
        if (reduceMotion || !analyser || raf) return;
        if (ctx && ctx.state === "suspended") ctx.resume().catch(function () {});
        loop(function () {
          analyser.getByteTimeDomainData(buffer);
          var sum = 0;
          for (var i = 0; i < buffer.length; i++) {
            var d = (buffer[i] - 128) / 128;
            sum += d * d;
          }
          // RMS for ordinary speech lands around 0.05-0.2. Gain of 3 puts
          // normal delivery around 0.4-0.6 and leaves headroom for emphasis:
          // measured at 4.5 first, which pinned it near 1.0 through most of a
          // sentence, so the disc sat at full size instead of breathing.
          return Math.sqrt(sum / buffer.length) * 3;
        });
      },
      /* A live call: the SDK exposes both sides synchronously. The agent's
         own output drives the disc while it speaks; the visitor's mic drives
         it, more gently, while it listens — so the disc shows who has the
         floor rather than just "something is happening". */
      startConversation: function (getConversation, getMode) {
        if (reduceMotion || raf) return;
        loop(function () {
          var c = getConversation();
          if (!c) return 0;
          var speaking = getMode() === "speaking";
          if (speaking && typeof c.getOutputVolume === "function") return c.getOutputVolume() * 1.6;
          if (!speaking && typeof c.getInputVolume === "function") return c.getInputVolume() * 1.1;
          return 0;
        });
      },
      stop: function () {
        if (raf) { window.cancelAnimationFrame(raf); raf = null; }
        smoothed = 0;
        write(0);
      },
    };
  }

  // ---------------------------------------------------------------------
  // Section A — sample-call player
  // ---------------------------------------------------------------------
  function initListen(root) {
    var audio = root.querySelector("[data-demo-audio]");
    var playBtn = root.querySelector("[data-demo-play]");
    var transcript = root.querySelector("[data-demo-transcript]");
    var titleEl = root.querySelector("[data-demo-listen-title]");
    var subEl = root.querySelector("[data-demo-listen-sub]");
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[data-demo-call]"));
    if (!audio || !playBtn || !tabs.length) return;

    var manifestCache = {};
    var current = { slug: null, lines: [], next: 0 };
    var level = discLevel(root.querySelector(".demo-disc"));

    function clearTranscript() {
      transcript.innerHTML = "";
      current.lines = [];
      current.next = 0;
    }

    function setPlaying(isPlaying) {
      playBtn.setAttribute("aria-pressed", isPlaying ? "true" : "false");
      playBtn.setAttribute("aria-label", isPlaying ? "Pauzeren" : "Afspelen");
    }

    function addBubble(line) {
      var el = document.createElement("p");
      el.className = "demo-bubble " + (line.role === "caller" ? "demo-bubble-caller" : "demo-bubble-agent");
      el.textContent = line.text;
      transcript.appendChild(el);
      // Cap the DOM list — the CSS only ever shows the last few anyway
      // (flex-end + overflow:hidden), this just keeps a long replay light.
      while (transcript.children.length > 8) transcript.removeChild(transcript.firstChild);
    }

    function loadManifest(slug) {
      if (manifestCache[slug]) return Promise.resolve(manifestCache[slug]);
      return fetch(withV("/content/demo-calls/" + slug + ".json"))
        .then(function (r) { if (!r.ok) throw new Error("manifest " + r.status); return r.json(); })
        .then(function (data) { manifestCache[slug] = data; return data; });
    }

    function select(tab) {
      var slug = tab.getAttribute("data-demo-call");
      if (!slug || slug === current.slug) return;
      audio.pause();
      setPlaying(false);
      level.stop();
      clearTranscript();
      current.slug = slug;
      if (titleEl) titleEl.textContent = tab.getAttribute("data-title") || "";
      if (subEl) subEl.textContent = tab.getAttribute("data-sub") || "";

      loadManifest(slug).then(function (manifest) {
        if (current.slug !== slug) return; // a later tab click won the race
        current.lines = manifest.lines || [];
        audio.src = withV("/assets/demo-calls/" + (manifest.audio || slug + ".mp3"));
      }).catch(function () {
        if (current.slug === slug) current.lines = [];
      });
    }

    // initPillTabs (main.js) owns aria-selected/panel visibility for clicks
    // AND arrow-key/Home/End navigation alike; watching the attribute
    // itself (rather than adding a second click listener) is what catches
    // both input methods without duplicating that logic.
    var tablist = root.querySelector('[role="tablist"]');
    if (tablist && window.MutationObserver) {
      new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
          if (m.attributeName === "aria-selected" && m.target.getAttribute("aria-selected") === "true") {
            select(m.target);
          }
        });
      }).observe(tablist, { attributes: true, attributeFilter: ["aria-selected"], subtree: true });
    }

    var initialTab = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
    select(initialTab);

    playBtn.addEventListener("click", function () {
      if (!audio.src) return;
      if (!audio.paused) {
        audio.pause();
        return;
      }
      if (audio.ended || audio.currentTime >= (audio.duration || Infinity) - 0.05) {
        audio.currentTime = 0;
        clearTranscript();
      }
      // Built on the click, because an AudioContext created without a user
      // gesture starts suspended in every current browser.
      level.fromAudio(audio);
      audio.play().catch(function () { setPlaying(false); });
    });

    audio.addEventListener("play", function () { setPlaying(true); level.startAudio(); });
    audio.addEventListener("pause", function () { setPlaying(false); level.stop(); });
    audio.addEventListener("ended", function () { setPlaying(false); level.stop(); });
    audio.addEventListener("timeupdate", function () {
      while (current.next < current.lines.length && current.lines[current.next].start <= audio.currentTime) {
        addBubble(current.lines[current.next]);
        current.next++;
      }
    });
  }

  // ---------------------------------------------------------------------
  // Section B — live try-it card
  // ---------------------------------------------------------------------
  function initTry(root) {
    var body = root.querySelector("[data-demo-body]");
    var consent = root.querySelector("[data-demo-consent]");
    var live = root.querySelector("[data-demo-live]");
    var ended = root.querySelector("[data-demo-ended]");
    var errorEl = root.querySelector("[data-demo-error]");
    var fallbackEl = root.querySelector("[data-demo-fallback]");
    var startBtn = root.querySelector("[data-demo-start]");
    var agreeBtn = root.querySelector("[data-demo-agree]");
    var cancelBtn = root.querySelector("[data-demo-cancel]");
    var hangupBtn = root.querySelector("[data-demo-hangup]");
    var againBtn = root.querySelector("[data-demo-again]");
    var statusEl = root.querySelector("[data-demo-status]");
    var timerEl = root.querySelector("[data-demo-timer]");
    var liveLog = root.querySelector("[data-demo-live-log]");
    var chatForm = root.querySelector("[data-demo-chat-form]");
    var chatInput = root.querySelector("[data-demo-chat-input]") || (chatForm && chatForm.querySelector("input"));
    var chatLog = root.querySelector("[data-demo-chat-log]");
    var endpoint = root.getAttribute("data-endpoint");
    if (!endpoint) return;

    var conversation = null;
    var countdownId = null;
    var chatMessageCount = 0;
    var chatMaxMessages = 20;
    var sdkPromise = null;
    var agentMode = "listening";
    var liveLevel = discLevel(live && live.querySelector(".demo-disc"));

    function loadSdk() {
      if (window.ElevenLabsClient) return Promise.resolve(window.ElevenLabsClient);
      if (sdkPromise) return sdkPromise;
      sdkPromise = new Promise(function (resolve, reject) {
        var s = document.createElement("script");
        s.src = withV("/js/vendor/elevenlabs-client.js");
        s.onload = function () { resolve(window.ElevenLabsClient); };
        s.onerror = function () { sdkPromise = null; reject(new Error("sdk-load-failed")); };
        document.head.appendChild(s);
      });
      return sdkPromise;
    }

    function show(el) { if (el) el.hidden = false; }
    function hide(el) { if (el) el.hidden = true; }

    function setState(state) {
      root.setAttribute("data-state", state);

      // The type tabs pick which company's agent you reach, so switching one
      // mid-session would leave the visitor talking to one agent while the
      // card names another. initTypeTabs() refuses on the same condition;
      // this is only what makes that refusal visible.
      var typeTabs = document.querySelector("[data-demo-types]");
      if (typeTabs) {
        var locked = state !== "idle";
        typeTabs.setAttribute("aria-disabled", String(locked));
        typeTabs.querySelectorAll("[role=tab]").forEach(function (t) {
          t.setAttribute("aria-disabled", String(locked));
        });
      }

      hide(body); hide(consent); hide(live); hide(ended);
      if (state === "idle") { show(body); }
      else if (state === "consent") { show(consent); if (consent) consent.focus(); }
      else if (state === "connecting" || state === "live") { show(live); }
      else if (state === "ended") { show(ended); if (ended) ended.focus(); }
    }

    // `offerFallback` is for the two states the visitor cannot fix by trying
    // again: the demo is full for today, or it is switched off. Those used to
    // dead-end in a grey sentence naming mowi.agency/demo as unclickable text,
    // which wasted the most interested visitor on the page. They now get the
    // real next step as a button. Errors the visitor CAN fix (microphone
    // refused, no connection) deliberately do not show it — there the right
    // action is to try again, and a competing call-to-action would pull them
    // away from a demo that still works.
    function showError(message, offerFallback) {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.hidden = false;
      if (fallbackEl) fallbackEl.hidden = !offerFallback;
    }
    function clearError() {
      if (errorEl) { errorEl.hidden = true; errorEl.textContent = ""; }
      if (fallbackEl) fallbackEl.hidden = true;
    }

    function mint(mode) {
      var body = "mode=" + encodeURIComponent(mode) + "&type=" + encodeURIComponent(currentType());
      var device = deviceId();
      if (device) body += "&device_id=" + encodeURIComponent(device);

      return fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: body,
      }).then(function (r) {
        return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok) {
            var err = new Error(data.message || "mint-failed");
            err.status = r.status;
            err.userMessage = data.message;
            throw err;
          }
          return data;
        });
      });
    }

    function bubble(container, role, text) {
      if (!container) return;
      var el = document.createElement("p");
      el.className = "demo-bubble " + (role === "caller" || role === "user" ? "demo-bubble-caller" : "demo-bubble-agent");
      el.textContent = text;
      container.appendChild(el);
      container.scrollTop = container.scrollHeight;
    }

    // ---- Voice ----
    function startCountdown(seconds) {
      var remaining = seconds;
      function tick() {
        var m = Math.floor(remaining / 60);
        var s = remaining % 60;
        if (timerEl) timerEl.textContent = m + ":" + (s < 10 ? "0" : "") + s;
        if (remaining <= 0) { stopCountdown(); hangUp(); return; }
        remaining--;
      }
      tick();
      countdownId = window.setInterval(tick, 1000);
    }
    function stopCountdown() {
      if (countdownId) { window.clearInterval(countdownId); countdownId = null; }
    }

    function hangUp() {
      stopCountdown();
      liveLevel.stop();
      agentMode = "listening";
      var c = conversation;
      conversation = null;
      Promise.resolve(c && c.endSession()).catch(function () {}).then(function () {
        setState("ended");
      });
    }

    function startVoiceCall() {
      clearError();
      setState("connecting");
      if (statusEl) statusEl.textContent = "Microfoon vragen…";
      if (liveLog) liveLog.innerHTML = "";

      navigator.mediaDevices.getUserMedia({ audio: true }).then(function () {
        if (statusEl) statusEl.textContent = "Verbinden…";
        return mint("voice");
      }).then(function (data) {
        return loadSdk().then(function (sdk) {
          return sdk.Conversation.startSession({
            signedUrl: data.signed_url,
            connectionType: "websocket",
            onConnect: function () {
              if (statusEl) statusEl.textContent = "De agent luistert. Zeg iets.";
              startCountdown(data.max_seconds || 120);
              // The disc follows whoever has the floor from here on.
              liveLevel.startConversation(function () { return conversation; }, function () { return agentMode; });
            },
            onDisconnect: function () { hangUp(); },
            onModeChange: function (m) {
              agentMode = (m && m.mode) || "listening";
              if (statusEl) statusEl.textContent = agentMode === "speaking" ? "De agent spreekt" : "De agent luistert. Zeg iets.";
            },
            onMessage: function (msg) {
              if (!msg || !msg.message) return;
              if (msg.source === "user" || msg.role === "user") return; // we never render our own side from the socket
              bubble(liveLog, "agent", msg.message);
            },
            onError: function () {
              showLiveError("Er ging iets mis in het gesprek.");
            },
          }).then(function (c) { conversation = c; });
        });
      }).catch(function (err) {
        stopCountdown();
        liveLevel.stop();
        if (err && err.name === "NotAllowedError") {
          setState("idle");
          showError("Geef de browser toegang tot uw microfoon en probeer het opnieuw.");
        } else if (err && err.name === "NotFoundError") {
          setState("idle");
          showError("Er is geen microfoon gevonden.");
        } else if (err && err.status === 503) {
          setState("idle");
          showError(err.userMessage || "De live demo is op dit moment niet beschikbaar.", true);
        } else if (err && err.status === 429) {
          setState("idle");
          showError(err.userMessage || "De demo is voor vandaag vol.", true);
        } else if (err && err.userMessage) {
          setState("idle");
          showError(err.userMessage);
        } else {
          setState("idle");
          showError("Geen verbinding. Controleer uw internet en probeer het opnieuw.");
        }
      });
    }

    function showLiveError(text) {
      if (statusEl) statusEl.textContent = text;
    }

    // ---- Chat ----
    var chatFirstAgentMessageSeen = false;

    function sendChatMessage(text) {
      bubble(chatLog, "user", text);
      chatMessageCount++;

      var afterSend = function () {
        if (chatMessageCount >= chatMaxMessages) endChat();
      };

      if (conversation) {
        conversation.sendUserMessage(text);
        afterSend();
        return;
      }

      if (chatInput) chatInput.disabled = true;
      loadSdk(); // fire the load in parallel with the mint below
      mint("chat").then(function (data) {
        chatMaxMessages = data.max_messages || chatMaxMessages;
        return loadSdk().then(function (sdk) {
          return sdk.Conversation.startSession({
            signedUrl: data.signed_url,
            connectionType: "websocket",
            overrides: { conversation: { textOnly: true } },
            onMessage: function (msg) {
              if (!msg || !msg.message) return;
              if (msg.source === "user" || msg.role === "user") return;
              if (!chatFirstAgentMessageSeen) { chatFirstAgentMessageSeen = true; return; } // already shown as the static greeting
              bubble(chatLog, "agent", msg.message);
            },
            onError: function () { bubble(chatLog, "agent", "Er ging iets mis. Probeer het nog eens."); },
            onDisconnect: function () { endChat(); },
          });
        });
      }).then(function (c) {
        conversation = c;
        if (chatInput) chatInput.disabled = false;
        conversation.sendUserMessage(text);
        afterSend();
      }).catch(function (err) {
        if (chatInput) chatInput.disabled = false;
        bubble(chatLog, "agent", (err && err.userMessage) || "De verbinding lukte niet. Probeer het zo nog eens.");
        // Same reasoning as showError()'s offerFallback: full or switched off
        // is not something the visitor can retry their way out of, so give
        // them the real next step instead of a dead end.
        var st = err && err.status;
        if (fallbackEl && (st === 429 || st === 503)) fallbackEl.hidden = false;
      });
    }

    function endChat() {
      var c = conversation;
      conversation = null;
      chatMessageCount = 0;
      chatFirstAgentMessageSeen = false;
      if (chatInput) chatInput.disabled = false;
      Promise.resolve(c && c.endSession()).catch(function () {});
      bubble(chatLog, "agent", "Dat was de demo-chat. Wilt u meer zien? Plan een demo op mowi.agency/demo.");
    }

    // ---- Wiring ----
    if (startBtn) startBtn.addEventListener("click", function () {
      clearError();
      loadSdk().catch(function () {}); // warm the SDK before the consent tap (iOS audio-unlock timing)
      setState("consent");
    });
    if (cancelBtn) cancelBtn.addEventListener("click", function () { setState("idle"); });
    if (agreeBtn) agreeBtn.addEventListener("click", startVoiceCall);
    if (hangupBtn) hangupBtn.addEventListener("click", hangUp);
    if (againBtn) againBtn.addEventListener("click", function () { setState("idle"); });

    if (consent) consent.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setState("idle");
    });

    if (chatForm && chatInput) {
      chatForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var text = chatInput.value.trim();
        if (!text) return;
        chatInput.value = "";
        sendChatMessage(text);
      });
    }

    window.addEventListener("pagehide", function () {
      if (conversation) { try { conversation.endSession(); } catch (e) {} }
    });

    setState("idle");
  }

  /**
   * A stable, random id for this browser, used only so the dashboard can cap
   * a returning visitor over a longer window than one day (the daily caps
   * reset at midnight, so on their own they allow unlimited free calls spread
   * over time).
   *
   * It identifies a browser, never a person: no name, no address, nothing
   * derived from the visitor. The server stores only a salted hash of it.
   *
   * Every access is wrapped because localStorage throws outright in some
   * privacy modes. A browser that cannot store it simply sends none, and the
   * server falls back to its IP-side caps — a missing id must never block a
   * genuine visitor.
   */
  function deviceId() {
    var KEY = "mowiDemoDevice";
    try {
      var existing = window.localStorage.getItem(KEY);
      if (existing) return existing;
      var fresh = (window.crypto && window.crypto.randomUUID)
        ? window.crypto.randomUUID()
        : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
      window.localStorage.setItem(KEY, fresh);
      return fresh;
    } catch (e) {
      return null;
    }
  }

  function currentType() {
    var selected = document.querySelector("[data-demo-types] [role=tab][aria-selected=true]");
    return (selected && selected.getAttribute("data-demo-type")) || "bestelstatus";
  }

  /**
   * The type tabs above both cards. Deliberately NOT js/main.js's initPillTabs:
   * that component claims every [role=tab] inside its container, and these
   * tabs sit above the whole section — it would swallow the card's own
   * Bellen/Chatten toggle. It also only toggles panels, while these tabs have
   * to retitle the left card and change which agent the next call reaches.
   */
  function initTypeTabs(root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll("[role=tab]"));
    if (!tabs.length) return;

    var title = document.querySelector("[data-demo-title]");
    var sub = document.querySelector("[data-demo-sub]");
    var scenario = document.querySelector("[data-demo-scenario]");
    var tryCard = document.querySelector("[data-demo-try]");

    function activate(tab, focus) {
      // Switching company mid-call would leave the visitor talking to one
      // agent while the card claims another, so the tabs are inert until the
      // session ends. setState() in initTry() flips this class.
      if (tryCard && tryCard.getAttribute("data-state") !== "idle") return;

      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });

      document.querySelectorAll(".demo-flow-panel").forEach(function (panel) {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
      });

      var company = tab.getAttribute("data-company");
      // Just the company. The line under it already says "digitale
      // receptionist", and the long names ("Vlothuis Installatietechniek")
      // wrapped the title to a second line on a phone, which moved everything
      // below it whenever you switched tab.
      if (title && company) title.textContent = company;
      if (sub) sub.textContent = tab.getAttribute("data-sub") || "";
      // The line under the workflow card's title, kept in that card's HEAD
      // rather than inside the panel so both cards' heads have the same shape
      // and their text starts on the same line.
      if (scenario) scenario.textContent = tab.getAttribute("data-scenario") || "";

      if (focus) tab.focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener("click", function () { activate(tab, false); });
      tab.addEventListener("keydown", function (event) {
        var keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
        if (keys.indexOf(event.key) === -1) return;
        event.preventDefault();
        var next = i;
        if (event.key === "ArrowRight") next = (i + 1) % tabs.length;
        if (event.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        activate(tabs[next], true);
      });
    });

    // Make the card agree with whichever tab is marked selected in the HTML,
    // rather than trusting two places to have been written consistently.
    var initial = tabs.filter(function (t) { return t.getAttribute("aria-selected") === "true"; })[0] || tabs[0];
    activate(initial, false);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var listen = document.querySelector("[data-demo-listen]");
    if (listen) initListen(listen);
    var tryCard = document.querySelector("[data-demo-try]");
    if (tryCard) initTry(tryCard);
    var types = document.querySelector("[data-demo-types]");
    if (types) initTypeTabs(types);
  });
})();
