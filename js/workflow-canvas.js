// Illustrative workflow-template canvas (templates.html only, 2026-08-27) —
// ported 1:1 from the Mowi Dashboard's own Templates gallery. Loaded as its
// own small file (same pattern as docs/ having its own stylesheet) rather
// than folded into main.js, which stays "deliberately tiny" per its own
// header comment and has nothing to do with this one page's widget.
//
// `.wf-stage` is positioned entirely via a CSS `transform: translate(x, y)
// scale(s)`, driven by plain pointer/wheel events — real 2D pan in any
// direction plus wheel/button zoom centered on the cursor. No canvas/pan
// library, matching this site's own "no framework, no build step" rule.
//
// Touch (2026-08-28, Sal: "you can't zoom in and out with the fingers, and
// on mobile the page scroll stops for the widget — do what Google Maps
// does: once you zoom you can drag, scroll away and you have to zoom
// first again"): the viewport is touch-action:pan-y by default, so a
// finger on the canvas scrolls the page. A two-finger pinch — which the
// browser leaves to us because it is not a pan-y gesture — zooms the
// canvas around the fingers' midpoint AND arms it (.wf-armed →
// touch-action:none), after which one-finger drags pan the canvas. An
// IntersectionObserver disarms it as soon as the canvas is mostly
// scrolled out of view, so the next visit starts page-scrolling again.
// Mouse/trackpad behaviour is unchanged: drag always pans, wheel zooms.
(function () {
    "use strict";

    var MIN_SCALE = 0.4;
    var MAX_SCALE = 2;

    var coarsePointer = window.matchMedia && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    // Cooperative wheel (Sal, 2026-08-28: scrolling the page with the
    // cursor over the widget zoomed the widget instead — the same trap
    // Google Maps solves with "use Ctrl + scroll to zoom the map"): a
    // plain wheel scrolls the page and briefly shows this hint; Ctrl/⌘ +
    // wheel (which is also what a trackpad pinch sends) zooms the canvas.
    var isMac = /Mac|iPhone|iPad/.test(navigator.platform || "") || /Mac/.test((navigator.userAgentData && navigator.userAgentData.platform) || "");
    var ZOOM_KEY = isMac ? "⌘" : "Ctrl";
    var HINT_DESKTOP = "Sleep om te verkennen — " + ZOOM_KEY + " + scroll om te zoomen";
    var HINT_TOUCH_DISARMED = "Tik om te verkennen";
    var HINT_TOUCH_ARMED = "Sleep om te verkennen";

    function mountWorkflowCanvas(root) {
        var viewport = root.querySelector("[data-wf-viewport]");
        var stage = root.querySelector("[data-wf-stage]");
        var hint = root.querySelector("[data-wf-hint]");
        var zoomInBtn = root.querySelector("[data-wf-zoom-in]");
        var zoomOutBtn = root.querySelector("[data-wf-zoom-out]");
        var resetBtn = root.querySelector("[data-wf-zoom-reset]");

        if (!viewport || !stage) return;

        var scale = 1;
        var offsetX = 0;
        var offsetY = 0;

        function apply() {
            stage.style.transform = "translate(" + offsetX + "px, " + offsetY + "px) scale(" + scale + ")";
        }

        function stageSize() {
            return { w: stage.offsetWidth, h: stage.offsetHeight };
        }

        function clamp() {
            var size = stageSize();
            var sw = size.w * scale;
            var sh = size.h * scale;
            var margin = 72;
            var minX = Math.min(viewport.clientWidth - sw - margin, margin);
            var maxX = Math.max(viewport.clientWidth - sw - margin, margin);
            var minY = Math.min(viewport.clientHeight - sh - margin, margin);
            var maxY = Math.max(viewport.clientHeight - sh - margin, margin);
            offsetX = Math.min(Math.max(offsetX, minX), maxX);
            offsetY = Math.min(Math.max(offsetY, minY), maxY);
        }

        function center() {
            var size = stageSize();
            scale = 1;
            offsetX = (viewport.clientWidth - size.w * scale) / 2;
            offsetY = 24;
            clamp();
            apply();
        }

        // ---------- Hint ----------
        // Desktop: a one-time onboarding line, hidden for good after the
        // first interaction (remembered in localStorage). Touch: a MODE
        // indicator instead — it always says what a finger will do right
        // now, so it never goes away permanently; it just changes text.
        var hintSeen = false;
        try {
            hintSeen = localStorage.getItem("mowiWorkflowCanvasHintSeen") === "1";
        } catch (e) {}

        function setHint(text, visible) {
            if (!hint) return;
            hint.textContent = text;
            hint.classList.toggle("wf-hint-hidden", !visible);
        }

        // Shows the desktop hint for a moment (a plain wheel over the
        // canvas — the user probably wanted to scroll the page, and did;
        // this just says how to zoom instead), even after it was hidden.
        var flashTimer = null;
        function flashHint() {
            if (!hint || touchSeen) return;
            setHint(HINT_DESKTOP, true);
            clearTimeout(flashTimer);
            flashTimer = setTimeout(function () { setHint(HINT_DESKTOP, false); }, 1600);
        }

        // touchSeen: a touch-screen laptop is a fine-pointer device by the
        // media query but still pinches — arming keys off real touch input;
        // the media query only decides the initial hint.
        var touchSeen = coarsePointer;

        function markExplored() {
            hintSeen = true;
            try {
                localStorage.setItem("mowiWorkflowCanvasHintSeen", "1");
            } catch (e) {}
            if (!touchSeen) setHint(HINT_DESKTOP, false);
        }

        // ---------- Touch arming (Google-Maps style) ----------
        var armed = false;

        function setArmed(next) {
            armed = next;
            viewport.classList.toggle("wf-armed", armed);
            setHint(armed ? HINT_TOUCH_ARMED : HINT_TOUCH_DISARMED, true);
            // Disarmed on touch: the hint is the tap-to-arm button, centered
            // in the frame (css .wf-hint-cta). Armed: back to a passive
            // indicator at the bottom.
            if (hint) {
                hint.classList.toggle("wf-hint-cta", !armed);
                if (!armed) {
                    hint.setAttribute("role", "button");
                    hint.setAttribute("tabindex", "0");
                } else {
                    hint.removeAttribute("role");
                    hint.removeAttribute("tabindex");
                }
            }
        }

        if (hint) {
            hint.addEventListener("click", function () {
                if (!armed && (coarsePointer || touchSeen)) setArmed(true);
            });
            hint.addEventListener("keydown", function (e) {
                if (!armed && hint.classList.contains("wf-hint-cta") && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    setArmed(true);
                }
            });
        }

        if (coarsePointer) {
            setArmed(false);
        } else {
            setHint(HINT_DESKTOP, !hintSeen);
        }
        // Disarm once the canvas is mostly scrolled out of view — for every
        // device, since any touch input can arm it (see touchSeen); it only
        // ever acts while armed.
        if (window.IntersectionObserver) {
            new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (armed && entry.intersectionRatio < 0.5) setArmed(false);
                });
            }, { threshold: [0, 0.5, 1] }).observe(root);
        }

        function zoomBy(factor, originX, originY) {
            var newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
            if (newScale === scale) return;
            var stagePointX = (originX - offsetX) / scale;
            var stagePointY = (originY - offsetY) / scale;
            scale = newScale;
            offsetX = originX - stagePointX * scale;
            offsetY = originY - stagePointY * scale;
            clamp();
            apply();
            markExplored();
        }

        function zoomAtCenter(factor) {
            zoomBy(factor, viewport.clientWidth / 2, viewport.clientHeight / 2);
        }

        // ---------- Pointers: one-finger/mouse drag, two-finger pinch ----------
        var pointers = {};
        var pointerCount = 0;
        var dragging = false;
        var moved = false;
        var startX = 0;
        var startY = 0;
        var startOffsetX = 0;
        var startOffsetY = 0;
        var pinching = false;
        var prevDist = 0;
        var prevMidX = 0;
        var prevMidY = 0;

        function pinchGeometry() {
            var ids = Object.keys(pointers);
            var a = pointers[ids[0]];
            var b = pointers[ids[1]];
            var rect = viewport.getBoundingClientRect();
            return {
                dist: Math.hypot(b.x - a.x, b.y - a.y),
                midX: (a.x + b.x) / 2 - rect.left,
                midY: (a.y + b.y) / 2 - rect.top
            };
        }

        viewport.addEventListener("pointerdown", function (e) {
            pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
            pointerCount = Object.keys(pointers).length;
            if (e.pointerType === "touch") touchSeen = true;

            if (e.pointerType === "touch" && pointerCount === 2) {
                // Second finger down: switch from (possible) drag to pinch.
                e.preventDefault();
                dragging = false;
                viewport.classList.remove("wf-dragging");
                pinching = true;
                var g = pinchGeometry();
                prevDist = g.dist;
                prevMidX = g.midX;
                prevMidY = g.midY;
                viewport.setPointerCapture(e.pointerId);
                return;
            }

            if (e.pointerType === "touch" && !armed) {
                // Not armed: leave the touch to the browser (touch-action:
                // pan-y scrolls the page). Nothing to capture.
                return;
            }

            // Suppresses the browser's own text-selection drag AND its
            // default focus-on-pointerdown for this focusable element —
            // the latter is restored explicitly right after, so the
            // keyboard pan/zoom shortcuts below still work post-drag.
            e.preventDefault();
            viewport.classList.add("wf-pointer-focus");
            viewport.focus();
            dragging = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
            startOffsetX = offsetX;
            startOffsetY = offsetY;
            viewport.setPointerCapture(e.pointerId);
            viewport.classList.add("wf-dragging");
        });

        viewport.addEventListener("pointermove", function (e) {
            if (pointers[e.pointerId]) pointers[e.pointerId] = { x: e.clientX, y: e.clientY };

            if (pinching && Object.keys(pointers).length >= 2) {
                var g = pinchGeometry();
                if (prevDist > 0 && g.dist > 0) zoomBy(g.dist / prevDist, g.midX, g.midY);
                offsetX += g.midX - prevMidX;
                offsetY += g.midY - prevMidY;
                clamp();
                apply();
                prevDist = g.dist;
                prevMidX = g.midX;
                prevMidY = g.midY;
                if (!armed) setArmed(true);
                return;
            }

            if (!dragging) return;
            var dx = e.clientX - startX;
            var dy = e.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
            offsetX = startOffsetX + dx;
            offsetY = startOffsetY + dy;
            clamp();
            apply();
        });

        function endPointer(e) {
            delete pointers[e.pointerId];
            pointerCount = Object.keys(pointers).length;
            if (pinching && pointerCount < 2) {
                pinching = false;
                prevDist = 0;
                // A finger may still be down after the pinch; treat it as the
                // start of a drag from here rather than jumping to its old
                // start point.
                var ids = Object.keys(pointers);
                if (pointerCount === 1 && armed) {
                    var p = pointers[ids[0]];
                    dragging = true;
                    moved = false;
                    startX = p.x;
                    startY = p.y;
                    startOffsetX = offsetX;
                    startOffsetY = offsetY;
                    viewport.classList.add("wf-dragging");
                }
                return;
            }
            if (!dragging) return;
            dragging = false;
            viewport.classList.remove("wf-dragging");
            if (moved) markExplored();
        }

        viewport.addEventListener("pointerup", endPointer);
        viewport.addEventListener("pointercancel", endPointer);

        viewport.addEventListener(
            "wheel",
            function (e) {
                // Plain wheel: let the page scroll (no preventDefault), just
                // say how to zoom. Ctrl/⌘ + wheel — and a trackpad pinch,
                // which browsers deliver as a ctrlKey wheel — zooms.
                if (!e.ctrlKey && !e.metaKey) {
                    flashHint();
                    return;
                }
                e.preventDefault();
                var rect = viewport.getBoundingClientRect();
                var factor = Math.pow(1.0015, -e.deltaY);
                zoomBy(factor, e.clientX - rect.left, e.clientY - rect.top);
            },
            { passive: false }
        );

        viewport.addEventListener("dblclick", function () {
            center();
            markExplored();
        });

        if (zoomInBtn) zoomInBtn.addEventListener("click", function () { zoomAtCenter(1.3); if (touchSeen) setArmed(true); });
        if (zoomOutBtn) zoomOutBtn.addEventListener("click", function () { zoomAtCenter(1 / 1.3); if (touchSeen) setArmed(true); });
        if (resetBtn) resetBtn.addEventListener("click", function () { center(); markExplored(); });

        viewport.addEventListener("keydown", function (e) {
            // Keyboard use: the focus ring is welcome again (see
            // .wf-pointer-focus in css/workflow-canvas.css).
            viewport.classList.remove("wf-pointer-focus");
            var step = 48;
            if (e.key === "ArrowLeft") { offsetX += step; clamp(); apply(); }
            else if (e.key === "ArrowRight") { offsetX -= step; clamp(); apply(); }
            else if (e.key === "ArrowUp") { offsetY += step; clamp(); apply(); }
            else if (e.key === "ArrowDown") { offsetY -= step; clamp(); apply(); }
            else if (e.key === "+" || e.key === "=") zoomAtCenter(1.3);
            else if (e.key === "-" || e.key === "_") zoomAtCenter(1 / 1.3);
            else if (e.key === "0") center();
            else return;
            e.preventDefault();
            markExplored();
        });

        center();
        root.__wfFrame = center;
    }

    function mountAllWorkflowCanvases() {
        var canvases = document.querySelectorAll("[data-wf-canvas]:not([data-wf-mounted])");
        canvases.forEach(function (el) {
            el.setAttribute("data-wf-mounted", "1");
            mountWorkflowCanvas(el);
        });
    }

    function refitVisibleWorkflowCanvases() {
        var canvases = document.querySelectorAll("[data-wf-canvas][data-wf-mounted]");
        canvases.forEach(function (el) {
            if (el.offsetParent !== null && typeof el.__wfFrame === "function") el.__wfFrame();
        });
    }

    // ---------- Branche list: edge fades that know where the scroll is ----------
    // css/workflow-canvas.css masks the list's right edge so it reads as
    // scrollable; these classes drop that mask once the last tile is fully
    // in view (it would otherwise look cut off) and add a left fade once
    // there is content hidden on that side.
    function initBrancheListFades() {
        document.querySelectorAll(".tpl-branche-list").forEach(function (list) {
            function update() {
                var max = list.scrollWidth - list.clientWidth;
                list.classList.toggle("is-scrolled", list.scrollLeft > 2);
                list.classList.toggle("is-at-end", max <= 2 || list.scrollLeft >= max - 2);
            }
            list.addEventListener("scroll", update, { passive: true });
            list.addEventListener("scrollend", update, { passive: true });
            window.addEventListener("resize", update);
            update();
        });
    }

    // ---------- Branche picker within a capability panel ----------
    // Deliberately NOT built on the site's own [data-pill-tabs]/initPillTabs
    // contract (js/main.js): that selector is a plain querySelectorAll over
    // the whole subtree, so nesting a second tab set inside a capability
    // panel would make the OUTER Call-agent/E-mail-agent switcher also pick
    // up all 20 branche buttons as if they were its own tabs. A separate,
    // smaller contract avoids that collision entirely.
    function initTemplateSwitchers() {
        document.querySelectorAll("[data-tpl-group]").forEach(function (group) {
            var buttons = group.querySelectorAll("[data-tpl-select]");
            var examples = group.querySelectorAll("[data-tpl-example]");
            buttons.forEach(function (btn) {
                btn.addEventListener("click", function () {
                    var key = btn.getAttribute("data-tpl-select");
                    buttons.forEach(function (b) { b.classList.toggle("active", b === btn); });
                    examples.forEach(function (ex) {
                        ex.hidden = ex.getAttribute("data-tpl-example") !== key;
                    });
                    // The just-revealed canvas may have mounted at 0×0 while
                    // its example was hidden — re-frame it now that it has
                    // real dimensions.
                    setTimeout(refitVisibleWorkflowCanvases, 0);
                });
            });
        });
    }

    mountAllWorkflowCanvases();
    initTemplateSwitchers();
    initBrancheListFades();

    // The outer Call-agent/E-mail-agent pill-tabs are the SITE's own
    // component (js/main.js) — its click handlers are already registered
    // by the time this script runs (main.js loads first, and both run
    // after the DOM is parsed since both script tags sit at the end of
    // body). Adding a second listener here fires AFTER that one, once the
    // panel's hidden state is already updated, so the re-frame sees the
    // correct, just-revealed geometry. The E-mail panel's branche list was
    // hidden (0 wide) at load, so its fade state is recomputed here too.
    document.querySelectorAll(".tpl-showcase [role=\"tab\"]").forEach(function (tab) {
        tab.addEventListener("click", function () {
            setTimeout(function () {
                refitVisibleWorkflowCanvases();
                window.dispatchEvent(new Event("resize"));
            }, 0);
        });
    });
})();
