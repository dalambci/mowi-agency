#!/usr/bin/env node
/*
 * ralph/verify.mjs — mechanical gate for the autonomous site-batch loop.
 *
 * WHY THIS EXISTS
 * The loop writes pages unsupervised. It cannot be trusted to eyeball its own
 * output, so every task is only "done" once this script exits 0. That makes
 * this file the single point where a wrong rule ships garbage (false PASS) or
 * deadlocks the loop forever (false FAIL). Both failure modes are expensive,
 * so every rule below is measured against files that already exist in the repo
 * rather than assumed from a spec.
 *
 * TWO RULES THAT KEEP THE GATES HONEST (learned from an adversarial audit)
 *   1. Content checks read COMMENT-STRIPPED source. This repo is full of
 *      developer notes, and an LLM leaving a commented-out draft block is a
 *      first-class scenario. A commented <h1>, canonical, CTA, breadcrumb,
 *      ld+json or description must never satisfy its gate. Only `structure`
 *      reads truly raw source, because comment-stripping would hide exactly the
 *      truncated block it exists to catch.
 *   2. Class names are matched as whole tokens. `btn-primary-lander` is not
 *      `btn-primary`; it is a class that does not exist in css/, and a page
 *      using it renders an unstyled text link while looking correct in a naive
 *      substring test.
 *
 * Usage:   node ralph/verify.mjs [--dom] <file.html> [...more files]
 * Run from the repo root. Exit 0 = all green. Exit 1 = at least one FAIL.
 * WARNs are advisory and never change the exit code.
 *
 * Zero npm dependencies on the normal path. --dom lazily imports playwright
 * (already a devDependency) and degrades to a WARN if it or chromium is absent.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';

/* ------------------------------------------------------------------ *
 * Small shared helpers
 * ------------------------------------------------------------------ */

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'",
  nbsp: ' ', mdash: '—', ndash: '–', hellip: '…',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”',
  laquo: '«', raquo: '»', lsaquo: '‹', rsaquo: '›',
  copy: '©', reg: '®', trade: '™', times: '×',
  euro: '€', deg: '°', middot: '·', bull: '•',
  eacute: 'é', egrave: 'è', euml: 'ë',
  iuml: 'ï', ouml: 'ö', uuml: 'ü', auml: 'ä',
  aacute: 'á', iacute: 'í', oacute: 'ó', uacute: 'ú',
  ccedil: 'ç', ntilde: 'ñ', szlig: 'ß',
};

/** Decode the entity forms this site actually uses. Numeric forms are handled
 *  generically (any number of digits, leading zeroes included, `&#x` in either
 *  case); named ones come from the table above. Unknown entities are left
 *  verbatim so they stay visible in error messages. */
function decodeEntities(s) {
  if (!s) return '';
  return s
    .replace(/&#[xX]([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-zA-Z][a-zA-Z0-9]*);/g, (m, name) =>
      Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, name) ? NAMED_ENTITIES[name] : m);
}

const collapse = (s) => s.replace(/\s+/g, ' ').trim();

/** Everything a human would read: tags gone, entities decoded, spacing flat. */
function visibleText(html) {
  return collapse(decodeEntities(html.replace(/<[^>]*>/g, ' ')));
}

/** HTML comments are developer notes. They are in the source and never on the
 *  page, so every content gate reads source with them removed. */
function stripComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, ' ');
}

/** <script> BODIES are not prose. Stripped only where prose is scanned; never
 *  where a <script src="js/main.js?v=..."> tag itself carries a checked value,
 *  because this also removes the opening tag. */
function stripScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
}

function stripCommentsAndScripts(html) {
  return stripScripts(stripComments(html));
}

/** ~N chars either side of an offset, on one line, for error messages. */
function contextAt(s, index, radius = 30) {
  const start = Math.max(0, index - radius);
  const end = Math.min(s.length, index + radius);
  return (start > 0 ? '…' : '') + collapse(s.slice(start, end)) + (end < s.length ? '…' : '');
}

function countMatches(s, re) {
  const m = s.match(re);
  return m ? m.length : 0;
}

/** Match a whole <tag ...> including attribute values that contain ">".
 *  A naive /<meta\b[^>]*>/ stops at the first ">" wherever it is, so a
 *  description like `content="... Instellingen > API ..."` (a real click-path
 *  from the sanctioned content source) parses as a missing tag. */
function tagRe(name) {
  return new RegExp(`<${name}\\b(?:[^>"']|"[^"]*"|'[^']*')*>`, 'gi');
}

/** One attribute value out of a tag, either quoting style, unquoted last. */
function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`, 'i'));
  if (!m) return null;
  return m[1] !== undefined ? m[1] : (m[2] !== undefined ? m[2] : m[3]);
}

/** True when a tag carries `token` as a WHOLE class name. */
function hasClass(tag, token) {
  const val = attr(tag, 'class');
  return val ? val.split(/\s+/).includes(token) : false;
}

/** A class attribute holding `token` as a whole class name. Deliberately not
 *  /\bbtn-primary\b/: \b matches at "-", so that form also accepts
 *  btn-primary-lander, xx-btn-primary and not-btn-primary, none of which exist
 *  in css/. Note the token may sit first in the attribute (`class="btn-primary
 *  page-cta"` is the canonical D4 markup), so an anchor requiring whitespace
 *  BEFORE the token would be a false FAIL on every correct page. */
function classTokenRe(token, flags = 'g') {
  const t = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `\\bclass\\s*=\\s*(?:"(?:[^"]*\\s)?${t}(?:\\s[^"]*)?"|'(?:[^']*\\s)?${t}(?:\\s[^']*)?')`,
    flags);
}

const BTN_PRIMARY = () => classTokenRe('btn-primary', 'g');

/** The <main>…</main> slice. Greedy to the LAST </main> so nested markup that
 *  happens to contain the string can't truncate the slice early. Both ends are
 *  matched case-insensitively: HTML tag names are, and a regex-open /
 *  indexOf-close pair would silently return an empty slice on <MAIN>. */
function sliceMain(html) {
  const open = html.match(/<main\b[^>]*>/i);
  if (!open) return '';
  const start = open.index + open[0].length;
  const closes = [...html.matchAll(/<\/main\s*>/gi)];
  if (!closes.length) return '';
  const end = closes[closes.length - 1].index;
  if (end < start) return '';
  return html.slice(start, end);
}

/** The site chrome blocks, anchored on their canonical class. Anchoring matters:
 *  "the first <header> in the file" is not the site header. A perfectly ordinary
 *  <footer class="post-meta"> inside <main> would be compared against
 *  test.html's footer and produce an unfixable-looking FAIL, and a decoy copy of
 *  the real chrome inside a comment would be compared instead of the real one
 *  and produce a false PASS. */
const CHROME = {
  header: { tag: 'header', cls: 'site-header' },
  footer: { tag: 'footer', cls: 'footer-wrap' },
};

function sliceChrome(html, which) {
  const { tag, cls } = CHROME[which];
  const open = [...html.matchAll(tagRe(tag))].find((m) => hasClass(m[0], cls));
  if (!open) return '';
  // Walk forward counting depth to find THIS block's own close tag. Neither
  // "the first </tag>" nor "the last </tag>" is right: a page may carry another
  // <header>/<footer> of its own inside <main> (a card header, a post-meta
  // footer), which makes "first" truncate the slice and "last" overrun it.
  const scan = new RegExp(`<${tag}\\b(?:[^>"']|"[^"]*"|'[^']*')*>|</${tag}\\s*>`, 'gi');
  scan.lastIndex = open.index;
  let depth = 0;
  let m;
  while ((m = scan.exec(html)) !== null) {
    if (m[0][1] === '/') {
      depth--;
      if (depth === 0) return html.slice(open.index, m.index + m[0].length);
    } else if (!/\/>$/.test(m[0])) {
      depth++;
    }
  }
  return '';
}

/* ------------------------------------------------------------------ *
 * Link resolution — reproduces the server's try_files fallback locally
 * ------------------------------------------------------------------ */

/**
 * Map an href/src to the file on disk the production server would serve, or
 * null when it is out of scope (external host, mailto:, pure fragment, …).
 * Returns { target, resolved } where `resolved` is an absolute path.
 */
function resolveHref(href, fileDir, repoRoot) {
  const h = href.trim();
  if (!h) return null;
  if (/^(mailto:|tel:|javascript:|data:|sms:)/i.test(h)) return null;
  if (h.startsWith('#')) return null;                      // same-page fragment

  let p = h;

  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(p) || p.startsWith('//')) {
    // Absolute URL. Only our own canonical host is checkable on disk; anything
    // else (my.mowi.agency, fonts.googleapis.com, plausible.io) is off-limits.
    let u;
    try {
      u = new URL(p.startsWith('//') ? 'https:' + p : p);
    } catch {
      return null;
    }
    if (u.hostname !== 'mowi.agency' && u.hostname !== 'www.mowi.agency') return null;
    p = u.pathname;
  }

  // Strip fragment and query — neither reaches the filesystem.
  p = p.split('#')[0].split('?')[0];
  if (!p) return null;

  // Directory-ish URLs get index.html, exactly like the server does.
  if (p === '/') p = '/index.html';
  else if (p.endsWith('/')) p = p + 'index.html';
  else {
    const last = p.slice(p.lastIndexOf('/') + 1);
    if (!last.includes('.')) p = p + '.html';              // extensionless fallback
  }

  const resolved = p.startsWith('/')
    ? path.resolve(repoRoot, '.' + p)
    : path.resolve(fileDir, p);

  return { target: h, resolved };
}

/* ------------------------------------------------------------------ *
 * Canonical URL expectation
 * ------------------------------------------------------------------ */

function expectedCanonical(relPath) {
  const norm = relPath.split(path.sep).join('/').replace(/\.html$/i, '');
  // DEVIATION (documented): the naive "strip .html" rule yields
  // https://mowi.agency/index for index.html, which no index page in this repo
  // uses — index.html ships "https://mowi.agency/" and blog/index.html ships
  // "https://mowi.agency/blog". Landers (koppeling-*.html) are unaffected; this
  // carve-out only stops the generic PAGE rule from being provably wrong.
  if (norm === 'index') return ['https://mowi.agency/'];
  if (norm.endsWith('/index')) {
    const dir = norm.slice(0, -'/index'.length);
    return [`https://mowi.agency/${dir}`, `https://mowi.agency/${dir}/`];
  }
  return [`https://mowi.agency/${norm}`];
}

/* ------------------------------------------------------------------ *
 * Checks
 * ------------------------------------------------------------------ */

const ALL = ['lander', 'sheet', 'page'];
const ok = (detail) => ({ status: 'PASS', detail });
const bad = (detail) => ({ status: 'FAIL', detail });
const warn = (detail) => ({ status: 'WARN', detail });

const CHECKS = [
  /* 1 -------------------------------------------------------------- */
  {
    id: 'structure',
    appliesTo: ALL,
    run({ raw }) {
      // We author these files by hand-editing blocks. The realistic breakage is
      // a truncated or double-pasted block, which always shows up as an
      // open/close count mismatch — not as exotic malformed HTML.
      // This is the ONE check that reads truly raw source: stripping comments
      // first would hide exactly the truncated block it exists to catch.
      const pairs = [
        ['div', /<div[\s>]/gi, /<\/div\s*>/gi],
        ['section', /<section[\s>]/gi, /<\/section\s*>/gi],
        ['main', /<main[\s>]/gi, /<\/main\s*>/gi],
        ['a', /<a[\s>]/gi, /<\/a\s*>/gi],
      ];
      const parts = [];
      const problems = [];
      for (const [name, openRe, closeRe] of pairs) {
        const o = countMatches(raw, openRe);
        const c = countMatches(raw, closeRe);
        parts.push(`${name} ${o}/${c}`);
        if (o !== c) problems.push(`<${name}> opened ${o}x but closed ${c}x (delta ${o - c})`);
      }
      const mainOpens = countMatches(raw, /<main[\s>]/gi);
      if (mainOpens !== 1) problems.push(`expected exactly one <main, found ${mainOpens}`);
      return problems.length ? bad(problems.join('; ')) : ok(parts.join(', '));
    },
  },

  /* 2 -------------------------------------------------------------- */
  {
    id: 'lang',
    appliesTo: ALL,
    run({ raw }) {
      const tag = raw.match(/<html\b[^>]*>/i);
      if (!tag) return bad('no <html> tag found');
      const lang = attr(tag[0], 'lang');
      if (lang === null) return bad(`<html> has no lang attribute: ${collapse(tag[0])}`);
      return lang === 'nl'
        ? ok('lang="nl"')
        : bad(`lang="${lang}", expected lang="nl"`);
    },
  },

  /* 3 -------------------------------------------------------------- */
  {
    id: 'h1',
    appliesTo: ALL,
    run({ src }) {
      // Case-insensitive: <H1> is the same element to a browser.
      const n = countMatches(src, /<h1[\s>]/gi);
      if (n === 1) {
        const t = src.match(/<h1[^>]*>([\s\S]*?)<\/h1\s*>/i);
        return ok(`1 <h1>${t ? `: "${visibleText(t[1]).slice(0, 60)}"` : ''}`);
      }
      return bad(`found ${n} <h1> elements, expected exactly 1`);
    },
  },

  /* 4 -------------------------------------------------------------- */
  {
    id: 'title',
    appliesTo: ALL,
    run({ src, kind }) {
      const m = src.match(/<title[^>]*>([\s\S]*?)<\/title\s*>/i);
      if (!m) return bad('no <title> element');
      const title = collapse(decodeEntities(m[1]));
      if (kind === 'sheet') {
        // Sheets are noindex partner collateral, so SEO length rules do not
        // apply — but the file must still identify itself as ours.
        return title.includes('Mowi')
          ? ok(`"${title}" (${title.length} chars)`)
          : bad(`sheet title must contain "Mowi": "${title}"`);
      }
      const problems = [];
      if (title.length < 45 || title.length > 70) {
        problems.push(`length ${title.length}, need 45-70`);
      }
      // The site-wide convention, verified against every blog post.
      if (!title.endsWith(' — Mowi')) problems.push('must end with " — Mowi"');
      return problems.length
        ? bad(`${problems.join('; ')} — "${title}"`)
        : ok(`"${title}" (${title.length} chars)`);
    },
  },

  /* 5 -------------------------------------------------------------- */
  {
    id: 'description',
    appliesTo: ALL,
    run({ description, descriptionParseHint }) {
      if (description === null) {
        return bad(descriptionParseHint || 'no <meta name="description"> found');
      }
      const n = description.length;
      return n >= 120 && n <= 155
        ? ok(`${n} chars`)
        : bad(`${n} chars, need 120-155: "${description}"`);
    },
  },

  /* 6 -------------------------------------------------------------- */
  {
    id: 'canonical',
    appliesTo: ALL,
    run({ src, relPath, kind }) {
      const canon = [...src.matchAll(tagRe('link'))]
        .map((m) => m[0])
        .find((t) => (attr(t, 'rel') || '').toLowerCase() === 'canonical');
      const href = canon ? attr(canon, 'href') : null;

      if (kind === 'sheet') {
        // IT-partner sheets are deliberately unindexed collateral; a canonical
        // would invite Google in through the side door.
        if (href) return bad(`sheet must not carry a canonical, found href="${href}"`);
        const robots = [...src.matchAll(tagRe('meta'))]
          .map((m) => m[0])
          .find((t) => (attr(t, 'name') || '').toLowerCase() === 'robots');
        if (!robots) return bad('sheet needs <meta name="robots" content="noindex">, none found');
        const content = attr(robots, 'content') || '';
        return /noindex/i.test(content)
          ? ok(`noindex, no canonical (robots content="${content}")`)
          : bad(`robots meta does not contain noindex: content="${content}"`);
      }

      if (!canon) return bad('no <link rel="canonical"> found');
      if (!href) return bad(`canonical link has no href: ${collapse(canon)}`);
      const expected = expectedCanonical(relPath);
      return expected.includes(href)
        ? ok(href)
        : bad(`href="${href}", expected "${expected[0]}"`);
    },
  },

  /* 7 -------------------------------------------------------------- */
  {
    id: 'breadcrumb',
    appliesTo: ['lander'],
    run({ mainClean }) {
      // Exact canon lifted from blog/*.html — same class, same &rsaquo;
      // separator, no <nav> wrapper, current page as bare text. The WHOLE shape
      // is matched, not just the "Home &rsaquo;" prefix: a breadcrumb truncated
      // after the first crumb is a real defect that a prefix test waves through.
      // The parent crumb's href may be root-absolute (blog/*.html) or relative
      // extensionless (cookies.html); both forms occur on the live site.
      const re = new RegExp(
        '<p\\b[^>]*' + classTokenRe('blog-breadcrumb', '').source + '[^>]*>'
        + '\\s*<a href="/">Home</a>\\s*&rsaquo;'
        + '\\s*<a href="[^"]+">[^<]+</a>\\s*&rsaquo;'
        + '\\s*[^<\\s][^<]*</p\\s*>');
      if (re.test(mainClean)) return ok('blog-breadcrumb present in <main>, full canon shape');
      const any = mainClean.match(/<p\b[^>]*blog-breadcrumb[\s\S]{0,180}/);
      return bad(any
        ? `breadcrumb does not match canon (Home &rsaquo; <parent> &rsaquo; <page>), found: ${collapse(any[0])}`
        : 'no <p class="blog-breadcrumb"> in <main>');
    },
  },

  /* 8 -------------------------------------------------------------- */
  {
    id: 'jsonld',
    appliesTo: ALL,
    run({ ldBlocks, ldParsed, ldParseError, mainText, kind }) {
      // A malformed block is invisible in the browser but fatal for rich
      // results, so a parse error is always a FAIL regardless of page kind.
      if (ldParseError) return bad(ldParseError);
      if (kind !== 'lander') {
        return ok(`${ldBlocks.length} ld+json block(s), all parse`);
      }

      // Flatten @graph so a single combined block still counts.
      const nodes = [];
      for (const p of ldParsed) {
        if (Array.isArray(p)) nodes.push(...p);
        else if (p && Array.isArray(p['@graph'])) nodes.push(...p['@graph']);
        else if (p) nodes.push(p);
      }
      const faqs = nodes.filter((n) => n && n['@type'] === 'FAQPage');
      if (faqs.length !== 1) {
        return bad(`expected exactly 1 FAQPage node, found ${faqs.length} `
          + `(types present: ${nodes.map((n) => n && n['@type']).join(', ') || 'none'})`);
      }
      const faq = faqs[0];
      if (!Array.isArray(faq.mainEntity)) return bad('FAQPage.mainEntity is not an array');
      if (faq.mainEntity.length < 3 || faq.mainEntity.length > 5) {
        return bad(`FAQPage.mainEntity has ${faq.mainEntity.length} entries, need 3-5`);
      }
      for (let i = 0; i < faq.mainEntity.length; i++) {
        const q = faq.mainEntity[i] || {};
        const name = collapse(decodeEntities(String(q.name || '')));
        if (!name) return bad(`FAQ entry #${i + 1} has no .name`);
        // Google penalises structured data that isn't on the page, so the
        // question text must literally be in the rendered copy — and in <main>,
        // where spec section 4 item 7 puts the visible <h3>. Matching the whole
        // document would let chrome or <title> text satisfy a question.
        if (!mainText.includes(name)) {
          return bad(`FAQ entry #${i + 1} name not found in visible <main> text: "${name}"`);
        }
        const answer = q.acceptedAnswer && q.acceptedAnswer.text;
        if (!answer || !String(answer).trim()) {
          return bad(`FAQ entry #${i + 1} ("${name}") has no acceptedAnswer.text`);
        }
      }
      return ok(`${ldBlocks.length} block(s) parse; FAQPage with ${faq.mainEntity.length} Q&A, all in <main>`);
    },
  },

  /* 9 -------------------------------------------------------------- */
  {
    id: 'cta',
    appliesTo: ALL,
    run({ src, mainClean, kind, chromeCtaCount }) {
      const inMain = countMatches(mainClean, BTN_PRIMARY());
      const inFile = countMatches(src, BTN_PRIMARY());
      if (kind === 'sheet') {
        // Sheets are print/PDF collateral: no signup funnel, no chrome.
        return inMain === 0 && inFile === 0
          ? ok('0 btn-primary (correct for a sheet)')
          : bad(`sheet must have 0 btn-primary, found ${inFile} in file / ${inMain} in <main>`);
      }
      // The chrome contribution is COUNTED from test.html rather than hardcoded,
      // so if the shared chrome ever gains or loses a CTA the error message says
      // so instead of blaming every lander at once. Today that count is 3
      // (mobile nav, header actions, footer CTA), giving the documented total 4.
      const wantInFile = chromeCtaCount + 1;
      const problems = [];
      if (inMain !== 1) problems.push(`${inMain} in <main>, expected 1`);
      if (inFile !== wantInFile) {
        problems.push(`${inFile} in file, expected ${wantInFile} `
          + `(${chromeCtaCount} chrome, counted from test.html, + 1 page)`);
      }
      return problems.length ? bad(problems.join('; ')) : ok(`1 in <main>, ${wantInFile} in file`);
    },
  },

  /* 10 ------------------------------------------------------------- */
  {
    id: 'cta-attrs',
    appliesTo: ['lander'],
    run({ mainClean }) {
      const anchors = [...mainClean.matchAll(tagRe('a'))]
        .map((m) => m[0])
        .filter((t) => hasClass(t, 'btn-primary'));
      if (anchors.length === 0) return bad('no <a class="...btn-primary..."> inside <main>');
      const problems = [];
      for (const tag of anchors) {
        if (attr(tag, 'data-event') !== 'Signup Click') {
          problems.push(`missing data-event="Signup Click": ${collapse(tag)}`);
        }
        if (attr(tag, 'href') !== 'https://my.mowi.agency/aanmelden') {
          problems.push(`wrong or missing href: ${collapse(tag)}`);
        }
      }
      return problems.length ? bad(problems.join(' | ')) : ok('href + data-event correct');
    },
  },

  /* 11 ------------------------------------------------------------- */
  {
    id: 'links',
    appliesTo: ALL,
    run({ src, filePath, repoRoot }) {
      const fileDir = path.dirname(filePath);
      // href AND src, both quoting styles. Landers carry vendor logos, and a
      // missing local image is invisible to the DOM pass's own noise filter, so
      // the static pass is the only thing that can catch it.
      const urls = [...src.matchAll(/\b(?:href|src)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi)]
        .map((m) => (m[1] !== undefined ? m[1] : m[2]));
      const checked = new Set();
      const broken = [];
      for (const href of urls) {
        const r = resolveHref(href, fileDir, repoRoot);
        if (!r) continue;
        if (checked.has(r.resolved + '|' + href)) continue;
        checked.add(r.resolved + '|' + href);
        if (!fs.existsSync(r.resolved)) {
          broken.push(`${href} -> ${path.relative(repoRoot, r.resolved).split(path.sep).join('/')} (missing)`);
        }
      }
      return broken.length
        ? bad(`${broken.length} broken: ${broken.join('; ')}`)
        : ok(`${checked.size} internal href/src target(s) resolve on disk`);
    },
  },

  /* 12 ------------------------------------------------------------- */
  {
    id: 'chrome',
    appliesTo: ['lander', 'page'],
    run({ src, testChrome }) {
      // The header/footer are duplicated into every page by hand. Drift is
      // invisible page-by-page and only shows up as a site that looks subtly
      // different on one URL, so compare byte-for-byte against test.html.
      // The only sanctioned per-page difference is aria-current on the nav link.
      const normalise = (s) => collapse(s.replace(/ aria-current="page"/g, ''));
      const problems = [];
      for (const which of ['header', 'footer']) {
        const mine = normalise(sliceChrome(src, which));
        const canon = testChrome[which];
        const { tag, cls } = CHROME[which];
        if (!mine) { problems.push(`no <${tag} class="${cls}"> block found in page`); continue; }
        if (!canon) { problems.push(`no <${tag} class="${cls}"> block found in test.html`); continue; }
        if (mine === canon) continue;
        let i = 0;
        while (i < mine.length && i < canon.length && mine[i] === canon[i]) i++;
        problems.push(
          `<${tag}> differs at char ${i}\n`
          + `        page:      …${mine.slice(Math.max(0, i - 40), i + 40)}…\n`
          + `        test.html: …${canon.slice(Math.max(0, i - 40), i + 40)}…`);
      }
      return problems.length
        ? bad(problems.join('\n        '))
        : ok('header + footer identical to test.html');
    },
  },

  /* 13 ------------------------------------------------------------- */
  {
    id: 'cachebust',
    appliesTo: ALL,
    run({ src, indexHtml, kind }) {
      // Read live from index.html every run — hardcoding a version here would
      // silently rot the moment someone bumps the real one.
      const css = indexHtml.match(/style\.css\?v=[^"'\s>]+/);
      const js = indexHtml.match(/main\.js\?v=[^"'\s>]+/);
      if (!css || !js) {
        return bad(`could not read cache-bust strings from index.html `
          + `(css: ${css ? css[0] : 'not found'}, js: ${js ? js[0] : 'not found'})`);
      }
      const problems = [];
      const absent = [];
      // EVERY occurrence must carry the current version, not just "the string
      // appears somewhere in the file": a correct <link> followed by a stale
      // copy-pasted second one is the realistic breakage, and a substring test
      // waves it through.
      for (const [label, want, allRe] of [
        ['css', css[0], /style\.css(?:\?v=[^"'\s>]*)?/g],
        ['js', js[0], /main\.js(?:\?v=[^"'\s>]*)?/g],
      ]) {
        const found = [...src.matchAll(allRe)].map((m) => m[0]);
        if (found.length === 0) {
          // A SHEET is a self-contained print one-pager (see generate-it-sheets.js:
          // inline <style>, no external CSS or JS). Not referencing an asset at all
          // means there is no stale version string to catch, so it is fine.
          if (kind === 'sheet') { absent.push(label); continue; }
          problems.push(`${label}: expected "${want}", found no reference at all`);
          continue;
        }
        const wrong = [...new Set(found.filter((f) => f !== want))];
        if (wrong.length) {
          problems.push(`${label}: every reference must be "${want}", found `
            + wrong.map((w) => `"${w}"`).join(', ')
            + ` (${found.length} reference(s) total)`);
        }
      }
      if (problems.length) return bad(problems.join('; '));
      return ok(absent.length
        ? `no ${absent.join('/')} reference (self-contained sheet), nothing stale`
        : `${css[0]} + ${js[0]}`);
    },
  },

  /* 14 ------------------------------------------------------------- */
  {
    id: 'emdash',
    appliesTo: ALL,
    run({ mainClean, description, ldStrings }) {
      // Site rule since 2026-08-19: no em dashes in prose. But the repo is full
      // of legitimate ones — every <title> uses "X — Mowi", and koppelingen.html
      // / pricing.html carry developer notes with em dashes inside HTML
      // comments. So: scan the <main> slice with comments and <script> blocks
      // already removed, plus the meta description, plus every ld+json string
      // (which is published to Google verbatim), and never the whole file.
      // Detection is by DECODED character, so &mdash;, &#8212;, &#08212;,
      // &#x2014; and &#X02014; are all the same hit; no entity spelling escapes.
      const hits = [];
      const scan = (label, text) => {
        if (!text || hits.length >= 5) return;
        const decoded = decodeEntities(text);
        let from = 0;
        for (;;) {
          const i = decoded.indexOf('—', from);
          if (i === -1 || hits.length >= 5) break;
          hits.push(`${label} at ${i}: ${contextAt(decoded, i, 30)}`);
          from = i + 1;
        }
      };
      scan('<main>', mainClean);
      scan('meta description', description);
      ldStrings.forEach((s) => scan('ld+json', s));
      return hits.length
        ? bad(`${hits.length} em dash hit(s): ${hits.join(' | ')}`)
        : ok('no em dash in <main>, meta description or ld+json');
    },
  },

  /* 15 ------------------------------------------------------------- */
  {
    id: 'vendors',
    appliesTo: ALL,
    run({ mainClean, title, description, ldStrings }) {
      // These names were deliberately removed from capability claims on
      // 2026-08-21. Their reappearance is never a typo — it means the loop
      // invented an integration, which needs a human. Scanned everywhere the
      // name would reach a reader or Google: <main>, the <title>, the meta
      // description, and every ld+json string.
      // Case-insensitive, so "Snelstart"/"snelstart"/"EXCEL" are caught too.
      // SAP is the one exception and stays case-sensitive: lowercase "sap" is an
      // ordinary Dutch word, and a brand mention is always the acronym.
      const patterns = [
        /\bSalesforce\b/gi, /\bSnelStart\b/gi, /\bSAP\b/g,
        /\bDynamics 365\b/gi, /\bTwinfield\b/gi, /\bExcel\b/gi,
      ];
      const haystacks = [
        ['<main>', mainClean],
        ['<title>', title || ''],
        ['meta description', description || ''],
        ...ldStrings.map((s) => ['ld+json', s]),
      ];
      const hits = [];
      const seen = new Set();
      for (const re of patterns) {
        for (const [label, text] of haystacks) {
          if (!text) continue;
          re.lastIndex = 0;
          const m = re.exec(text);
          if (!m) continue;
          const key = m[0].toLowerCase();
          if (seen.has(key)) break;
          seen.add(key);
          hits.push(`"${m[0]}" in ${label}: ${contextAt(text, m.index, 40)}`);
          break; // one example per vendor is enough to act on
        }
      }
      return hits.length
        ? bad(`forbidden vendor claim(s): ${hits.join(' | ')}`)
        : ok('no forbidden vendor names in <main>, title, description or ld+json');
    },
  },

  /* 16 ------------------------------------------------------------- */
  {
    id: 'sheet-link',
    appliesTo: ['lander'],
    run({ src, filePath, repoRoot }) {
      const fileDir = path.dirname(filePath);
      const candidates = [...src.matchAll(/\bhref\s*=\s*(?:"([^"]*it-partner-[^"]*)"|'([^']*it-partner-[^']*)')/gi)]
        .map((m) => (m[1] !== undefined ? m[1] : m[2]));
      if (candidates.length === 0) return bad('no href to downloads/it-partner-<slug> found');
      // Deliberately narrow: the four legacy downloads/it-partner-*.pdf files are
      // orphaned pre-batch collateral. Linking one of those instead of building
      // the page's own sheet would otherwise pass this check silently.
      const shape = /(^|\/)downloads\/it-partner-[a-z0-9-]+(\.html)?$/i;
      const wrongShape = [];
      for (const href of candidates) {
        const clean = href.split('#')[0].split('?')[0];
        if (!shape.test(clean)) { wrongShape.push(href); continue; }
        const r = resolveHref(href, fileDir, repoRoot);
        if (r && fs.existsSync(r.resolved)) {
          return ok(`${href} -> ${path.relative(repoRoot, r.resolved).split(path.sep).join('/')}`);
        }
        wrongShape.push(`${href} (does not resolve on disk)`);
      }
      return bad(`no usable downloads/it-partner-<slug>.html link; saw: ${wrongShape.join(', ')}`);
    },
  },

  /* 17 ------------------------------------------------------------- */
  {
    id: 'uform',
    appliesTo: ALL,
    run({ mainText }) {
      // Formal "u" is the house voice. This is a WARN, not a FAIL: quoted
      // customer speech and compound words can legitimately trip it, and a hard
      // stop here would deadlock the loop over a judgement call.
      // Case-insensitive: Dutch sentences routinely START with Je / Jij / Jouw,
      // which is the most common way the rule is broken.
      const hits = [];
      for (const re of [/\bje\b/gi, /\bjij\b/gi, /\bjouw\b/gi, /\bjullie\b/gi]) {
        re.lastIndex = 0;
        const m = re.exec(mainText);
        if (m) hits.push(`"${m[0]}": ${contextAt(mainText, m.index, 35)}`);
      }
      return hits.length
        ? warn(`informal address found (site voice is formal "u"): ${hits.join(' | ')}`)
        : ok('formal "u" throughout <main>');
    },
  },
];

/* ------------------------------------------------------------------ *
 * Optional DOM pass (--dom)
 * ------------------------------------------------------------------ */

async function domCheck(filePath) {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch (e) {
    return warn(`playwright not importable, DOM pass skipped: ${e.message.split('\n')[0]}`);
  }
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (e) {
    // Chromium binary missing is the common case (npx playwright install).
    return warn(`could not launch chromium, DOM pass skipped: ${e.message.split('\n')[0]}`);
  }
  try {
    const page = await browser.newPage();
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const url = (msg.location && msg.location().url) || '';
      consoleErrors.push({ text: msg.text(), url });
    });
    page.on('pageerror', (err) => consoleErrors.push({ text: `uncaught: ${err.message}`, url: '' }));

    await page.goto(pathToFileURL(filePath).href, { waitUntil: 'load' });

    const result = await page.evaluate(() => {
      const out = { h1: document.querySelectorAll('h1').length, main: !!document.querySelector('main'), ld: [] };
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        try { JSON.parse(s.textContent); out.ld.push(null); }
        catch (e) { out.ld.push(e.message); }
      }
      return out;
    });

    const problems = [];
    if (result.h1 !== 1) problems.push(`document.querySelectorAll('h1').length === ${result.h1}, expected 1`);
    if (!result.main) problems.push('no <main> element in the parsed DOM');
    result.ld.forEach((err, i) => { if (err) problems.push(`ld+json #${i + 1} fails in-browser parse: ${err}`); });

    // file:// pages cannot fetch fonts.googleapis.com or plausible.io, and
    // Chromium logs each blocked subresource as a console error. Those are
    // artefacts of loading from disk, not page defects, so they are reported but
    // never fail the run. A failed load whose URL is itself file:// is the
    // opposite: a local asset that is genuinely missing, which IS a defect.
    const isLoadFailure = (t) => /Failed to load resource|net::ERR_/i.test(t);
    const offline = consoleErrors.filter((e) => isLoadFailure(e.text) && !/^file:/i.test(e.url));
    const missingLocal = consoleErrors.filter((e) => isLoadFailure(e.text) && /^file:/i.test(e.url));
    const real = consoleErrors.filter((e) => !isLoadFailure(e.text));
    if (missingLocal.length) {
      problems.push(`local asset(s) failed to load: ${missingLocal.slice(0, 3).map((e) => e.url).join(' | ')}`);
    }
    if (real.length) problems.push(`console error(s): ${real.slice(0, 3).map((e) => e.text).join(' | ')}`);

    if (problems.length) return bad(problems.join('; '));
    const note = offline.length ? ` (${offline.length} off-host file:// resource-load message(s) ignored)` : '';
    return ok(`h1=1, <main> present, ${result.ld.length} ld+json parse in-browser, no console errors${note}`);
  } catch (e) {
    return bad(`DOM pass threw: ${e.message.split('\n')[0]}`);
  } finally {
    // Always: a leaked chromium process would wedge the next loop iteration.
    if (browser) await browser.close().catch(() => {});
  }
}

/* ------------------------------------------------------------------ *
 * Driver
 * ------------------------------------------------------------------ */

function kindOf(filePath) {
  const base = path.basename(filePath);
  if (base.startsWith('it-partner-')) return 'sheet';
  if (base.startsWith('koppeling-')) return 'lander';
  return 'page';
}

/** Every string value inside the parsed ld+json, at any depth. These are
 *  published to Google verbatim, so the em-dash and vendor rules apply to them
 *  exactly as they apply to visible copy. */
function collectStrings(node, out = []) {
  if (typeof node === 'string') out.push(node);
  else if (Array.isArray(node)) node.forEach((n) => collectStrings(n, out));
  else if (node && typeof node === 'object') Object.values(node).forEach((n) => collectStrings(n, out));
  return out;
}

function buildContext(filePath, repoRoot, testHtml, indexHtml) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // `src` is the source with HTML comments removed. Every content gate reads it
  // rather than `raw`, so a commented-out draft block can never satisfy a check.
  // <script> bodies are kept here because <script src="js/main.js?v=..."> is
  // itself a checked value; prose scans use mainClean, which strips them.
  const src = stripComments(raw);
  const main = sliceMain(src);
  const mainClean = stripScripts(main);

  const descTag = [...src.matchAll(tagRe('meta'))]
    .map((m) => m[0])
    .find((t) => (attr(t, 'name') || '').toLowerCase() === 'description');
  const descRaw = descTag ? attr(descTag, 'content') : null;
  // Distinguish "there is no description" from "there is one we failed to read".
  const descriptionParseHint = (!descTag && /name\s*=\s*["']description["']/i.test(src))
    ? 'a name="description" attribute is present but the <meta> tag could not be parsed; check its quoting'
    : null;

  const titleMatch = src.match(/<title[^>]*>([\s\S]*?)<\/title\s*>/i);

  const ldBlocks = [...src.matchAll(
    /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script\s*>/gi)];
  const ldParsed = [];
  let ldParseError = null;
  for (let i = 0; i < ldBlocks.length; i++) {
    try {
      ldParsed.push(JSON.parse(ldBlocks[i][1]));
    } catch (e) {
      ldParseError = `ld+json block #${i + 1} does not parse: ${e.message}`;
      break;
    }
  }
  const ldStrings = ldParseError ? [] : collectStrings(ldParsed);

  const testChrome = {
    header: collapse(sliceChrome(stripComments(testHtml), 'header').replace(/ aria-current="page"/g, '')),
    footer: collapse(sliceChrome(stripComments(testHtml), 'footer').replace(/ aria-current="page"/g, '')),
  };
  const chromeCtaCount = countMatches(testChrome.header + ' ' + testChrome.footer, BTN_PRIMARY());

  return {
    raw,
    src,
    main,
    mainClean,
    mainText: visibleText(mainClean),
    // Whole-document visible copy, kept for anything that legitimately needs it.
    pageText: visibleText(stripCommentsAndScripts(raw)),
    title: titleMatch ? collapse(decodeEntities(titleMatch[1])) : null,
    description: descRaw === undefined || descRaw === null ? null : decodeEntities(descRaw).trim(),
    descriptionParseHint,
    ldBlocks,
    ldParsed,
    ldParseError,
    ldStrings,
    filePath,
    relPath: path.relative(repoRoot, filePath),
    repoRoot,
    testHtml,
    testChrome,
    chromeCtaCount,
    indexHtml,
    kind: kindOf(filePath),
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const wantDom = argv.includes('--dom');
  const files = argv.filter((a) => a !== '--dom');

  if (files.length === 0) {
    console.error('usage: node ralph/verify.mjs [--dom] <file.html> [...more files]');
    process.exit(1);
  }

  const repoRoot = process.cwd();
  const testPath = path.join(repoRoot, 'test.html');
  const indexPath = path.join(repoRoot, 'index.html');
  if (!fs.existsSync(testPath) || !fs.existsSync(indexPath)) {
    console.error(`verify: run this from the repo root — test.html/index.html not found in ${repoRoot}`);
    process.exit(1);
  }
  const testHtml = fs.readFileSync(testPath, 'utf8');
  const indexHtml = fs.readFileSync(indexPath, 'utf8');

  let totalChecks = 0;
  let failures = 0;
  let warnings = 0;
  let skips = 0;

  for (const f of files) {
    const filePath = path.resolve(repoRoot, f);
    const rel = path.relative(repoRoot, filePath).split(path.sep).join('/');

    if (!fs.existsSync(filePath)) {
      console.log(`\n=== ${rel} ===`);
      console.log('  FAIL  file          does not exist on disk');
      totalChecks++; failures++;
      continue;
    }

    const ctx = buildContext(filePath, repoRoot, testHtml, indexHtml);
    console.log(`\n=== ${rel}  [${ctx.kind}] ===`);

    for (const check of CHECKS) {
      totalChecks++;
      let res;
      if (!check.appliesTo.includes(ctx.kind)) {
        res = { status: 'SKIP', detail: `not applicable to a ${ctx.kind}` };
      } else {
        try {
          res = check.run(ctx);
        } catch (e) {
          res = bad(`check threw: ${e.message}`);
        }
      }
      if (res.status === 'FAIL') failures++;
      if (res.status === 'WARN') warnings++;
      if (res.status === 'SKIP') skips++;
      console.log(`  ${res.status.padEnd(4)}  ${check.id.padEnd(12)}  ${res.detail}`);
    }

    if (wantDom) {
      totalChecks++;
      const res = await domCheck(filePath);
      if (res.status === 'FAIL') failures++;
      if (res.status === 'WARN') warnings++;
      console.log(`  ${res.status.padEnd(4)}  ${'dom'.padEnd(12)}  ${res.detail}`);
    }
  }

  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  // Skips are in the summary on purpose: a file the driver classified as a
  // generic `page` when a lander was intended silently skips breadcrumb,
  // cta-attrs, sheet-link and the whole FAQ half of jsonld. A skip count that
  // does not match the page kind is the visible symptom of a misnamed file.
  console.log(`\nverify: ${plural(files.length, 'file')}, ${plural(totalChecks, 'check')}, `
    + `${plural(failures, 'failure')}, ${plural(warnings, 'warning')}, ${plural(skips, 'skip')}`);

  process.exit(failures > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(`verify: fatal — ${e.stack || e.message}`);
  process.exit(1);
});
