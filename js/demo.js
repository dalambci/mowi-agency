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
      audio.play().catch(function () { setPlaying(false); });
    });

    audio.addEventListener("play", function () { setPlaying(true); });
    audio.addEventListener("pause", function () { setPlaying(false); });
    audio.addEventListener("ended", function () { setPlaying(false); });
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
      hide(body); hide(consent); hide(live); hide(ended);
      if (state === "idle") { show(body); }
      else if (state === "consent") { show(consent); if (consent) consent.focus(); }
      else if (state === "connecting" || state === "live") { show(live); }
      else if (state === "ended") { show(ended); if (ended) ended.focus(); }
    }

    function showError(message) {
      if (!errorEl) return;
      errorEl.textContent = message;
      errorEl.hidden = false;
    }
    function clearError() { if (errorEl) { errorEl.hidden = true; errorEl.textContent = ""; } }

    function mint(mode) {
      return fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body: "mode=" + encodeURIComponent(mode),
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
            },
            onDisconnect: function () { hangUp(); },
            onModeChange: function (m) {
              if (statusEl) statusEl.textContent = (m && m.mode === "speaking") ? "De agent spreekt" : "De agent luistert. Zeg iets.";
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
        if (err && err.name === "NotAllowedError") {
          setState("idle");
          showError("Geef de browser toegang tot uw microfoon en probeer het opnieuw.");
        } else if (err && err.name === "NotFoundError") {
          setState("idle");
          showError("Er is geen microfoon gevonden.");
        } else if (err && err.status === 503) {
          setState("idle");
          showError(err.userMessage || "De live demo is op dit moment niet beschikbaar. Plan een demo op mowi.agency/demo.");
        } else if (err && err.status === 429) {
          setState("idle");
          showError(err.userMessage || "De demo is voor nu vol. Probeer het later opnieuw.");
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

  document.addEventListener("DOMContentLoaded", function () {
    var listen = document.querySelector("[data-demo-listen]");
    if (listen) initListen(listen);
    var tryCard = document.querySelector("[data-demo-try]");
    if (tryCard) initTry(tryCard);
  });
})();
