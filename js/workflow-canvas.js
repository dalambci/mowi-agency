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
(function () {
    "use strict";

    var MIN_SCALE = 0.4;
    var MAX_SCALE = 2;

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

        function markExplored() {
            if (hint) hint.classList.add("wf-hint-hidden");
            try {
                localStorage.setItem("mowiWorkflowCanvasHintSeen", "1");
            } catch (e) {}
        }

        try {
            if (localStorage.getItem("mowiWorkflowCanvasHintSeen") === "1") markExplored();
        } catch (e) {}

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

        var dragging = false;
        var moved = false;
        var startX = 0;
        var startY = 0;
        var startOffsetX = 0;
        var startOffsetY = 0;

        viewport.addEventListener("pointerdown", function (e) {
            // Suppresses the browser's own text-selection drag AND its
            // default focus-on-pointerdown for this focusable element —
            // the latter is restored explicitly right after, so the
            // keyboard pan/zoom shortcuts below still work post-drag.
            e.preventDefault();
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
            if (!dragging) return;
            var dx = e.clientX - startX;
            var dy = e.clientY - startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
            offsetX = startOffsetX + dx;
            offsetY = startOffsetY + dy;
            clamp();
            apply();
        });

        function endDrag() {
            if (!dragging) return;
            dragging = false;
            viewport.classList.remove("wf-dragging");
            if (moved) markExplored();
        }

        viewport.addEventListener("pointerup", endDrag);
        viewport.addEventListener("pointercancel", endDrag);

        viewport.addEventListener(
            "wheel",
            function (e) {
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

        if (zoomInBtn) zoomInBtn.addEventListener("click", function () { zoomAtCenter(1.3); });
        if (zoomOutBtn) zoomOutBtn.addEventListener("click", function () { zoomAtCenter(1 / 1.3); });
        if (resetBtn) resetBtn.addEventListener("click", function () { center(); markExplored(); });

        viewport.addEventListener("keydown", function (e) {
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

    // The outer Call-agent/E-mail-agent pill-tabs are the SITE's own
    // component (js/main.js) — its click handlers are already registered
    // by the time this script runs (main.js loads first, and both run
    // after the DOM is parsed since both script tags sit at the end of
    // body). Adding a second listener here fires AFTER that one, once the
    // panel's hidden state is already updated, so the re-frame sees the
    // correct, just-revealed geometry.
    document.querySelectorAll(".tpl-showcase [role=\"tab\"]").forEach(function (tab) {
        tab.addEventListener("click", function () {
            setTimeout(refitVisibleWorkflowCanvases, 0);
        });
    });
})();
