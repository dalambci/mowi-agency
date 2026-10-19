/* Hero audio card on the voice landers (2026-10-19, Sal picked call audio over the chat mock).
   One <audio> per card with its own play/pause button, a waveform that fills as it plays and doubles
   as a seek bar, and the current line of the script under it. The lines come from
   content/demo-calls/<slug>.json, the same manifest the homepage demo uses, fetched on first play.
   Never autoplays. ES5, like js/main.js. */
(function () {
  "use strict";

  function fmt(t) {
    t = Math.max(0, Math.round(t));
    return Math.floor(t / 60) + ":" + ("0" + (t % 60)).slice(-2);
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-call-audio]"), function (card) {
    var audio = card.querySelector("audio");
    var button = card.querySelector("[data-call-play]");
    var time = card.querySelector("[data-call-time]");
    var wave = card.querySelector("[data-call-wave]");
    var line = card.querySelector("[data-call-line]");
    var bars = wave ? wave.querySelectorAll("span") : [];
    var total = parseFloat(card.getAttribute("data-duration")) || 0;
    var lines = null;
    var current = 0;
    if (!audio || !button) return;

    function loadLines() {
      if (lines || !window.fetch) return;
      lines = [];
      fetch(card.getAttribute("data-captions"))
        .then(function (r) { return r.json(); })
        .then(function (m) { lines = m.lines || []; paint(); })
        .catch(function () {});
    }

    function show(i) {
      if (i === current || !lines[i] || !line) return;
      current = i;
      var who = document.createElement("small");
      who.textContent = lines[i].role === "agent" ? "Agent" : "Beller";
      line.textContent = "";
      line.appendChild(who);
      line.appendChild(document.createTextNode(lines[i].text));
    }

    function paint() {
      var d = audio.duration || total;
      var lit = d ? Math.round((audio.currentTime / d) * bars.length) : 0;
      for (var k = 0; k < bars.length; k++) bars[k].classList.toggle("on", k < lit);
      if (time) time.textContent = audio.currentTime > 0 ? fmt(audio.currentTime) + " / " + fmt(d) : fmt(d);
      if (lines && lines.length) {
        for (var i = lines.length - 1; i >= 0; i--) {
          if (audio.currentTime >= lines[i].start) { show(i); break; }
        }
      }
    }

    button.addEventListener("click", function () {
      loadLines();
      if (audio.paused) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        audio.pause();
      }
    });
    audio.addEventListener("play", function () {
      card.classList.add("is-playing");
      button.setAttribute("aria-label", "Pauzeren");
    });
    audio.addEventListener("pause", function () {
      card.classList.remove("is-playing");
      button.setAttribute("aria-label", "Gesprek afspelen");
    });
    audio.addEventListener("timeupdate", paint);
    audio.addEventListener("ended", function () {
      audio.currentTime = 0;
      paint();
    });
    if (wave) {
      wave.addEventListener("click", function (event) {
        var d = audio.duration || total;
        if (!d) return;
        loadLines();
        var r = wave.getBoundingClientRect();
        audio.currentTime = Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)) * d;
        paint();
      });
    }
  });
})();
