/* Blog build script — not part of the shipped site's runtime, same status as
   serve.js/screenshot.js (local dev tooling only). Reads Markdown + YAML
   frontmatter from content/blog/*.md and writes plain static HTML into
   blog/*.html, plus blog/index.html, sitemap.xml, and blog/feed.xml — all
   generated fresh from frontmatter, per the "no build step for the shipped
   site" rule: the OUTPUT is committed static HTML with zero runtime Node
   dependency; only the local authoring step uses Node.

   Run with: node build-blog.js
   Publishing a post = edit/add a .md file in content/blog/, run this, deploy. */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, "content", "blog");
const OUTPUT_DIR = path.join(ROOT, "blog");
const SITE_URL = "https://mowi.agency";
const CSS_VERSION = "20260811-1"; // bump alongside every css/style.css edit
// Website & Conversion plan, Phase 1: Plausible, no cookie banner needed.
// data-domain must exactly match the account Sal creates at plausible.io.
const PLAUSIBLE_SNIPPET = `<script defer data-domain="mowi.agency" src="https://plausible.io/js/script.js"></script>`;
// Loaded from <head>, deliberately not bundled into main.js — see
// js/broken-image-guard.js's own header comment for why (a race against
// images already present in the initial HTML).
const BROKEN_IMAGE_GUARD_SNIPPET = `<script src="/js/broken-image-guard.js?v=${CSS_VERSION}"></script>`;

// ---------------------------------------------------------------------------
// Minimal YAML-frontmatter parser (subset: scalars, inline arrays, block
// arrays of scalars, block arrays of objects — exactly what post frontmatter
// needs, nothing more. Not a general YAML parser.)
// ---------------------------------------------------------------------------
function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("No frontmatter block found (expected --- ... ---)");
  const [, fmText, body] = match;
  const lines = fmText.split(/\r?\n/);
  const data = {};
  let currentKey = null;
  let currentArray = null;
  let currentObj = null;

  const stripQuotes = (s) => {
    s = s.trim();
    if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
      return s.slice(1, -1);
    }
    return s;
  };

  // Strip trailing "  # comment" content (a space before the #, so a literal
  // "#" inside an unquoted value would need to be adjacent to other text to
  // survive — good enough for frontmatter, not a general YAML/CSV rule).
  const stripComment = (s) => s.replace(/\s+#.*$/, "");

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;
    const indent = rawLine.match(/^ */)[0].length;
    const line = stripComment(rawLine.trim());
    if (!line) continue;

    if (indent === 0) {
      const m = line.match(/^([\w-]+):\s*(.*)$/);
      if (!m) continue;
      const [, key, rest] = m;
      currentObj = null;
      currentArray = null;
      if (rest === "") {
        // Ambiguous: could be a block array, or simply an empty/absent scalar
        // (e.g. "video_id:" with nothing set). Default to empty string; only
        // upgraded to an array if a "- " line actually follows under this key.
        currentKey = key;
        data[key] = "";
      } else if (rest.startsWith("[") && rest.endsWith("]")) {
        // inline array
        const inner = rest.slice(1, -1).trim();
        data[key] = inner === "" ? [] : inner.split(",").map((s) => stripQuotes(s.trim()));
        currentKey = null;
        currentArray = null;
      } else if (rest === "true" || rest === "false") {
        data[key] = rest === "true";
        currentKey = null;
        currentArray = null;
      } else {
        data[key] = stripQuotes(rest);
        currentKey = null;
        currentArray = null;
      }
    } else if (indent === 2 && line.startsWith("- ") && currentKey) {
      if (!currentArray) {
        currentArray = [];
        data[currentKey] = currentArray;
      }
      const rest = line.slice(2);
      const m = rest.match(/^([\w-]+):\s*(.*)$/);
      if (m) {
        currentObj = { [m[1]]: stripQuotes(m[2]) };
        currentArray.push(currentObj);
      } else {
        currentArray.push(stripQuotes(rest));
        currentObj = null;
      }
    } else if (indent >= 4 && currentObj) {
      const m = line.match(/^([\w-]+):\s*(.*)$/);
      if (m) currentObj[m[1]] = stripQuotes(m[2]);
    }
  }

  return { data, body: body.replace(/^\r?\n/, "") };
}

// ---------------------------------------------------------------------------
// Minimal inline-markdown renderer: **bold**, [text](url). Assumes trusted,
// hand-authored input — no HTML-escaping of arbitrary user content.
// ---------------------------------------------------------------------------
function renderInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

// For JSON-LD text fields: real plain text, not markdown or HTML — a rich
// snippet showing literal "[Exact Online](/koppelingen/...)" would look
// broken in search results, so bold/link syntax is stripped, not rendered.
function stripInlineMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}

// ---------------------------------------------------------------------------
// Block-level markdown renderer for the post body. Supports: paragraphs,
// ## headings, pipe tables, [BEELD: ...] media placeholders. First paragraph
// is wrapped as the mandatory "direct answer" callout.
// ---------------------------------------------------------------------------
function renderBody(md) {
  const blocks = md.trim().split(/\r?\n\r?\n+/);
  let html = "";
  let isFirstParagraph = true;

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("## ")) {
      html += `<h2>${renderInline(trimmed.slice(3).trim())}</h2>\n`;
      continue;
    }

    if (trimmed.startsWith("[BEELD:") && trimmed.endsWith("]")) {
      const caption = trimmed.slice(7, -1).trim();
      html += `<div class="blog-media-placeholder">${renderInline(caption)}</div>\n`;
      continue;
    }

    // Standalone image block: ![alt](src) or ![alt](src "optional caption")
    const imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)"\s]+)(?:\s+"([^"]*)")?\)$/);
    if (imgMatch) {
      const [, alt, src, caption] = imgMatch;
      html += `<figure class="blog-figure"><img src="${src}" alt="${alt}" loading="lazy" />${caption ? `<figcaption>${renderInline(caption)}</figcaption>` : ""}</figure>\n`;
      continue;
    }

    if (trimmed.startsWith("|")) {
      const rows = trimmed.split(/\r?\n/).filter((r) => r.trim().startsWith("|"));
      const cells = (row) =>
        row.split("|").slice(1, -1).map((c) => c.trim());
      const header = cells(rows[0]);
      const bodyRows = rows.slice(2).map(cells); // rows[1] is the --- separator
      html += '<div class="blog-table-wrap"><table class="blog-table"><thead><tr>';
      html += header.map((h) => `<th>${renderInline(h)}</th>`).join("");
      html += "</tr></thead><tbody>";
      for (const r of bodyRows) {
        html += "<tr>" + r.map((c) => `<td>${renderInline(c)}</td>`).join("") + "</tr>";
      }
      html += "</tbody></table></div>\n";
      continue;
    }

    // plain paragraph
    const p = `<p>${renderInline(trimmed)}</p>\n`;
    if (isFirstParagraph) {
      html += `<div class="blog-direct-answer">${p}</div>\n`;
      isFirstParagraph = false;
    } else {
      html += p;
    }
  }

  return html;
}

function renderFaq(faq) {
  if (!faq || !faq.length) return "";
  let html = '<div class="blog-faq"><h2>Veelgestelde vragen</h2>\n';
  for (const item of faq) {
    html += `<div class="blog-faq-item"><p class="blog-faq-q">${renderInline(item.q)}</p><p>${renderInline(item.a)}</p></div>\n`;
  }
  html += "</div>\n";
  return html;
}

function renderSources(sources) {
  if (!sources || !sources.length) return "";
  let html = '<div class="blog-sources"><strong>Bronnen</strong><ul>\n';
  for (const s of sources) html += `<li>${renderInline(s)}</li>\n`;
  html += "</ul></div>\n";
  return html;
}

function renderVideo(videoId) {
  if (!videoId) return "";
  return `<div class="blog-video-facade" data-video-id="${videoId}">
  <img src="https://i.ytimg.com/vi/${videoId}/hqdefault.jpg" alt="" loading="lazy" />
  <span class="blog-video-play"><span>&#9654;</span></span>
</div>\n`;
}

function formatDateNL(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  const maanden = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
  return `${parseInt(d, 10)} ${maanden[parseInt(m, 10) - 1]} ${y}`;
}

// ---------------------------------------------------------------------------
// Page shell — same header/footer markup as every other root page, so nav
// stays in sync manually the same way it already does across index.html,
// cases.html, etc. (the site has no shared header/footer template anywhere).
// ---------------------------------------------------------------------------
function headerHtml() {
  return `  <header class="site-header">
    <div class="header-bar">
      <span class="header-cta-slot">
        <a href="https://dashboard.mowi.agency/aanmelden" class="header-cta" data-event="Signup Started">
          <span class="header-cta-full">Start gratis</span><span class="header-cta-short">Start gratis</span>
        </a>
      </span>

      <nav class="main-nav" id="main-nav" aria-label="Hoofdmenu">
        <ul class="nav-group">
          <li class="nav-dropdown">
            <button type="button" class="nav-dropdown-trigger" aria-expanded="false" aria-controls="products-menu" aria-haspopup="true">
              Products
              <span class="nav-dropdown-icon" aria-hidden="true"></span>
            </button>
            <div class="nav-megamenu" id="products-menu">
              <div class="nav-megamenu-col">
                <p class="nav-megamenu-label">Platform</p>
                <ul>
                  <li><a href="/agentic-ai">Agentic AI</a></li>
                  <li><a href="/power-bi-dashboards">Power BI</a></li>
                  <li><a href="/trainingen">Trainingen</a></li>
                </ul>
              </div>
              <div class="nav-megamenu-col">
                <p class="nav-megamenu-label">Automations</p>
                <ul>
                  <li><a href="/agents/email-triage">Email triage</a></li>
                  <li><a href="/agents/phone-agent">Phone agent</a></li>
                </ul>
              </div>
            </div>
          </li>
          <li><a href="/tarieven">Tarieven</a></li>
        </ul>
        <ul class="nav-group">
          <li><a href="/cases">Cases</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
        <a href="https://dashboard.mowi.agency/aanmelden" class="btn btn-primary header-cta-mobile" data-event="Signup Started">Start gratis</a>
        <a href="https://dashboard.mowi.agency/login" class="header-dashboard-mobile" target="_blank" rel="noopener">Dashboard log in</a>
      </nav>

      <div class="header-logo-cell">
        <a href="https://dashboard.mowi.agency/login" class="header-dashboard-btn" aria-label="Dashboard inloggen" target="_blank" rel="noopener">
          <span class="header-dashboard-icon" aria-hidden="true"></span>
        </a>
        <a href="/" class="wordmark" aria-label="Mowi - home">
          <img src="/assets/mowi-icon.png" alt="" class="wordmark-icon" />
          <img src="/assets/mowi-wordmark.png" alt="Mowi" class="wordmark-text" />
        </a>
      </div>

      <button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="main-nav" aria-label="Menu openen">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>
`;
}

function footerHtml() {
  return `  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="footer-brand">
        <span class="wordmark wordmark-lg">
          <img src="/assets/mowi-icon.png" alt="" class="wordmark-icon" />
          <img src="/assets/mowi-wordmark.png" alt="Mowi" class="wordmark-text" />
        </span>
        <p>AI-automatisering, Power BI dashboards en trainingen voor MKB-bedrijven in Nederland en Vlaanderen.</p>
      </div>

      <nav class="footer-nav" aria-label="Footermenu">
        <span class="footer-heading">Navigatie</span>
        <a href="/">Home</a>
        <a href="/agentic-ai">Agentic AI</a>
        <a href="/power-bi-dashboards">Power BI</a>
        <a href="/trainingen">Trainingen</a>
        <a href="/tarieven">Tarieven</a>
        <a href="/blog/">Blog</a>
        <a href="/cases">Cases</a>
        <a href="/contact">Contact</a>
      </nav>

      <nav class="footer-support" aria-label="Supportmenu">
        <span class="footer-heading">Support</span>
        <a href="/docs/">Documentatie</a>
      </nav>

      <div class="footer-contact">
        <span class="footer-heading">Contact</span>
        <p>085 333 5800</p>
        <p>contact@mowi.agency</p>
      </div>
    </div>

    <div class="container footer-bottom">
      <p>&copy; 2026 Mowi &middot; Nederland &amp; Belgi&euml;</p>
      <div class="footer-legal">
        <a href="/privacyverklaring">Privacyverklaring</a>
        <a href="/algemene-voorwaarden">Algemene voorwaarden</a>
      </div>
    </div>
  </footer>
  <script src="/js/main.js?v=${CSS_VERSION}"></script>
  <script>
    document.querySelectorAll(".blog-video-facade").forEach(function (el) {
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-video-id");
        el.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
      }, { once: true });
    });
  </script>
`;
}

function articleJsonLd(post, url) {
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    author: { "@type": "Person", name: typeof post.author === "string" ? post.author : (post.author && post.author.name) || "" },
    publisher: {
      "@type": "Organization",
      name: "Mowi",
      logo: { "@type": "ImageObject", url: `${SITE_URL}/assets/mowi-icon.png` },
    },
    datePublished: post.date,
    dateModified: post.updated || post.date,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
  const blocks = [article];

  if (post.faq && post.faq.length) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((f) => ({
        "@type": "Question",
        name: stripInlineMarkdown(f.q),
        acceptedAnswer: { "@type": "Answer", text: stripInlineMarkdown(f.a) },
      })),
    });
  }

  blocks.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  });

  return blocks.map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join("\n  ");
}

function renderPost(post) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const dateVisible = formatDateNL(post.date);
  const updatedVisible = post.updated ? formatDateNL(post.updated) : "";
  const authorName = typeof post.author === "string" ? post.author : (post.author && post.author.name) || "";

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${post.title} — Mowi</title>
  <meta name="description" content="${post.description}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${post.title}" />
  <meta property="og:description" content="${post.description}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE_URL}/assets/og-default.png" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${post.title}" />
  <meta name="twitter:description" content="${post.description}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css?v=${CSS_VERSION}" />
  <link rel="icon" href="/assets/icon-192.png?v=20260804-3" />
  <link rel="shortcut icon" href="/assets/icon-192.png?v=20260804-3" />
  <link rel="apple-touch-icon" href="/assets/apple-icon-180.png?v=20260804-3" />
  <link rel="apple-touch-icon-precomposed" href="/assets/apple-icon-180.png?v=20260804-3" />
  ${PLAUSIBLE_SNIPPET}
  ${BROKEN_IMAGE_GUARD_SNIPPET}
  ${articleJsonLd(post, url)}
</head>
<body>
${headerHtml()}
  <main class="blog-article container">
    <p class="blog-breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/blog/">Blog</a> &rsaquo; ${post.title}</p>
    <h1>${post.title}</h1>
    <p class="blog-meta">${authorName ? authorName + " &middot; " : ""}Gepubliceerd ${dateVisible}${updatedVisible ? " &middot; Laatst bijgewerkt " + updatedVisible : ""}</p>

    ${renderBody(post._body)}
    ${renderVideo(post.video_id)}
    ${renderFaq(post.faq)}
    ${renderSources(post.sources)}

    <div class="blog-cta">
      <p>Benieuwd wat dit voor uw situatie betekent?</p>
      <a href="https://dashboard.mowi.agency/aanmelden" class="btn btn-primary" data-event="Signup Started">Start gratis — eerste maand</a>
      <p class="cta-alt">Liever eerst overleggen? <a href="/contact#calendly-widget" data-event="CTA Click">Plan een kennismaking</a></p>
    </div>
  </main>
${footerHtml()}
</body>
</html>
`;
}

function renderIndex(posts) {
  const cards = posts
    .map(
      (p) => `      <a href="/blog/${p.slug}" class="card blog-card">
        <p class="blog-card-date">${formatDateNL(p.date)}</p>
        <h3>${p.title}</h3>
        <p>${p.description}</p>
        ${p.tags && p.tags.length ? `<div class="blog-card-tags">${p.tags.map((t) => `<span>${t}</span>`).join("")}</div>` : ""}
      </a>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Blog — Mowi</title>
  <meta name="description" content="Praktische antwoorden over AI-automatisering voor het MKB: kosten, koppelingen, en wat werkt in de praktijk." />
  <link rel="canonical" href="${SITE_URL}/blog" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/css/style.css?v=${CSS_VERSION}" />
  <link rel="icon" href="/assets/icon-192.png?v=20260804-3" />
  <link rel="shortcut icon" href="/assets/icon-192.png?v=20260804-3" />
  <link rel="apple-touch-icon" href="/assets/apple-icon-180.png?v=20260804-3" />
  <link rel="apple-touch-icon-precomposed" href="/assets/apple-icon-180.png?v=20260804-3" />
  ${PLAUSIBLE_SNIPPET}
  ${BROKEN_IMAGE_GUARD_SNIPPET}
</head>
<body>
${headerHtml()}
  <main class="container" style="padding-bottom: 5rem;">
    <div class="blog-index-intro">
      <h1>Blog</h1>
      <p>Praktische antwoorden over AI-automatisering voor het MKB — kosten, koppelingen, en wat werkt in de praktijk.</p>
    </div>
    <div class="blog-index-grid">
${cards || '      <p>Binnenkort de eerste posts.</p>'}
    </div>
  </main>
${footerHtml()}
</body>
</html>
`;
}

function buildSitemap(posts) {
  const staticPages = [
    "", "cases", "contact", "agentic-ai", "power-bi-dashboards", "trainingen", "tarieven", "docs/",
  ];
  // docs/, agents/ are read from disk rather than hand-listed, so a new page
  // in either folder is in the sitemap the next time this script runs — no
  // separate "don't forget the sitemap" step to remember. koppelingen/ no
  // longer exists (those pages sold agents that were removed from the
  // product lineup — see the vault's decisions log) — dropped from here too.
  const readFolderSlugs = (folder) =>
    fs.readdirSync(path.join(ROOT, folder)).filter((f) => f.endsWith(".html")).map((f) => folder + "/" + f.replace(/\.html$/, ""));
  const docsSlugs = readFolderSlugs("docs");
  const agentSlugs = readFolderSlugs("agents");
  const urls = [
    ...staticPages.map((p) => `${SITE_URL}/${p}`),
    ...docsSlugs.map((p) => `${SITE_URL}/${p}`),
    ...agentSlugs.map((p) => `${SITE_URL}/${p}`),
    `${SITE_URL}/blog`,
    ...posts.map((p) => `${SITE_URL}/blog/${p.slug}`),
  ];
  const today = new Date().toISOString().slice(0, 10);
  const body = urls
    .map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function buildFeed(posts) {
  const items = posts
    .map(
      (p) => `    <item>
      <title>${p.title}</title>
      <description>${p.description}</description>
      <link>${SITE_URL}/blog/${p.slug}</link>
      <guid>${SITE_URL}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel>\n  <title>Mowi Blog</title>\n  <description>Praktische antwoorden over AI-automatisering voor het MKB</description>\n  <link>${SITE_URL}/blog</link>\n${items}\n  </channel></rss>\n`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const preview = process.argv.includes("--preview");
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md"));
  const allPosts = [];
  const publishedPosts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), "utf8");
    const { data, body } = parseFrontmatter(raw);
    const post = { ...data, _body: body };
    if (!post.slug) throw new Error(`${file}: missing required field "slug"`);
    if (!post.title) throw new Error(`${file}: missing required field "title"`);
    if (!post.description) throw new Error(`${file}: missing required field "description"`);
    if (!post.date) throw new Error(`${file}: missing required field "date"`);
    allPosts.push(post);
    if (!post.draft) publishedPosts.push(post);
  }

  publishedPosts.sort((a, b) => (a.date < b.date ? 1 : -1));

  const written = [];
  for (const post of publishedPosts) {
    const outPath = path.join(OUTPUT_DIR, `${post.slug}.html`);
    fs.writeFileSync(outPath, renderPost(post));
    written.push(`blog/${post.slug}.html`);
  }

  fs.writeFileSync(path.join(OUTPUT_DIR, "index.html"), renderIndex(publishedPosts));
  written.push("blog/index.html");

  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), buildSitemap(publishedPosts));
  written.push("sitemap.xml");

  fs.writeFileSync(path.join(OUTPUT_DIR, "feed.xml"), buildFeed(publishedPosts));
  written.push("blog/feed.xml");

  console.log(`Built ${publishedPosts.length} published post(s), ${allPosts.length - publishedPosts.length} draft(s) skipped.`);
  written.forEach((f) => console.log("  wrote", f));

  // --preview: also render EVERY post (including drafts) into a gitignored
  // scratch folder, purely for local QA. Never part of the real site,
  // sitemap, or index — the draft filter above is untouched.
  if (preview) {
    const previewDir = path.join(ROOT, "blog-preview");
    if (!fs.existsSync(previewDir)) fs.mkdirSync(previewDir, { recursive: true });
    for (const post of allPosts) {
      fs.writeFileSync(path.join(previewDir, `${post.slug}.html`), renderPost(post));
    }
    console.log(`\n--preview: wrote ${allPosts.length} post(s) (incl. drafts) to blog-preview/ for QA only.`);
  }
}

main();
