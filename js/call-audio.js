/* Hero audio card on the voice landers (2026-10-19, Sal picked call audio over the chat mock).
   One <audio> per card with its own play/pause button, a timeline that fills as it plays and doubles
   as a seek bar (click, or the arrow keys on the focused slider), and the current line of the script
   under it. Since 2026-10-20 the timeline looks like a call recording: the generator puts every bar in
   the lane of whoever speaks at that moment (agent above the line, caller below), and the card's
   data-speaker lights the label of whoever is talking now. The lines come from
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
    var track = card.querySelector("[data-call-track]") || wave;
    var fill = card.querySelector("[data-call-fill]");
    var knob = card.querySelector("[data-call-knob]");
    var line = card.querySelector("[data-call-line]");
    var lanes = Array.prototype.map.call(card.querySelectorAll("[data-call-lane]"), function (lane) {
      return lane.querySelectorAll("span");
    });
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
      var agent = lines[i].role === "agent";
      card.setAttribute("data-speaker", agent ? "agent" : "caller");
      var who = document.createElement("small");
      who.textContent = agent ? "Agent" : "Beller";
      line.textContent = "";
      line.appendChild(who);
      line.appendChild(document.createTextNode(lines[i].text));
    }

    function paint() {
      var d = audio.duration || total;
      var f = d ? Math.min(1, audio.currentTime / d) : 0;
      lanes.forEach(function (bars) {
        var lit = Math.round(f * bars.length);
        for (var k = 0; k < bars.length; k++) bars[k].classList.toggle("on", k < lit);
      });
      if (fill) fill.style.width = f * 100 + "%";
      if (knob) knob.style.left = f * 100 + "%";
      if (time) time.textContent = audio.currentTime > 0 ? fmt(audio.currentTime) + " / " + fmt(d) : fmt(d);
      if (wave && wave.getAttribute("role") === "slider") {
        wave.setAttribute("aria-valuenow", String(Math.round(audio.currentTime)));
        wave.setAttribute("aria-valuetext", fmt(audio.currentTime) + " van " + fmt(d));
      }
      if (lines && lines.length) {
        for (var i = lines.length - 1; i >= 0; i--) {
          if (audio.currentTime >= lines[i].start) { show(i); break; }
        }
      }
    }

    function seek(t) {
      var d = audio.duration || total;
      if (!d) return;
      loadLines();
      audio.currentTime = Math.max(0, Math.min(d, t));
      paint();
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
    if (track) {
      track.addEventListener("click", function (event) {
        var d = audio.duration || total;
        var r = track.getBoundingClientRect();
        if (!d || !r.width) return;
        seek(Math.max(0, Math.min(1, (event.clientX - r.left) / r.width)) * d);
      });
    }
    if (wave && wave.getAttribute("role") === "slider") {
      wave.addEventListener("keydown", function (event) {
        var step = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5 }[event.key];
        if (step) seek(audio.currentTime + step);
        else if (event.key === "Home") seek(0);
        else if (event.key === "End") seek(audio.duration || total);
        else return;
        event.preventDefault();
      });
    }
  });
})();
