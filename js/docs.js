/* ============================================================
   Documentation section behavior — shared by every docs page.

   Reads window.DOCS_NAV / window.DOCS_HOME (js/docs-nav.js) and:
   - renders the sidebar tree, highlighting the current page
   - renders the breadcrumb (Documentatie / Category / Title)
   - renders previous/next links from the flattened nav order
   - builds the "Op deze pagina" TOC from the article's own h2s,
     with scroll-spy, and hides the TOC column when there are none
   - wires the mobile sidebar toggle
   - wires copy-to-clipboard buttons
   ============================================================ */

(function () {
  var currentHref = document.body.getAttribute("data-docs-href") || "";

  function flattenNav() {
    var flat = [];
    DOCS_NAV.forEach(function (group) {
      group.items.forEach(function (item) {
        flat.push({ title: item.title, href: item.href, category: group.category });
      });
    });
    return flat;
  }

  function renderSidebar() {
    var nav = document.getElementById("docsSidebarNav");
    if (!nav) return;

    DOCS_NAV.forEach(function (group) {
      var section = document.createElement("div");
      section.className = "docs-nav-group";

      var label = document.createElement("div");
      label.className = "docs-nav-group-label";
      label.textContent = group.category;
      section.appendChild(label);

      var ul = document.createElement("ul");
      group.items.forEach(function (item) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.href = item.href;
        a.textContent = item.title;
        if (item.href === currentHref) {
          a.classList.add("active");
          a.setAttribute("aria-current", "page");
        }
        li.appendChild(a);
        ul.appendChild(li);
      });

      section.appendChild(ul);
      nav.appendChild(section);
    });
  }

  function renderBreadcrumb() {
    var el = document.getElementById("docsBreadcrumb");
    if (!el) return;

    var current = flattenNav().filter(function (item) {
      return item.href === currentHref;
    })[0];
    if (!current) return;

    var home = document.createElement("a");
    home.href = DOCS_HOME.href;
    home.textContent = DOCS_HOME.title;
    el.appendChild(home);

    var sep1 = document.createElement("span");
    sep1.className = "sep";
    sep1.textContent = "/";
    el.appendChild(sep1);

    var cat = document.createElement("span");
    cat.className = "current";
    cat.textContent = current.category;
    el.appendChild(cat);

    var sep2 = document.createElement("span");
    sep2.className = "sep";
    sep2.textContent = "/";
    el.appendChild(sep2);

    var page = document.createElement("span");
    page.className = "current";
    page.setAttribute("aria-current", "page");
    page.textContent = current.title;
    el.appendChild(page);
  }

  function renderPrevNext() {
    var el = document.getElementById("docsPrevNext");
    if (!el) return;

    var flat = flattenNav();
    var idx = -1;
    flat.forEach(function (item, i) {
      if (item.href === currentHref) idx = i;
    });
    if (idx === -1) return;

    el.appendChild(buildPrevNextLink(flat[idx - 1], "prev"));
    el.appendChild(buildPrevNextLink(flat[idx + 1], "next"));
  }

  function buildPrevNextLink(item, dir) {
    if (!item) {
      var spacer = document.createElement("span");
      spacer.className = "docs-prevnext-spacer";
      return spacer;
    }

    var a = document.createElement("a");
    a.className = "docs-prevnext-link " + dir;
    a.href = item.href;

    var dirLabel = document.createElement("span");
    dirLabel.className = "docs-prevnext-dir";
    dirLabel.textContent = dir === "prev" ? "‹ Vorige" : "Volgende ›";

    var title = document.createElement("span");
    title.className = "docs-prevnext-title";
    title.textContent = item.title;

    a.appendChild(dirLabel);
    a.appendChild(title);
    return a;
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function buildToc() {
    var contentWrap = document.querySelector(".docs-content-wrap");
    var tocList = document.getElementById("docsTocList");
    var headings = document.querySelectorAll(".docs-article h2");

    if (!tocList || !headings.length) {
      if (contentWrap) contentWrap.classList.add("no-toc");
      return;
    }

    var entries = [];
    headings.forEach(function (h, i) {
      if (!h.id) h.id = "section-" + (i + 1) + "-" + slugify(h.textContent);

      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
      entries.push({ id: h.id, link: a });
    });

    if ("IntersectionObserver" in window) {
      var observer = new IntersectionObserver(
        function (observed) {
          observed.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entries.forEach(function (entry2) {
              entry2.link.classList.toggle("active", entry2.id === entry.target.id);
            });
          });
        },
        { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
      );
      headings.forEach(function (h) {
        observer.observe(h);
      });
    }
  }

  function setupMobileNav() {
    var toggle = document.getElementById("docsMenuToggle");
    var sidebar = document.getElementById("docsSidebar");
    var backdrop = document.getElementById("docsSidebarBackdrop");
    if (!toggle || !sidebar) return;

    function open() {
      sidebar.classList.add("mobile-open");
      if (backdrop) backdrop.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }
    function close() {
      sidebar.classList.remove("mobile-open");
      if (backdrop) backdrop.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      if (sidebar.classList.contains("mobile-open")) close();
      else open();
    });
    if (backdrop) backdrop.addEventListener("click", close);
    sidebar.addEventListener("click", function (e) {
      if (e.target.tagName === "A") close();
    });
  }

  function setupCopyButtons() {
    var buttons = document.querySelectorAll(".docs-copy-btn");
    buttons.forEach(function (btn) {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        btn.style.display = "none";
        return;
      }
      var label = btn.querySelector(".docs-copy-btn-label");
      var originalText = label ? label.textContent : "";

      btn.addEventListener("click", function () {
        var targetId = btn.getAttribute("data-copy-target");
        var target = targetId ? document.getElementById(targetId) : null;
        if (!target) return;

        navigator.clipboard.writeText(target.textContent.trim()).then(function () {
          btn.classList.add("is-copied");
          if (label) label.textContent = "Gekopieerd";
          setTimeout(function () {
            btn.classList.remove("is-copied");
            if (label) label.textContent = originalText;
          }, 1800);
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSidebar();
    renderBreadcrumb();
    renderPrevNext();
    buildToc();
    setupMobileNav();
    setupCopyButtons();
  });
})();
